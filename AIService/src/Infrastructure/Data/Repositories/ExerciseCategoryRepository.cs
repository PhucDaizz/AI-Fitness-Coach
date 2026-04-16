using AIService.Domain.Entities;
using AIService.Domain.Repositories;

namespace AIService.Infrastructure.Data.Repositories
{
    public class ExerciseCategoryRepository : BaseRepository<ExerciseCategory>, IExerciseCategoryRepository
    {
        public ExerciseCategoryRepository(ApplicationDbContext dbContext) : base(dbContext)
        {
        }
    }
}
