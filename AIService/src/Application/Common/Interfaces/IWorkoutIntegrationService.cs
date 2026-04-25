using AIService.Application.DTOs.Workout;

namespace AIService.Application.Common.Interfaces
{
    public interface IWorkoutIntegrationService
    {
        Task<string?> CreatePlanToNodeAsync(WorkoutPlanPayloadDto payload, CancellationToken ct);
        Task<UserProfileDto?> GetProfileAsync(CancellationToken ct = default);
    }
}
