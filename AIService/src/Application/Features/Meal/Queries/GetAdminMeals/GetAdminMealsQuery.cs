using AIService.Application.DTOs.Meal;
using AIService.Domain.Common.Models;
using AIService.Domain.Enum;
using Domain.Common.Response;
using MediatR;

namespace AIService.Application.Features.Meal.Queries.GetAdminMeals
{
    public class GetAdminMealsQuery: IRequest<Result<PagedResult<AdminMealDto>>>
    {
        // Pagination
        public int PageNumber { get; init; } = 1;
        public int PageSize { get; init; } = 20;

        // Text search
        public string? SearchTerm { get; init; }

        // Filters
        public List<string> DietTags { get; init; } = new();
        public string? CuisineType { get; init; }

        // Nutrition ranges
        public int? CaloriesFrom { get; init; }
        public int? CaloriesTo { get; init; }
        public float? ProteinFrom { get; init; }
        public float? ProteinTo { get; init; }
        public float? CarbsFrom { get; init; }
        public float? CarbsTo { get; init; }
        public float? FatFrom { get; init; }
        public float? FatTo { get; init; }

        // Admin-only filter
        public EmbedStatus? EmbedStatus { get; init; }

        // Sorting
        public string SortBy { get; init; } = "CreatedAt";  // Name, Calories, Protein, Carbs, Fat, CreatedAt, EmbedStatus
        public bool SortDescending { get; init; } = true;
    }
}
