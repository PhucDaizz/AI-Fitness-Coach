using AIService.Domain.Entities;
using AIService.Domain.Repositories;

namespace AIService.Infrastructure.Data.Repositories
{
    public class EquipmentRepository : BaseRepository<Equipment>, IEquipmentRepository
    {

        public EquipmentRepository(ApplicationDbContext dbContext) : base(dbContext) 
        {
        }


    }
}
