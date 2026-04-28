using AIService.Application.DTOs.Workout;
using AIService.Application.Features.Workout.Commands.GeneratePlan.Models;

namespace AIService.Application.Common.Interfaces
{
    public interface IWeekPlanExecutor
    {
        Task<WorkoutPlanPayloadDto> ExecuteWeekAsync(WeekBlueprint week, UserProfileDto profile, string startsAt, CancellationToken ct = default);
    }
}
