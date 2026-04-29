using AIService.Application.Common.Interfaces;
using AIService.Domain.Entities;

namespace AIService.Infrastructure.Services
{
    public sealed class ChatSessionManager : IChatSessionManager
    {
        private readonly IUnitOfWork _unitOfWork;

        public ChatSessionManager(IUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

        public async Task<Session> GetOrCreateSessionAsync(string sessionId, string userId, CancellationToken ct)
        {
            var sessionGuid = Guid.Parse(sessionId);
            var userGuid = Guid.TryParse(userId, out var parsed) ? parsed : Guid.Empty;

            var session = await _unitOfWork.SessionRepository.GetByIdAsync(sessionGuid, ct);
            if (session == null)
            {
                session = Session.Create(sessionGuid, userGuid);
                await _unitOfWork.SessionRepository.AddAsync(session, ct);
            }
            return session;
        }

        public async Task<Guid> AddUserMessageAsync(Session session, string question, CancellationToken ct)
        {
            var messageId = Guid.NewGuid();
            session.AddUserMessage(messageId, question);
            await _unitOfWork.SaveChangesAsync(ct);

            return messageId;
        }
    }
}
