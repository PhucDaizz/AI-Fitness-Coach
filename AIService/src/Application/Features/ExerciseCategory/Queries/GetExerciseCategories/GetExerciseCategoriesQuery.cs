using AIService.Domain.Common.Models;
using Domain.Common.Response;
using MediatR;

namespace AIService.Application.Features.ExerciseCategory.Queries.GetExerciseCategories
{
    public class GetExerciseCategoriesQuery : IRequest<Result<PagedResult<Domain.Entities.ExerciseCategory>>>
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;
        public string? SearchTerm { get; set; }
    }
}
