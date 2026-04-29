using AIService.Application.Common.Interfaces;
using AIService.Application.DTOs.Workout;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.SemanticKernel;
using System.ComponentModel;

namespace AIService.Infrastructure.AI.Plugins
{
    public sealed class WorkoutManagerPlugin
    {
        private readonly IServiceProvider _sp;

        public WorkoutManagerPlugin(IServiceProvider sp)
        {
            _sp = sp;
        }

        [KernelFunction("get_active_plans")]
        [Description("Fetch and display the list of the user's active workout plans. Use this when the user asks 'What are my plans?' or 'How many plans do I have?'.")]
        public async Task<string> GetActivePlansAsync(
            CancellationToken ct = default)
        {
            await using var scope = _sp.CreateAsyncScope();
            var result = await scope.ServiceProvider.GetRequiredService<IWorkoutIntegrationService>().GetActivePlansAsync(ct);

            return $"""
                === ACTIVE WORKOUT PLANS ===
                {result}
                """;
        }

        [KernelFunction("get_plan_schedule")]
        [Description("View the detailed training days (dates and muscles) of a specific workout plan. Requires the planId.")]
        public async Task<string> GetPlanScheduleAsync(
            [Description("The ID of the plan to check (e.g. 69ef5... )")] string planId,
            CancellationToken ct = default)
        {
            await using var scope = _sp.CreateAsyncScope();
            var result = await scope.ServiceProvider.GetRequiredService<IWorkoutIntegrationService>().GetPlanScheduleAsync(planId, ct);
            
            return $"""
                === PLAN SCHEDULE DETAILS ===
                Plan ID: {planId}
                {result}
                """;
        }

        [KernelFunction("reschedule_workout")]
        [Description("Modify, delay, swap, or reschedule the user's workout days. Requires the planId, current day, and target day.")]
        public async Task<string> RescheduleWorkoutAsync(
            [Description("The ID of the plan being modified.")] string planId,
            [Description("The original workout date (yyyy-MM-dd).")] string currentDay,
            [Description("The new date (yyyy-MM-dd).")] string targetDay,
            [Description("Use 'SWAP' to exchange two days. Use 'SHIFT' to delay a workout and push the rest forward.")] string strategy,
            CancellationToken ct = default)
        {
            await using var scope = _sp.CreateAsyncScope();
            var result = await scope.ServiceProvider.GetRequiredService<IWorkoutIntegrationService>().ReschedulePlanAsync(planId, currentDay, targetDay, strategy, ct);

            return $"""
                === RESCHEDULE RESULT ===
                Action: {strategy} from {currentDay} to {targetDay}
                Status: {result}
                """;
        }

        [KernelFunction("log_workout_day_completion")]
        [Description("""
            Mark a specific workout day as completed. 
            Use this when the user says they finished a workout, checked in, or completed their training for the day.
            """)]
        public async Task<string> LogWorkoutDayCompletionAsync(
            [Description("The exact ID of the workout plan (e.g. 69f06a...).")]
            string planId,

            [Description("The exact ID of the workout day being completed.")]
            string dayId,

            [Description("The date the workout was completed in yyyy-MM-dd format. If the user says 'today', use the current date.")]
            string loggedDate = "",

            [Description("How the user felt about the workout. Must be exactly 'easy', 'ok', or 'hard'. \r\n CRITICAL RULE: If the user HAS NOT explicitly stated their feeling in the chat, YOU MUST NOT call this function. Instead, ask the user: 'Bạn cảm thấy buổi tập hôm nay thế nào (Dễ, Bình thường, hay Khó)?' and wait for their answer.")]
            string difficultyFeedback = "ok",

            [Description("Any extra notes, feelings, or details the user mentioned about the workout session.")]
            string notes = "",

            CancellationToken cancellationToken = default)
        {
            await using var scope = _sp.CreateAsyncScope();
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<WorkoutPlanPlugin>>();
            var workoutIntegration = scope.ServiceProvider.GetRequiredService<IWorkoutIntegrationService>();

            var validDifficulties = new[] { "easy", "ok", "hard" };
            var safeDifficulty = validDifficulties.Contains(difficultyFeedback.ToLower()) ? difficultyFeedback.ToLower() : "ok";

            var payload = new CompleteWorkoutDayPayload
            {
                LoggedDate = string.IsNullOrWhiteSpace(loggedDate) ? null : loggedDate,
                DifficultyFeedback = safeDifficulty,
                Notes = string.IsNullOrWhiteSpace(notes) ? null : notes
            };

            try
            {
                var result = await workoutIntegration.LogWorkoutDayCompleteAsync(planId, dayId, payload, cancellationToken);

                return result;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to log workout day complete for Plan {PlanId}, Day {DayId}", planId, dayId);
                return "Error: An unexpected error occurred while logging the workout.";
            }
        }
    }
}
