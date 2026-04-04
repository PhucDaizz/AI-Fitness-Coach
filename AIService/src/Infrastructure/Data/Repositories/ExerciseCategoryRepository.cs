using AIService.Domain.Entities;
using AIService.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace AIService.Infrastructure.Data.Repositories
{
    public class ExerciseCategoryRepository : BaseRepository<ExerciseCategory>, IExerciseCategoryRepository
    {
        public ExerciseCategoryRepository(DbContext dbContext) : base(dbContext)
        {
        }
    }
}
