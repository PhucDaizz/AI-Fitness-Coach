using AIService.Application.Common.Interfaces;
using Microsoft.Extensions.DependencyInjection;
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
    }
}
