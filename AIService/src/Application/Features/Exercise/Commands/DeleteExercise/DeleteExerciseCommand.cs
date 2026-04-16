using Domain.Common.Response;
using MediatR;

namespace AIService.Application.Features.Exercise.Commands.DeleteExercise
{
    public class DeleteExerciseCommand : IRequest<Result<bool>>
    {
        public int Id { get; set; }
    }
}
