using AIService.Domain.Entities;

namespace AIService.Application.Common.Interfaces
{
    public interface IApplicationDbContext
    {
        public IQueryable<Equipment> Equipments { get; }
        public IQueryable<Exercise> Exercises { get; }
        public IQueryable<ExerciseCategory> ExerciseCategories { get; }
        public IQueryable<ExerciseMuscle> ExerciseMuscles { get; }
        public IQueryable<TokenDailyStat> TokenDailyStats { get; }
        public IQueryable<MuscleGroup> MuscleGroups { get; }
        public IQueryable<Meal> Meals { get; }
        public IQueryable<Message> Messages { get; }
        public IQueryable<Session> Sessions { get; }
        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
