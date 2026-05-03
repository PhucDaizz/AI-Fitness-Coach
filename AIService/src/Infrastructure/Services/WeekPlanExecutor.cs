using AIService.Application.Common.Interfaces;
using AIService.Application.DTOs.Workout;
using AIService.Application.Features.Workout.Commands.GeneratePlan.Models;
using AIService.Infrastructure.AI.Plugins;
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

            // ── Bước 1: Search exercises từng ngày song song ─────
            var searchTasks = week.Days.Select(day =>
                SearchExercisesForDayAsync(day, profile, ct));

            var dayExercises = await Task.WhenAll(searchTasks);

            // ── Bước 2: LLM2 sinh JSON plan cho tuần này ─────────
            var exerciseContext = BuildExerciseContext(week.Days, dayExercises);

            var history = new ChatHistory("""
                You are a workout plan builder.
                Create a structured workout plan JSON using ONLY exercises from the provided context.
                NEVER invent exercise IDs. Output ONLY valid JSON, no markdown.
                """);

            var injuryWarning = profile.Injuries.Any()
                ? $"CRITICAL: User has injuries [{string.Join(", ", profile.Injuries)}]. Avoid any exercise that stresses these areas."
                : "";

            history.AddUserMessage($$"""
                === WEEK {{week.WeekNumber}} BLUEPRINT ===
                Focus: {{week.Focus}}
                Days to schedule: {{string.Join(", ", week.Days.Select(d => d.DayOfWeek))}}

                === USER INFO ===
                - Fitness Level: {{profile.FitnessLevel}}
                - Environment: {{profile.Environment}}
                - {{injuryWarning}}

                === AVAILABLE EXERCISES (use these Integer IDs) ===
                {{exerciseContext}}

                === STRICT RULES (CRITICAL) ===
                1. You MUST generate an object inside the "days" array for EVERY SINGLE DAY listed in "Days to schedule". Do not skip any days!
                2. For each day, you MUST select 4-6 exercises from the AVAILABLE EXERCISES.
                3. DO NOT just copy the output example. You must generate the full plan for all requested days.
                4. CRITICAL: 'exerciseId' MUST BE A STRING wrapped in double quotes (e.g., "123"). DO NOT output raw numbers!

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

            return ParseWeekPlan(result.Content!, week.WeekNumber);
        }

        private async Task<string> SearchExercisesForDayAsync(
            DayBlueprint day,
            UserProfileDto profile,
            CancellationToken cancellationToken)
        {
            var enrichedQuery = profile.Environment == "home"
                ? $"{day.ExerciseKeywords} home bodyweight"
                : $"{day.ExerciseKeywords} gym";

            var result = await _exercisePlugin.SearchExercisesAsync(
                enrichedQuery, cancellationToken);

            return result;
        }

        private static string BuildExerciseContext(
            List<DayBlueprint> days,
            string[] dayExercises)
        {
            var sb = new StringBuilder();
            for (int i = 0; i < days.Count; i++)
            {
                sb.AppendLine($"--- {days[i].DayOfWeek.ToUpper()} ({days[i].MuscleFocus}) ---");
                sb.AppendLine(dayExercises[i]);
                sb.AppendLine();
            }
            return sb.ToString();
        }

        private static string ComputeWeekStart(string startsAt, int weekNumber)
        {
            if (string.IsNullOrWhiteSpace(startsAt))
            {
                return DateTime.UtcNow.AddDays((weekNumber - 1) * 7).ToString("yyyy-MM-dd");
            }

            bool isValidDate = DateTime.TryParseExact(
                startsAt,
                "yyyy-MM-dd",
                System.Globalization.CultureInfo.InvariantCulture,
                System.Globalization.DateTimeStyles.None,
                out var startDate);

            if (isValidDate)
            {
                return startDate.AddDays((weekNumber - 1) * 7).ToString("yyyy-MM-dd");
            }

            return DateTime.UtcNow.AddDays((weekNumber - 1) * 7).ToString("yyyy-MM-dd");
        }

        private WorkoutPlanPayloadDto ParseWeekPlan(string json, int weekNumber)
        {
            var cleaned = json
                .Replace("```json", "")
                .Replace("```", "")
                .Trim();

            _logger.LogInformation("[Executor] RAW JSON Week {W}:\n{Json}", weekNumber, cleaned);


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

            foreach (var day in payload.Days)
            {
                day.DayOfWeek = DayOfWeekConstants.Normalize(day.DayOfWeek);
                day.Exercises ??= new List<WorkoutExerciseDto>();
            }

            payload.WeekNumber = weekNumber;

            _logger.LogInformation(
                "[Executor] Week {W} OK. {D} days, {E} total exercises",
                weekNumber,
                payload.Days.Count,
                payload.Days.Sum(d => d.Exercises?.Count ?? 0));

            return payload;
        }
    }
}
