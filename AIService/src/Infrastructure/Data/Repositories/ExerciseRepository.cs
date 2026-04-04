using AIService.Domain.Entities;
using AIService.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace AIService.Infrastructure.Data.Repositories
{
    public class ExerciseRepository : BaseRepository<Exercise>, IExerciseRepository
    {
        public ExerciseRepository(DbContext dbContext) : base(dbContext)
        {
        }
    }
}
