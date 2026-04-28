using AIService.Application.Common.Interfaces;
using AIService.Application.DTOs.Workout;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.SemanticKernel;
using System.ComponentModel;
using System.Text.Json;

namespace AIService.Infrastructure.AI.Plugins
{
    public class WorkoutPlanPlugin
    {
        private readonly IServiceProvider _sp;

        public WorkoutPlanPlugin(IServiceProvider sp)
        {
            _sp = sp;
        }

        [KernelFunction("create_workout_plan")]
        [Description("""
            Create a personalized workout plan for the user and save it to the system.
            Use when user asks to: create a workout plan, generate a training schedule,
            make a weekly/monthly gym plan, design a workout routine.
            The plan must include specific exercises from the database.
            """)]
        public async Task<string> CreateWorkoutPlanAsync(
            [Description("Title of the workout plan in Vietnamese")]
            string title,

            [Description("Plan type: 'weekly' or 'monthly'")]
            string planType,

            [Description("Week number: 1 to 4")]
            int weekNumber,

            [Description("Start date in format yyyy-MM-dd, e.g. 2026-04-24")]
            string startsAt,

            [Description("""
                JSON array of workout days. Each day must follow this structure:
                [
                  {
                    "dayOfWeek": "Monday",
                    "muscleFocus": "Ngực - Tay trước",
                    "orderIndex": 1,
                    "exercises": [
                      {
                        "exerciseId": "<uuid from search_exercises>",
                        "sets": 3,
                        "reps": "12-15",
                        "restSeconds": 60,
                        "notes": "optional note",
                        "orderIndex": 1
                      }
                    ]
                  }
                ]
                dayOfWeek values: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
                IMPORTANT: exerciseId must be real UUIDs from search_exercises results.
                """)]
            string daysJson,

            CancellationToken cancellationToken = default)
        {
            await using var scope = _sp.CreateAsyncScope();
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<WorkoutPlanPlugin>>();
            var workoutIntegration = scope.ServiceProvider.GetRequiredService<IWorkoutIntegrationService>();

            List<WorkoutDayDto> days;
            try
            {
                days = JsonSerializer.Deserialize<List<WorkoutDayDto>>(daysJson,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? new List<WorkoutDayDto>();
            }
            catch (JsonException ex)
            {
                logger.LogError(ex, "Failed to parse daysJson from AI");
                return "Error: Workout days JSON format is invalid. Please try again.";
            }

            if (!days.Any())
            {
                return "Error: Plan data is empty or missing 'days'.";
            }

            var payload = new WorkoutPlanPayloadDto
            {
                Title = title,
                PlanType = planType,
                WeekNumber = weekNumber,
                StartsAt = startsAt,
                Days = days,
                AiModelUsed = "AI-Model"
            };

            var planId = await workoutIntegration.CreatePlanToNodeAsync(payload, cancellationToken);

            if (planId != null)
            {
                return $"SUCCESS|planId:{planId}|days:{payload.Days.Count}|title:{payload.Title}";
            }

            return "Error: Could not save the workout plan to the external service.";
        }
    }
}
