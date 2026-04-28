using AIService.Application.DTOs.Workout;

namespace AIService.Application.Common.Interfaces
{
    public interface IWorkoutIntegrationService
    {
        Task<string?> CreatePlanToNodeAsync(WorkoutPlanPayloadDto payload, CancellationToken ct);
        Task<UserProfileDto?> GetProfileAsync(CancellationToken ct = default);
        Task<string> GetActivePlansAsync(CancellationToken ct = default);
        Task<string> GetPlanScheduleAsync(string planId, CancellationToken ct = default);
        Task<string> ReschedulePlanAsync(string planId, string currentDay, string targetDay, string strategy, CancellationToken ct = default);
    }
}
