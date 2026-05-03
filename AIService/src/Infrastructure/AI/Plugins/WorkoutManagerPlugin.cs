using AIService.Application.Common.Interfaces;
using AIService.Application.DTOs.Workout;
using Microsoft.EntityFrameworkCore;
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

        [KernelFunction("request_detailed_log")]
        [Description("""
            Trigger the detailed workout logging UI on the frontend.
            Use when user wants to log specific weights, reps, sets for each exercise.
            Use when user says: muốn log chi tiết, nhập kg, nhập số rep, log đầy đủ.

            IMPORTANT: This function does NOT save data.
            It returns a UI trigger marker for the frontend to render the input form.
            After calling this, tell the user the form is ready.
            """)]
        public async Task<string> RequestDetailedLogAsync(
            [Description("Plan ID")] string planId,
            [Description("Day ID")] string dayId,
            [Description("Scheduled date of this workout day yyyy-MM-dd")] string scheduledDate,
            CancellationToken cancellationToken = default)
        {
            await using var scope = _sp.CreateAsyncScope();

            return $@"INSTRUCTION TO AI: Tell the user that the detailed log form is ready, and YOU MUST APPEND THIS EXACT STRING at the very end of your response: [UI_ACTION:DETAILED_LOG|{planId}|{dayId}|{scheduledDate}]";
        }


        [KernelFunction("get_workout_progress_summary")]
        [Description("""
            Get the user's workout progress summary, including current streak, completion rate, total volume, and analysis of worked vs. unworked muscle groups.
            Call this when the user asks about their progress, stats, streak, or what muscles they haven't trained yet.
            """)]
        public async Task<string> GetWorkoutProgressSummaryAsync(CancellationToken cancellationToken = default)
        {
            await using var scope = _sp.CreateAsyncScope();
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<WorkoutPlanPlugin>>();
            var workoutIntegration = scope.ServiceProvider.GetRequiredService<IWorkoutIntegrationService>();
            var dbContext = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();

            try
            {
                var summaryTask = workoutIntegration.GetAnalyticsSummaryAsync(cancellationToken);
                var muscleTask = workoutIntegration.GetMuscleVolumeAsync(cancellationToken);

                await Task.WhenAll(summaryTask, muscleTask);

                var summary = summaryTask.Result;
                var muscles = muscleTask.Result;

                if (summary == null) return "System error: Cannot retrieve analytics data at the moment.";

                var allMusclesFromDb = await dbContext.MuscleGroups
                    .AsNoTracking()
                    .ToListAsync(cancellationToken);

                var workedMusclesEN = muscles.Select(m => m.MuscleGroup).ToList();

                var workedMusclesTextList = allMusclesFromDb
                .Where(m => workedMusclesEN.Contains(m.NameEN))
                .Select(m =>
                {
                    var volume = muscles.First(x => x.MuscleGroup == m.NameEN).TotalVolume;
                    return $"{m.NameVN ?? m.NameEN} ({volume}kg)";
                });
                var workedMusclesText = string.Join(", ", workedMusclesTextList);

                var unworkedMusclesDb = allMusclesFromDb
                .Where(m => !workedMusclesEN.Contains(m.NameEN))
                .ToList();

                var unworkedMusclesText = unworkedMusclesDb.Any()
                    ? string.Join(", ", unworkedMusclesDb.Select(m => m.NameVN ?? m.NameEN))
                    : "None (Tuyệt vời! Toàn thân đã được kích thích!)";

                var sb = new System.Text.StringBuilder();
                sb.AppendLine("=== USER WORKOUT ANALYTICS SUMMARY ===");
                sb.AppendLine($"- Current Streak: {summary.CurrentStreak} days");
                sb.AppendLine($"- Longest Streak: {summary.LongestStreak} days");
                sb.AppendLine($"- Sessions This Week: {summary.SessionsThisWeek}");
                sb.AppendLine($"- Total Volume: {summary.TotalVolumeKg} kg");
                sb.AppendLine($"- Plan Completion Rate: {summary.CompletionRate}%");
                sb.AppendLine($"- Active Plan ID: {summary.ActivePlanId ?? "None"}");
                sb.AppendLine("--- MUSCLE ANALYSIS ---");
                sb.AppendLine($"- Worked Muscles (with volume): {workedMusclesText}");
                sb.AppendLine($"- ⚠️ UNWORKED Muscles: {unworkedMusclesText}");
                sb.AppendLine("======================================");
                sb.AppendLine(@"INSTRUCTION TO AI: 
                1. Congratulate the user on their current progress/streak in a short, friendly sentence.
                2. Explicitly warn them about the UNWORKED muscles and suggest focusing on them next time. 
                3. YOU MUST APPEND THIS EXACT STRING at the very end of your response: [UI_ACTION:SHOW_ANALYTICS]");

                return sb.ToString();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to get analytics summary.");
                return "Error: Could not fetch progress summary. Tell the user to try again later.";
            }
        }
    }
}
