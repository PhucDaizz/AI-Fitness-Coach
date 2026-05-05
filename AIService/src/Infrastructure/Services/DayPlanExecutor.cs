using AIService.Application.Common.Interfaces;
using AIService.Application.DTOs.Workout;
using AIService.Infrastructure.AI.Plugins;
using Microsoft.Extensions.Logging;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using System.Text;
using System.Text.Json;

namespace AIService.Infrastructure.Services
{
    public class DayPlanExecutor : IDayPlanExecutor
    {
        private readonly IWorkoutIntegrationService _integrationService;
        private readonly ExercisePlugin _exercisePlugin;
        private readonly IChatCompletionService _llm;
        private readonly ILogger<DayPlanExecutor> _logger;
        private readonly IUnitOfWork _unitOfWork;

        public DayPlanExecutor(
            IWorkoutIntegrationService integrationService,
            ExercisePlugin exercisePlugin,
            Kernel kernel,
            ILogger<DayPlanExecutor> logger, 
            IUnitOfWork unitOfWork)
        {
            _integrationService = integrationService;
            _exercisePlugin = exercisePlugin;
            _llm = kernel.GetRequiredService<IChatCompletionService>("pt_plant");
            _logger = logger;
            _unitOfWork = unitOfWork;
        }

        public async Task<bool> AdjustDifficultyAsync(string direction, CancellationToken ct = default)
        {
            var (planId, nextDay, profile) = await LoadContextAsync(ct);
            if (planId == null || nextDay == null) return false;

            if (nextDay.Exercises != null && nextDay.Exercises.Any())
            {
                var exerciseIds = nextDay.Exercises.Select(e => e.ExerciseId).Distinct().ToList();

                var exerciseNameMap = await _unitOfWork.ExerciseRepository.GetExerciseNamesByIdsAsync(exerciseIds, ct);

                foreach (var ex in nextDay.Exercises)
                {
                    if (exerciseNameMap.TryGetValue(ex.ExerciseId, out var name))
                    {
                        ex.Name = name; 
                    }
                    else
                    {
                        ex.Name = "Unknown Exercise";
                    }
                }
            }


            var difficultyKeyword = direction == "harder"
                ? "advanced heavy compound"
                : "beginner light isolation";

            var query = $"{nextDay.MuscleFocus} {difficultyKeyword}";
            var exerciseContext = await SearchExercisesAsync(query, profile, ct);
            if (exerciseContext == null) return false;

            var payload = await GenerateDayPlanAsync(
                mode: "adjust",
                newGoal: nextDay.MuscleFocus, 
                direction: direction,
                nextDay: nextDay,
                profile: profile!,
                exerciseContext: exerciseContext,
                ct: ct);

            if (payload == null || !payload.Exercises.Any()) return false;

            return await _integrationService
                .ReplaceEntireDayAsync(planId, nextDay.DayId, payload, ct);
        }

        public async Task<bool> RegenerateDayAsync(
            string newGoal,
            CancellationToken ct = default)
        {
            var (planId, nextDay, profile) = await LoadContextAsync(ct);
            if (planId == null || nextDay == null) return false;

            var exerciseContext = await SearchExercisesAsync(newGoal, profile, ct);
            if (exerciseContext == null) return false;

            var payload = await GenerateDayPlanAsync(
                mode: "regenerate",
                newGoal: newGoal,
                direction: null,
                nextDay: nextDay,
                profile: profile!,
                exerciseContext: exerciseContext,
                ct: ct);

            if (payload == null || !payload.Exercises.Any()) return false;

            return await _integrationService
                .ReplaceEntireDayAsync(planId, nextDay.DayId, payload, ct);
        }

        // ── Helpers ───────────────────────────────────────────────

        private async Task<(string? PlanId, CalendarDayDto? NextDay, UserProfileDto? Profile)> LoadContextAsync(CancellationToken ct)
        {
            var planIdTask = _integrationService.GetActivePlanIdAsync(ct);
            var profileTask = _integrationService.GetProfileAsync(ct);

            var planId = await planIdTask;
            var profile = await profileTask;

            if (string.IsNullOrEmpty(planId))
            {
                _logger.LogWarning("[DayExecutor] No active plan.");
                return (null, null, null);
            }

            var calendar = await _integrationService.GetPlanCalendarAsync(planId, ct);
            var nextDay = calendar
                .OrderBy(d => d.ScheduledDate)
                .FirstOrDefault(d => d.Status == "upcoming");

            if (nextDay == null)
            {
                _logger.LogWarning("[DayExecutor] No upcoming day in plan {PlanId}.", planId);
                return (null, null, null);
            }

            _logger.LogInformation(
                "[DayExecutor] Context loaded. Plan: {P}, Day: {D} ({Date}), Level: {L}",
                planId, nextDay.DayId, nextDay.ScheduledDate,
                profile?.FitnessLevel ?? "unknown");

            return (planId, nextDay, profile);
        }

        private async Task<string?> SearchExercisesAsync(
            string query,
            UserProfileDto? profile,
            CancellationToken ct)
        {
            var location = profile?.Environment ?? "gym";
            var level = profile?.FitnessLevel ?? "intermediate";

            var enrichedQuery = location == "home"
                ? $"{query} home bodyweight {level}"
                : $"{query} gym {level}";

            var result = await _exercisePlugin.SearchExercisesAsync(enrichedQuery, ct);

            if (string.IsNullOrEmpty(result) || result.StartsWith("No exercises"))
            {
                _logger.LogWarning("[DayExecutor] No exercises for query: {Q}", enrichedQuery);
                return null;
            }

            return result;
        }

        private async Task<ReplaceDayRequestDto?> GenerateDayPlanAsync(
            string mode,
            string newGoal,
            string? direction,
            CalendarDayDto nextDay,
            UserProfileDto profile,
            string exerciseContext,
            CancellationToken ct)
        {
            // Build current exercises context — LLM biết đang thay gì
            var currentExercisesText = nextDay.Exercises?.Any() == true
                ? BuildCurrentExercisesText(nextDay.Exercises)
                : "No current exercises available.";

            // Build profile context — dùng đầy đủ profile
            var profileText = BuildProfileText(profile);

            // Build instruction theo mode
            var instruction = mode == "adjust"
                ? BuildAdjustInstruction(direction!, nextDay.MuscleFocus)
                : BuildRegenerateInstruction(newGoal);

            var history = new ChatHistory("""
                You are a Personal Trainer AI specialized in single-day workout design.
                Output ONLY valid JSON. No markdown, no explanation.
                """);

            history.AddUserMessage($$"""
                === TASK ===
                {{instruction}}

                === USER PROFILE ===
                {{profileText}}

                === CURRENT DAY BEING REPLACED ===
                - Scheduled Date: {{nextDay.ScheduledDate:yyyy-MM-dd}}
                - Current Muscle Focus: {{nextDay.MuscleFocus}}
                - Current Exercises:
                {{currentExercisesText}}

                === AVAILABLE EXERCISES (ONLY use IDs from this list) ===
                {{exerciseContext}}

                === STRICT RULES (CRITICAL) ===
                1. Select 4-6 exercises ONLY from AVAILABLE EXERCISES above.
                2. 'exerciseId' MUST be a STRING in double quotes (e.g., "123"). Never raw numbers.
                3. NEVER invent or guess IDs not present in the list.
                4. Respect user's SessionMinutes ({{profile.SessionMinutes}} min) — do not overload.
                5. Respect injuries: {{(string.IsNullOrEmpty(profile.Injuries) ? "None" : profile.Injuries)}}.
                6. muscleFocus must be in Vietnamese.
                7. Adjust sets/reps/rest based on fitness level '{{profile.FitnessLevel}}':
                   - beginner     → 2-3 sets, 12-15 reps, 60s rest
                   - intermediate → 3-4 sets, 8-12 reps, 75s rest
                   - advanced     → 4-5 sets, 5-8 reps, 90s rest

                === OUTPUT FORMAT ===
                {
                  "muscleFocus": "Mô tả nhóm cơ bằng tiếng Việt",
                  "exercises": [
                    {
                      "exerciseId": "123",
                      "sets": 3,
                      "reps": "12-15",
                      "restSeconds": 60,
                      "notes": "...",
                      "orderIndex": 1
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

        // ── Text builders ─────────────────────────────────────────

        private static string BuildProfileText(UserProfileDto profile)
        {
            var age = profile.DateOfBirth.HasValue
                ? (int)((DateTime.UtcNow - profile.DateOfBirth.Value).TotalDays / 365)
                : 0;

            return new StringBuilder()
                .AppendLine($"- Gender: {profile.Gender}")
                .AppendLine($"- Age: {(age > 0 ? age : "unknown")}")
                .AppendLine($"- Weight: {profile.WeightKg}kg | Height: {profile.HeightCm}cm")
                .AppendLine($"- Fitness Level: {profile.FitnessLevel}")
                .AppendLine($"- Goal: {profile.FitnessGoal}")
                .AppendLine($"- Environment: {profile.Environment}")
                .AppendLine($"- Session Duration: {profile.SessionMinutes} minutes")
                .AppendLine($"- Equipment: {(profile.Equipment.Any() ? string.Join(", ", profile.Equipment) : "none")}")
                .AppendLine($"- Injuries: {(string.IsNullOrEmpty(profile.Injuries) ? "none" : profile.Injuries)}")
                .ToString();
        }

        private static string BuildCurrentExercisesText(
            IEnumerable<CurrentExerciseDto> exercises)
        {
            var sb = new StringBuilder();
            foreach (var ex in exercises)
            {
                sb.AppendLine($"  - [{ex.ExerciseId}] {ex.Name}: " +
                              $"{ex.Sets} sets x {ex.Reps} reps, {ex.RestSeconds}s rest");
            }
            return sb.ToString();
        }

        private static string BuildRegenerateInstruction(string newGoal) =>
            $"Replace ALL exercises for this day with a completely new session focused on: '{newGoal}'. " +
            $"The muscle focus will change to match the new goal.";

        private static string BuildAdjustInstruction(string direction, string currentFocus) =>
            direction == "harder"
                ? $"Keep the same muscle focus '{currentFocus}' but replace exercises with " +
                  $"HARDER, more challenging alternatives. Increase sets or weight range."
                : $"Keep the same muscle focus '{currentFocus}' but replace exercises with " +
                  $"EASIER, more accessible alternatives. Reduce complexity and intensity.";

        private ReplaceDayRequestDto? ParseDayPlan(string json, string goal)
        {
            var cleaned = json
                .Replace("```json", "")
                .Replace("```", "")
                .Trim();

            _logger.LogInformation(
                "[DayExecutor] RAW JSON for '{Goal}':\n{Json}", goal, cleaned);

            try
            {
                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };
                options.Converters.Add(new StringOrIntConverter());

                var payload = JsonSerializer.Deserialize<ReplaceDayRequestDto>(
                    cleaned, options);

                if (payload == null) return null;

                for (int i = 0; i < payload.Exercises.Count; i++)
                    payload.Exercises[i].OrderIndex = i + 1;

                _logger.LogInformation(
                    "[DayExecutor] OK. {E} exercises.", payload.Exercises.Count);

                return payload;
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "[DayExecutor] JSON parse failed for '{Goal}'", goal);
                return null;
            }
        }
    }
}