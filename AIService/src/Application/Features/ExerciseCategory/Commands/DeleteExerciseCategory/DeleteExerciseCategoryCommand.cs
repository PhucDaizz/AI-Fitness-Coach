using Domain.Common.Response;
using MediatR;

namespace AIService.Application.Features.ExerciseCategory.Commands.DeleteExerciseCategory
{
    public class DeleteExerciseCategoryCommand : IRequest<Result<bool>>
    {
        public int Id { get; set; }
    }
}
