using AIService.Domain.Entities;
using AIService.Domain.Enum;

namespace AIService.Domain.Repositories
{
    public interface IExerciseRepository: IRepository<Exercise>
    {
        Task<Exercise?> GetByIdWithDetailsAsync(int Id, CancellationToken cancellationToken = default!);

        Task<(List<Exercise> Items, int TotalCount)> GetExercisesAsync(
            string? searchTerm,
            List<int>? muscleGroupIds,
            List<int>? equipmentIds,
            List<int>? categoryIds,
            List<string>? locationTypes,
            EmbedStatus? embedStatusFilter,
            bool isAdmin,
            string? sortBy,
            bool sortDescending,
            int pageNumber,
            int pageSize,
            CancellationToken cancellationToken = default);
    }
}
