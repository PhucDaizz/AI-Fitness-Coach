using AIService.Domain.Entities;
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
    }
}
