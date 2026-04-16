using AIService.Domain.Entities;
using AIService.Domain.Repositories;

namespace AIService.Infrastructure.Data.Repositories
{
    public class MuscleGroupRepository : BaseRepository<MuscleGroup>, IMuscleGroupRepository
    {
        public MuscleGroupRepository(ApplicationDbContext dbContext) : base(dbContext)
        {
        }
    }
}
