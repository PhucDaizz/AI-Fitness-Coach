using AIService.Application.DTOs.Workout;
using MediatR;

namespace AIService.Application.Features.Workout.Commands.GeneratePlan
{
    public record GenerateWorkoutPlanCommand(
        int TotalWeeks,
        string StartsAt
    ) : IRequest<GenerateWorkoutPlanResult>;
}
