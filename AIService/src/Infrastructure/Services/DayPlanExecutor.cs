using AIService.Application.Common.Interfaces;
using AIService.Application.DTOs.Workout;
using AIService.Infrastructure.AI.Plugins;
using Microsoft.Extensions.Logging;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using System.Text.Json;

namespace AIService.Infrastructure.Services
{
    public class DayPlanExecutor : IDayPlanExecutor
    {
        private readonly IWorkoutIntegrationService _integrationService;
        private readonly ExercisePlugin _exercisePlugin;
        private readonly IChatCompletionService _llm;
        private readonly ILogger<DayPlanExecutor> _logger;

        public DayPlanExecutor(
            IWorkoutIntegrationService integrationService,
            ExercisePlugin exercisePlugin,
            Kernel kernel,
            ILogger<DayPlanExecutor> logger)
        {
            _integrationService = integrationService;
            _exercisePlugin = exercisePlugin;
            _llm = kernel.GetRequiredService<IChatCompletionService>("pt_plant");
            _logger = logger;
        }

        public async Task<bool> RegenerateDayAsync(
            string newGoal,
            CancellationToken ct = default)
        {
            // ── Bước 1: Lấy plan active + ngày tiếp theo ─────────
            var planId = await _integrationService.GetActivePlanIdAsync(ct);
            if (string.IsNullOrEmpty(planId))
            {
                _logger.LogWarning("[DayExecutor] No active plan found.");
                return false;
            }

            var calendar = await _integrationService.GetPlanCalendarAsync(planId, ct);
            var nextDay = calendar
                .OrderBy(d => d.ScheduledDate)
                .FirstOrDefault(d => d.Status == "upcoming");

            if (nextDay == null)
            {
                _logger.LogWarning("[DayExecutor] No upcoming day found in plan {PlanId}.", planId);
                return false;
            }

            _logger.LogInformation(
                "[DayExecutor] Regenerating day {DayId} ({Date}) with goal: {Goal}",
                nextDay.DayId, nextDay.ScheduledDate, newGoal);

            // ── Bước 2: Lấy profile để enrich query ──────────────
            var profile = await _integrationService.GetProfileAsync(ct);
            var location = profile?.Environment ?? "gym";

            // ── Bước 3: Search exercises — enrich theo environment ─
            var enrichedQuery = location == "home"
                ? $"{newGoal} home bodyweight recovery"
                : $"{newGoal} gym";

            var exerciseContext = await _exercisePlugin
                .SearchExercisesAsync(enrichedQuery, ct);

            if (string.IsNullOrEmpty(exerciseContext) ||
                exerciseContext.StartsWith("No exercises"))
            {
                _logger.LogWarning(
                    "[DayExecutor] No exercises found for goal: {Goal}", newGoal);
                return false;
            }

            // ── Bước 4: LLM sinh JSON plan cho 1 ngày ────────────
            var replacePayload = await GenerateDayPlanAsync(
                newGoal, nextDay, exerciseContext, location, ct);

            if (replacePayload == null || !replacePayload.Exercises.Any())
            {
                _logger.LogWarning("[DayExecutor] LLM returned empty plan.");
                return false;
            }

            // ── Bước 5: Gọi Node service thay thế ngày ───────────
            return await _integrationService
                .ReplaceEntireDayAsync(planId, nextDay.DayId, replacePayload, ct);
        }

        private async Task<ReplaceDayRequestDto?> GenerateDayPlanAsync(
            string newGoal,
            CalendarDayDto nextDay,
            string exerciseContext,
            string location,
            CancellationToken ct)
        {
            var history = new ChatHistory("""
                You are a Personal Trainer AI specialized in single-day workout design.
                Your job is to redesign ONE workout day based on the user's new goal.
                Output ONLY valid JSON. No markdown, no explanation.
                """);

            history.AddUserMessage($$"""
                === NEW GOAL FOR THIS SESSION ===
                {{newGoal}}

                === SESSION INFO ===
                - Scheduled Date: {{nextDay.ScheduledDate:yyyy-MM-dd}}
                - Current Muscle Focus: {{nextDay.MuscleFocus}}
                - Training Location: {{location}}

                === AVAILABLE EXERCISES (ONLY use IDs from this list) ===
                {{exerciseContext}}

                === STRICT RULES (CRITICAL) ===
                1. Select 4-6 exercises ONLY from AVAILABLE EXERCISES above.
                2. 'exerciseId' MUST be a STRING in double quotes (e.g., "123"). Never raw numbers.
                3. NEVER invent or guess exercise IDs not present in the list.
                4. Adjust sets/reps/rest to match the new goal:
                   - Recovery/light  → 2-3 sets, high reps (15-20), short rest (30-45s)
                   - Moderate        → 3 sets, medium reps (10-15), rest 60s
                   - Strength        → 4-5 sets, low reps (5-8), long rest (90-120s)
                5. muscleFocus must be in Vietnamese.

                === OUTPUT FORMAT ===
                {
                  "muscleFocus": "Mô tả nhóm cơ bằng tiếng Việt",
                  "exercises": [
                    {
                      "exerciseId": "123",
                      "sets": 3,
                      "reps": "15-20",
                      "restSeconds": 45,
                      "notes": "Keep movements slow and controlled",
                      "orderIndex": 1
                    },
                    {
                      "exerciseId": "456",
                      "sets": 3,
                      "reps": "15",
                      "restSeconds": 45,
                      "notes": "Focus on breathing",
                      "orderIndex": 2
                    }
                  ]
                }
                """);

            var settings = new PromptExecutionSettings
            {
                FunctionChoiceBehavior = FunctionChoiceBehavior.None()
            };

            var result = await _llm.GetChatMessageContentAsync(
                history, settings, cancellationToken: ct);

            return ParseDayPlan(result.Content!, newGoal);
        }

        private ReplaceDayRequestDto? ParseDayPlan(string json, string newGoal)
        {
            var cleaned = json
                .Replace("```json", "")
                .Replace("```", "")
                .Trim();

            _logger.LogInformation(
                "[DayExecutor] RAW JSON for goal '{Goal}':\n{Json}", newGoal, cleaned);

            try
            {
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };
                options.Converters.Add(new StringOrIntConverter());

                var payload = JsonSerializer.Deserialize<ReplaceDayRequestDto>(
                    cleaned, options);

                if (payload == null)
                {
                    _logger.LogWarning("[DayExecutor] Deserialized payload is null.");
                    return null;
                }

                for (int i = 0; i < payload.Exercises.Count; i++)
                    payload.Exercises[i].OrderIndex = i + 1;

                _logger.LogInformation(
                    "[DayExecutor] Plan OK. {E} exercises for '{Goal}'",
                    payload.Exercises.Count, newGoal);

                return payload;
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex,
                    "[DayExecutor] JSON parse failed for goal '{Goal}'", newGoal);
                return null;
            }
        }
    }
}