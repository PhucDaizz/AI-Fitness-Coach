namespace AIService.Application.Common.Interfaces
{
    public interface IDayPlanExecutor
    {
        Task<bool> RegenerateDayAsync(string newGoal, CancellationToken ct = default);
    }
}
