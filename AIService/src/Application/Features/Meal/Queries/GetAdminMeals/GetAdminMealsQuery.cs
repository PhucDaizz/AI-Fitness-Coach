using AIService.Application.DTOs.Meal;
using AIService.Domain.Common.Models;
using Domain.Common.Response;
using MediatR;

namespace AIService.Application.Features.Meal.Queries.GetAdminMeals
{
    public class GetAdminMealsQuery: IRequest<Result<PagedResult<AdminMealDto>>>
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;
        public string? SearchTerm { get; set; }
    }
}
