using AIService.Domain.Entities;
using AIService.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace AIService.Infrastructure.Data.Repositories
{
    public class ExerciseMuscleRepository : BaseRepository<ExerciseMuscle>, IExerciseMuscleRepository
    {
        public ExerciseMuscleRepository(DbContext dbContext) : base(dbContext)
        {
        }
    }
}
