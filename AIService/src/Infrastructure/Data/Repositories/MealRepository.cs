using AIService.Domain.Entities;
using AIService.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace AIService.Infrastructure.Data.Repositories
{
    public class MealRepository : BaseRepository<Meal>, IMealRepository
    {
        public MealRepository(DbContext dbContext) : base(dbContext)
        {
        }
    }
}
