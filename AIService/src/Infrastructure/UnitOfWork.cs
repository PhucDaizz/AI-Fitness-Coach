using AIService.Application.Common.Interfaces;
using AIService.Domain.Repositories;
using Microsoft.EntityFrameworkCore.Storage;

namespace AIService.Infrastructure
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly ApplicationDbContext _context;
        private IDbContextTransaction? _transaction;
        public IExerciseCategoryRepository ExerciseCategoryRepository { get; }
        public IExerciseRepository ExerciseRepository { get; }
        public IMealRepository MealRepository { get; }
        public IMuscleGroupRepository MuscleGroupRepository { get; }
        public IEquipmentRepository EquipmentRepository { get; }
        public ISessionRepository SessionRepository { get; }
        public ITokenDailyStatRepository TokenDailyStatRepository { get; }

        public UnitOfWork(
            ApplicationDbContext context,
            IEquipmentRepository equipmentRepository,
            IExerciseCategoryRepository exerciseCategoryRepository,
            IExerciseRepository exerciseRepository,
            IMealRepository mealRepository,
            IMuscleGroupRepository muscleGroupRepository,
            ISessionRepository sessionRepository,
            ITokenDailyStatRepository tokenDailyStatRepository
        )
        {
            _context = context;
            ExerciseCategoryRepository = exerciseCategoryRepository;
            ExerciseRepository = exerciseRepository;
            MealRepository = mealRepository;
            MuscleGroupRepository = muscleGroupRepository;
            SessionRepository = sessionRepository;
            EquipmentRepository = equipmentRepository;
            TokenDailyStatRepository = tokenDailyStatRepository;
        }
        public async Task BeginTransactionAsync()
        {
            _transaction = await _context.Database.BeginTransactionAsync();
        }

        public async Task CommitTransactionAsync()
        {
            if (_transaction != null)
            {
                await _transaction.CommitAsync();
                await _transaction.DisposeAsync();
                _transaction = null;
            }
        }

        public void Dispose()
        {
            _transaction?.Dispose();
            _context.Dispose();
        }

        public async Task RollbackTransactionAsync()
        {
            if (_transaction != null)
            {
                await _transaction.RollbackAsync();
                await _transaction.DisposeAsync();
                _transaction = null;
            }
        }

        public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            return await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
