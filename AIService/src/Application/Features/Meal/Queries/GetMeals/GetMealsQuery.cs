using AIService.Domain.Common.Models;
using Domain.Common.Response;
using MediatR;

namespace AIService.Application.Features.Meal.Queries.GetMeals
{
    public class GetMealsQuery : IRequest<Result<PagedResult<Domain.Entities.Meal>>>
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;
        public string? SearchTerm { get; set; }
    }
}
