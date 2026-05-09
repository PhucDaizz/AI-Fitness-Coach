using AIService.Application.Common.Interfaces;
using AIService.Application.DTOs.Workout;
using AIService.Application.Features.Workout.Commands.GeneratePlan.Models;
using AIService.Infrastructure.AI.Plugins;
using AIService.Infrastructure.Services.Helpers;
using Microsoft.Extensions.Logging;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using System.Text;
using System.Text.Json;

namespace AIService.Infrastructure.Services
{
    public class WeekPlanExecutor : IWeekPlanExecutor
    {
        private readonly IChatCompletionService _llm;
        private readonly ExercisePlugin _exercisePlugin;
        private readonly ILogger<WeekPlanExecutor> _logger;

        public WeekPlanExecutor(Kernel kernel,
            ExercisePlugin exercisePlugin,
            ILogger<WeekPlanExecutor> logger)
        {
            _llm = kernel.GetRequiredService<IChatCompletionService>("pt_plant");
            _exercisePlugin = exercisePlugin;
            _logger = logger;
        }

        public async Task<WorkoutPlanPayloadDto> ExecuteWeekAsync(WeekBlueprint week, UserProfileDto profile, string startsAt, CancellationToken ct = default)
        {
            _logger.LogInformation(
                "[Executor] Week {W}: searching exercises for {D} days",
                week.WeekNumber, week.Days.Count);

            // ── Bước 1: Search song song 
            var searchTasks = week.Days.Select(day =>
                SearchExercisesForDayAsync(day, profile, ct));

            var dayExercises = await Task.WhenAll(searchTasks);

            // ── Bước 2: Build context 
            var exerciseContext = ExecutorPromptBuilder.BuildExerciseContext(week.Days, dayExercises);
            
            // ── Bước 3: Build safety constraints
            var safetyBlock = ExecutorPromptBuilder.BuildSafetyBlock(profile);
            var intensityBlock = ExecutorPromptBuilder.BuildIntensityBlock(week, profile);
            var equipmentBlock = ExecutorPromptBuilder.BuildEquipmentBlock(profile);
            var exerciseCount = ExecutorPromptBuilder.GetExerciseCount(profile.SessionMinutes);

            var history = new ChatHistory("""
                You are a workout plan builder.
                Create a structured workout plan JSON using ONLY exercises from the provided context.
                NEVER invent exercise IDs. Output ONLY valid JSON, no markdown.
                """);

            history.AddUserMessage($$"""
                === WEEK {{week.WeekNumber}} BLUEPRINT ===
                Focus: {{week.Focus}}
                Days to schedule: {{string.Join(", ", week.Days.Select(d => d.DayOfWeek))}}

                === USER INFO ===
                - Fitness Level: {{profile.FitnessLevel}}
                - Environment: {{profile.Environment}}
                - Session Duration: {{profile.SessionMinutes}} minutes

                {{safetyBlock}}

                {{equipmentBlock}}

                {{intensityBlock}}

                === AVAILABLE EXERCISES (Use ONLY IDs from this list) ===
                {{exerciseContext}}

                === STRICT RULES (CRITICAL) ===
                1. FULL COVERAGE: Generate an entry for EVERY DAY in "Days to schedule". No skipping.
                2. EXERCISE COUNT: Select {{exerciseCount}} per day based on session duration.
                3. NO REDUNDANCY: Each exercise in one day must be a distinct movement pattern.
                   If "Dumbbell Chest Press" is selected, do NOT also add "Benchpress Dumbbells".
                4. MUSCLE FOCUS STRICT: Only select exercises matching the day's muscleFocus.
                   Do NOT put chest exercises on a back day.
                5. STRING IDs: exerciseId MUST be a STRING in double quotes e.g. "123". Never raw numbers.
                6. REST SECONDS: Must be between 30 and 180. Never 0, never above 180.
                7. REPS FORMAT: Use range "8-12" or single "15". Never empty string.
                8. LANGUAGE: All content in the 'notes' field MUST be written strictly in Vietnamese.

                === OUTPUT FORMAT ===
                {
                  "title": "Tuần {{week.WeekNumber}} - {{week.Focus}}",
                  "planType": "weekly",
                  "weekNumber": {{week.WeekNumber}},
                  "aiModelUsed": "Gemini-MultiAgent",
                  "startsAt": "{{ComputeWeekStart(startsAt, week.WeekNumber)}}",
                  "days": [
                    {
                      "dayOfWeek": "Monday",
                      "muscleFocus": "Ngực - Tay trước",
                      "orderIndex": 1,
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
                  ]
                }
                """);

            var settings = new PromptExecutionSettings
            {
                FunctionChoiceBehavior = FunctionChoiceBehavior.None()
            };

            var result = await _llm.GetChatMessageContentAsync(
                history, settings, cancellationToken: ct);

            var payload = ParseWeekPlan(result.Content!, week.WeekNumber);

            // ── Bước 4: Post-parse safety validation
            ExecutorSanitizer.ValidateAndSanitize(payload, profile, _logger);

            return payload;
        }

        private async Task<string> SearchExercisesForDayAsync(
            DayBlueprint day,
            UserProfileDto profile,
            CancellationToken cancellationToken)
        {
            var query = new StringBuilder(day.ExerciseKeywords);

            var environment = profile.Environment?.ToLower() ?? "gym";

            switch (profile.Environment?.ToLower())
            {
                case "home":
                    query.Append(profile.Equipment.Any()
                        ? $" home {string.Join(" ", profile.Equipment.Take(3))}"
                        : " home bodyweight no equipment");
                    break;
                case "outdoor":
                    query.Append(" outdoor bodyweight calisthenics");
                    break;
                default:
                    query.Append(" gym");
                    break;
            }

            return await _exercisePlugin.SearchExercisesAsync(query.ToString(), cancellationToken);
        }

        private static string ComputeWeekStart(string startsAt, int weekNumber)
        {
            if (DateTime.TryParseExact(startsAt, "yyyy-MM-dd",
                System.Globalization.CultureInfo.InvariantCulture,
                System.Globalization.DateTimeStyles.None, out var start))
            {
                return start.AddDays((weekNumber - 1) * 7).ToString("yyyy-MM-dd");
            }
            return DateTime.UtcNow.AddDays((weekNumber - 1) * 7).ToString("yyyy-MM-dd");
        }

        private WorkoutPlanPayloadDto ParseWeekPlan(string json, int weekNumber)
        {
            var cleaned = json
                .Replace("```json", "")
                .Replace("```", "")
                .Trim();

            _logger.LogInformation(
                "[Executor] RAW JSON Week {W}:\n{Json}", weekNumber, cleaned);

            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };
            options.Converters.Add(new StringOrIntConverter());

            var payload = JsonSerializer.Deserialize<WorkoutPlanPayloadDto>(cleaned, options)
                ?? throw new InvalidOperationException(
                    $"LLM trả về JSON không hợp lệ cho tuần {weekNumber}.");

            if (!payload.Days.Any())
                throw new InvalidOperationException($"Tuần {weekNumber} không có ngày tập.");

            payload.WeekNumber = weekNumber;

            _logger.LogInformation(
                "[Executor] Week {W} parsed. {D} days, {E} exercises",
                weekNumber,
                payload.Days.Count,
                payload.Days.Sum(d => d.Exercises?.Count ?? 0));

            return payload;
        }
    }
}
