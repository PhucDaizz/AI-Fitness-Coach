using Domain.Common.Response;
using MediatR;

namespace AIService.Application.Features.ExerciseMuscle.Commands.DeleteExerciseMuscle
{
    public class DeleteExerciseMuscleCommand : IRequest<Result<bool>>
    {
        public int ExerciseId { get; set; }
        public int MuscleId { get; set; }
    }
}
