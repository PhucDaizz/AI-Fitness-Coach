using AIService.Domain.Common.Models;
using Domain.Common.Response;
using MediatR;

namespace AIService.Application.Features.Exercise.Queries.GetExercises
{
    public class GetExercisesQuery : IRequest<Result<PagedResult<Domain.Entities.Exercise>>>
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;
        public string? SearchTerm { get; set; }
    }
}
