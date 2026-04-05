using Domain.Common.Response;
using MediatR;

namespace AIService.Application.Features.ExerciseCategory.Commands.CreateExerciseCategory
{
    public class CreateExerciseCategoryCommand : IRequest<Result<bool>>
    {
        public string Name { get; set; } = default!;
        public string? NameVN { get; set; }
    }
}
