using AIService.Domain.Repositories;

namespace AIService.Application.Common.Interfaces
{
    public interface IUnitOfWork : IDisposable
    {
        IEquipmentRepository EquipmentRepository { get; }
        IExerciseCategoryRepository ExerciseCategoryRepository { get; }
        IExerciseRepository ExerciseRepository { get; }
        IMealRepository MealRepository { get; }
        IMuscleGroupRepository MuscleGroupRepository { get; }
        ISessionRepository SessionRepository { get; }


        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
        Task BeginTransactionAsync();
        Task CommitTransactionAsync();
        Task RollbackTransactionAsync();
    }
}
