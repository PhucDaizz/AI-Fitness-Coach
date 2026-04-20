using AIService.Domain.Entities;
using AIService.Domain.Enum;
using AIService.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace AIService.Infrastructure.Data.Repositories
{
    public class MealRepository : BaseRepository<Meal>, IMealRepository
    {
        public MealRepository(ApplicationDbContext dbContext) : base(dbContext)
        {

        }

        public async Task<(List<Meal> Items, int TotalCount)> GetAdminMealsAsync(
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
            CancellationToken cancellationToken = default)
        {
            var query = _dbSet.AsNoTracking();

            if (!string.IsNullOrWhiteSpace(searchTerm))
                query = query.Where(x => x.Name.Contains(searchTerm) ||
                    (x.Description != null && x.Description.Contains(searchTerm)));

            if (!string.IsNullOrWhiteSpace(cuisineType))
                query = query.Where(x => x.CuisineType != null && x.CuisineType.Contains(cuisineType));

            if (caloriesFrom.HasValue) query = query.Where(x => x.Calories >= caloriesFrom.Value);
            if (caloriesTo.HasValue) query = query.Where(x => x.Calories <= caloriesTo.Value);
            if (proteinFrom.HasValue) query = query.Where(x => x.Protein >= proteinFrom.Value);
            if (proteinTo.HasValue) query = query.Where(x => x.Protein <= proteinTo.Value);
            if (carbsFrom.HasValue) query = query.Where(x => x.Carbs >= carbsFrom.Value);
            if (carbsTo.HasValue) query = query.Where(x => x.Carbs <= carbsTo.Value);
            if (fatFrom.HasValue) query = query.Where(x => x.Fat >= fatFrom.Value);
            if (fatTo.HasValue) query = query.Where(x => x.Fat <= fatTo.Value);
            if (embedStatus.HasValue) query = query.Where(x => x.EmbedStatus == embedStatus.Value);

            query = ApplySorting(query, sortBy, sortDescending);

            // Materialize trước, filter DietTags ở memory vì JSON column không translate được
            var allItems = await query.ToListAsync(cancellationToken);

            if (dietTags != null && dietTags.Any())
            {
                allItems = allItems
                    .Where(x => dietTags.All(tag => x.DietTags != null && x.DietTags.Contains(tag)))
                    .ToList();
            }

            var totalCount = allItems.Count;

            var items = allItems
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            return (items, totalCount);
        }

        public async Task<(List<Meal> Items, int TotalCount)> GetMealsAsync(
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
            CancellationToken cancellationToken = default)
        {
            var query = _dbSet.AsNoTracking();

            if (!isAdmin)
                query = query.Where(x => x.EmbedStatus == EmbedStatus.embedded);

            if (!string.IsNullOrWhiteSpace(searchTerm))
                query = query.Where(x => x.Name.Contains(searchTerm) ||
                    (x.Description != null && x.Description.Contains(searchTerm)));

            if (!string.IsNullOrWhiteSpace(cuisineType))
                query = query.Where(x => x.CuisineType != null && x.CuisineType.Contains(cuisineType));

            if (caloriesFrom.HasValue) query = query.Where(x => x.Calories >= caloriesFrom.Value);
            if (caloriesTo.HasValue) query = query.Where(x => x.Calories <= caloriesTo.Value);
            if (proteinFrom.HasValue) query = query.Where(x => x.Protein >= proteinFrom.Value);
            if (proteinTo.HasValue) query = query.Where(x => x.Protein <= proteinTo.Value);
            if (carbsFrom.HasValue) query = query.Where(x => x.Carbs >= carbsFrom.Value);
            if (carbsTo.HasValue) query = query.Where(x => x.Carbs <= carbsTo.Value);
            if (fatFrom.HasValue) query = query.Where(x => x.Fat >= fatFrom.Value);
            if (fatTo.HasValue) query = query.Where(x => x.Fat <= fatTo.Value);

            if (isAdmin && embedStatusFilter.HasValue)
                query = query.Where(x => x.EmbedStatus == embedStatusFilter.Value);

            query = ApplySorting(query, sortBy, sortDescending);

            var allItems = await query.ToListAsync(cancellationToken);

            if (dietTags != null && dietTags.Any())
            {
                allItems = allItems
                    .Where(x => dietTags.All(tag => x.DietTags != null && x.DietTags.Contains(tag)))
                    .ToList();
            }

            var totalCount = allItems.Count;
            var items = allItems
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            return (items, totalCount);
        }

        private IQueryable<Meal> ApplySorting(IQueryable<Meal> query, string sortBy, bool sortDescending)
        {
            return (sortBy?.ToLower()) switch
            {
                "name" => sortDescending ? query.OrderByDescending(x => x.Name) : query.OrderBy(x => x.Name),
                "calories" => sortDescending ? query.OrderByDescending(x => x.Calories) : query.OrderBy(x => x.Calories),
                "protein" => sortDescending ? query.OrderByDescending(x => x.Protein) : query.OrderBy(x => x.Protein),
                "carbs" => sortDescending ? query.OrderByDescending(x => x.Carbs) : query.OrderBy(x => x.Carbs),
                "fat" => sortDescending ? query.OrderByDescending(x => x.Fat) : query.OrderBy(x => x.Fat),
                "embedstatus" => sortDescending ? query.OrderByDescending(x => x.EmbedStatus) : query.OrderBy(x => x.EmbedStatus),
                _ => sortDescending ? query.OrderByDescending(x => x.CreatedAt) : query.OrderBy(x => x.CreatedAt)
            };
        }
    }
}
