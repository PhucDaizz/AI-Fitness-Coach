using AIService.Application.DTOs.Workout;
using AIService.Application.Features.Workout.Commands.GeneratePlan.Models;

namespace AIService.Application.Common.Interfaces
{
    public interface IWorkoutPlanOrchestrator
    {
        Task<WorkoutBlueprint> CreateBlueprintAsync(UserProfileDto profile, int totalWeeks, CancellationToken ct = default);
    }
}
