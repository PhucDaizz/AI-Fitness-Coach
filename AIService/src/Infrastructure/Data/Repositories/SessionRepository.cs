using AIService.Domain.Entities;
using AIService.Domain.Repositories;

namespace AIService.Infrastructure.Data.Repositories
{
    public class SessionRepository : BaseRepository<Session>, ISessionRepository
    {
        public SessionRepository(ApplicationDbContext dbContext) : base(dbContext)
        {
        }
    }
}
