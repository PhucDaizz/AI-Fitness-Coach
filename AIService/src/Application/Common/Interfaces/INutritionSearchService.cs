using AIService.Application.DTOs.Meal;

namespace AIService.Application.Common.Interfaces
{
    public interface INutritionSearchService
    {
        Task<IReadOnlyList<MealSearchResult>> SearchAsync(
            string query,
            int top = 5,
            double minScore = 0.4,
            CancellationToken ct = default);
    }
}
