using Domain.Common.Response;
using MediatR;

namespace AIService.Application.Features.ExerciseMuscle.Commands.UpdateExerciseMuscle
{
    public class UpdateExerciseMuscleCommand : IRequest<Result<bool>>
    {
        public int ExerciseId { get; set; }
        public int MuscleId { get; set; }
        public bool IsPrimary { get; set; }
    }
}
