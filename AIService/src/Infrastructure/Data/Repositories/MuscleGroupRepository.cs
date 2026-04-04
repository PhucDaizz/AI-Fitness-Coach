using AIService.Domain.Entities;
using AIService.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace AIService.Infrastructure.Data.Repositories
{
    public class MuscleGroupRepository : BaseRepository<MuscleGroup>, IMuscleGroupRepository
    {
        public MuscleGroupRepository(DbContext dbContext) : base(dbContext)
        {
        }
    }
}
