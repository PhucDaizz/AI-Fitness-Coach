using AIService.Domain.Common.Models;
using Domain.Common.Response;
using MediatR;

namespace AIService.Application.Features.MuscleGroup.Queries.GetMuscleGroups
{
    public class GetMuscleGroupsQuery : IRequest<Result<PagedResult<Domain.Entities.MuscleGroup>>>
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;
        public string? SearchTerm { get; set; }
    }
}
