using AIService.Domain.Entities;
using AIService.Domain.Repositories;

namespace AIService.Infrastructure.Data.Repositories
{
    public class MealRepository : BaseRepository<Meal>, IMealRepository
    {
        public MealRepository(ApplicationDbContext dbContext) : base(dbContext)
        {
        }
    }
}
