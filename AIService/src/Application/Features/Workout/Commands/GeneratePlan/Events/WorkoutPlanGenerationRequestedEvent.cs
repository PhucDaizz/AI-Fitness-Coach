using AIService.Application.DTOs.Workout;
using MediatR;

namespace AIService.Application.Features.Workout.Commands.GeneratePlan.Events
{
    public class WorkoutPlanGenerationRequestedEvent : INotification
    {
        public string JobId { get; set; } = default!;
        public string UserId { get; set; } = default!;
        public UserProfileDto Profile { get; set; } = default!;
        public int TotalWeeks { get; set; }
        public string StartsAt { get; set; } = default!;
    }
}
