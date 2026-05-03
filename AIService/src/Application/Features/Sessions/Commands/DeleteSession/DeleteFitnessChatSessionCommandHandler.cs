using AIService.Application.Common.Interfaces;
using AIService.Application.Common.Models;
using Domain.Common.Response;
using MediatR;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.VectorData;

namespace AIService.Application.Features.Sessions.Commands.DeleteSession
{
    public sealed class DeleteFitnessChatSessionCommandHandler
        : IRequestHandler<DeleteFitnessChatSessionCommand, Result<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICacheService _cacheService;
        private readonly VectorStoreCollection<Guid, ChatMessageVectorRecord> _messageVectors;
        private readonly ILogger<DeleteFitnessChatSessionCommandHandler> _logger;

        public DeleteFitnessChatSessionCommandHandler(
            IUnitOfWork unitOfWork,
            ICacheService cacheService,
            VectorStoreCollection<Guid, ChatMessageVectorRecord> messageVectors,
            ILogger<DeleteFitnessChatSessionCommandHandler> logger)
        {
            _unitOfWork = unitOfWork;
            _cacheService = cacheService;
            _messageVectors = messageVectors;
            _logger = logger;
        }

        public async Task<Result<bool>> Handle(DeleteFitnessChatSessionCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var session = await _unitOfWork.SessionRepository.SessionWithMessagesAsync(request.SessionId, cancellationToken);

                if (session == null || session.UserId != request.UserId.ToString())
                {
                    _logger.LogWarning("[DeleteSession] Session {SessionId} không tồn tại hoặc không thuộc về User {UserId}", request.SessionId, request.UserId);
                    return Result.Failure<bool>(new Error("SessionNotFound", "Session không tồn tại hoặc không thuộc về User"));
                }

                var messageIds = session.Messages.Select(m => m.Id).ToList();

                foreach (var msgId in messageIds)
                {
                    await _messageVectors.DeleteAsync(msgId, cancellationToken: cancellationToken);
                }
                _logger.LogInformation("[VectorDB] Đã xoá {Count} vectors của Session {SessionId}", messageIds.Count, request.SessionId);

                _unitOfWork.SessionRepository.Delete(session);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                await _cacheService.DeleteChatHistoryAsync(request.SessionId);

                _logger.LogInformation("[DeleteSession] Hoàn tất xoá sạch dấu vết Session {SessionId}", request.SessionId);
                return Result.Success(true);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[DeleteSession] Có lỗi xảy ra khi xoá Session {SessionId}", request.SessionId);
                throw;
            }
        }
    }
}
