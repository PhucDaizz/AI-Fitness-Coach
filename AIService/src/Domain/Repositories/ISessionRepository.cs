using AIService.Domain.Entities;

namespace AIService.Domain.Repositories
{
    public interface ISessionRepository: IRepository<Session>
    {
        Task<Session?> SessionWithMessagesAsync(Guid sessionId, CancellationToken cancellationToken);
        Task<bool> ExistsAsync(Guid sessionId, CancellationToken cancellationToken);
    }
}
