using Domain.Common.Response;
using MediatR;

namespace AIService.Application.Features.ExerciseCategory.Commands.UpdateExerciseCategory
{
    public class UpdateExerciseCategoryCommand : IRequest<Result<bool>>
    {
        public int Id { get; set; }
        public string Name { get; set; } = default!;
        public string? NameVN { get; set; }
    }
}
