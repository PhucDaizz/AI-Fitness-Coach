using AIService.Domain.Entities;
using AIService.Domain.Enum;
using AIService.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace AIService.Infrastructure.Data.Repositories
{
    public class ExerciseRepository : BaseRepository<Exercise>, IExerciseRepository
    {
        public ExerciseRepository(ApplicationDbContext dbContext) : base(dbContext)
        {
        }

        public async Task<Exercise?> GetByIdWithDetailsAsync(int Id, CancellationToken cancellationToken = default)
        {
            var exercise = await _dbSet.Where(e => e.Id == Id)
                .Include(e => e.ExerciseMuscles)
                .Include(e => e.Equipments)
                .FirstOrDefaultAsync(cancellationToken);

            return exercise;
        }

        public async Task<(List<Exercise> Items, int TotalCount)> GetExercisesAsync(string? searchTerm, List<int>? muscleGroupIds, List<int>? equipmentIds, List<int>? categoryIds, List<string>? locationTypes, EmbedStatus? embedStatusFilter, bool isAdmin, string? sortBy, bool sortDescending, int pageNumber, int pageSize, CancellationToken cancellationToken = default)
        {
            var query = _dbSet
                .Include(x => x.ExerciseMuscles)
                    .ThenInclude(em => em.MuscleGroup)
                .Include(x => x.Equipments)
                .Include(x => x.Category)
                .AsNoTracking();

            if (!isAdmin)
                query = query.Where(x => x.EmbedStatus == EmbedStatus.embedded);

            if (!string.IsNullOrWhiteSpace(searchTerm))
                query = query.Where(x => x.Name.Contains(searchTerm));

            if (muscleGroupIds != null && muscleGroupIds.Any())
                query = query.Where(x => x.ExerciseMuscles
                    .Any(em => muscleGroupIds.Contains(em.MuscleId)));

            if (equipmentIds != null && equipmentIds.Any())
                query = query.Where(x => x.Equipments
                    .Any(e => equipmentIds.Contains(e.Id)));

            if (categoryIds != null && categoryIds.Any())
                query = query.Where(x => x.CategoryId.HasValue &&
                    categoryIds.Contains(x.CategoryId.Value));

            if (isAdmin && embedStatusFilter.HasValue)
                query = query.Where(x => x.EmbedStatus == embedStatusFilter.Value);

            query = ApplySorting(query, sortBy, sortDescending);

            var allItems = await query.ToListAsync(cancellationToken);

            if (locationTypes != null && locationTypes.Any())
            {
                allItems = allItems
                    .Where(x => locationTypes.All(lt => x.LocationType != null && x.LocationType.Contains(lt)))
                    .ToList();
            }

            var totalCount = allItems.Count;
            var items = allItems
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            return (items, totalCount);
        }

        private IQueryable<Exercise> ApplySorting(IQueryable<Exercise> query, string? sortBy, bool sortDescending)
        {
            return (sortBy?.ToLower()) switch
            {
                "name" => sortDescending
                    ? query.OrderByDescending(x => x.Name)
                    : query.OrderBy(x => x.Name),
                _ => query.OrderByDescending(x => x.CreatedAt)
            };
        }
    }
}
