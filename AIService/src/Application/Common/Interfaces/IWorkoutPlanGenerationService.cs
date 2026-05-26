using AIService.Application.DTOs.Workout;

namespace AIService.Application.Common.Interfaces
{
    public interface IWorkoutPlanGenerationService
    {
        Task<GenerateWorkoutPlanResult> GenerateAsync(
            UserProfileDto profile,
            string userId,
            int totalWeeks,
            string startsAt,
            CancellationToken cancellationToken);
    }
}
