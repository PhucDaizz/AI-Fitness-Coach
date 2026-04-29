using AIService.Domain.Entities;

namespace AIService.Application.Common.Interfaces
{
    public interface IChatSessionManager
    {
        Task<Session> GetOrCreateSessionAsync(string sessionId, string userId, CancellationToken ct);
        Task<Guid> AddUserMessageAsync(Session session, string question, CancellationToken ct);
    }
}
