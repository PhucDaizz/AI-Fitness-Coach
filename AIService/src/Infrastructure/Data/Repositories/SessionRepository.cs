using AIService.Domain.Entities;
using AIService.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace AIService.Infrastructure.Data.Repositories
{
    public class SessionRepository : BaseRepository<Session>, ISessionRepository
    {
        public SessionRepository(ApplicationDbContext dbContext) : base(dbContext)
        {
        }

        public Task<bool> ExistsAsync(Guid sessionId, CancellationToken cancellationToken)
        {
            return _dbSet.AnyAsync(s => s.Id == sessionId, cancellationToken);
        }

        public Task<Session?> SessionWithMessagesAsync(Guid sessionId, CancellationToken cancellationToken)
        {
            return _dbSet.Include(s => s.Messages).FirstOrDefaultAsync(s => s.Id == sessionId, cancellationToken);
        }
    }
}
