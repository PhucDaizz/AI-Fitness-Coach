using AIService.Domain.Entities;

namespace AIService.Domain.Repositories
{
    public interface IExerciseRepository: IRepository<Exercise>
    {
        Task<Exercise?> GetByIdWithDetailsAsync(int Id, CancellationToken cancellationToken = default!);
    }
}
