using AIService.Domain.Entities;
using AIService.Domain.Enum;

namespace AIService.Domain.Repositories
{
    public interface IMealRepository: IRepository<Meal>
    {
        Task<(List<Meal> Items, int TotalCount)> GetAdminMealsAsync(
            string? searchTerm,
            List<string>? dietTags,
            string? cuisineType,
            int? caloriesFrom, int? caloriesTo,
            float? proteinFrom, float? proteinTo,
            float? carbsFrom, float? carbsTo,
            float? fatFrom, float? fatTo,
            EmbedStatus? embedStatus,
            string sortBy,
            bool sortDescending,
            int pageNumber,
            int pageSize,
            CancellationToken cancellationToken = default);

        Task<(List<Meal> Items, int TotalCount)> GetMealsAsync(
            string? searchTerm,
            List<string>? dietTags,
            string? cuisineType,
            int? caloriesFrom, int? caloriesTo,
            float? proteinFrom, float? proteinTo,
            float? carbsFrom, float? carbsTo,
            float? fatFrom, float? fatTo,
            EmbedStatus? embedStatusFilter,
            bool isAdmin,
            string sortBy,
            bool sortDescending,
            int pageNumber,
            int pageSize,
            CancellationToken cancellationToken = default);
    }
}
