using AIService.Application.Common.Interfaces;
using AIService.Application.DTOs.ChatMessage;
using MediatR;
using Microsoft.Extensions.Logging;

namespace AIService.Application.Features.Sessions.EventHandlers
{
    public class GenerateTitleJobEventHandler : INotificationHandler<GenerateTitleJob>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ITitleGeneratorAiService _titleAi;
        private readonly IChatNotifier _chatNotifier;
        private readonly ILogger<GenerateTitleJobEventHandler> _logger;

        public GenerateTitleJobEventHandler(
            IUnitOfWork unitOfWork,
            ITitleGeneratorAiService titleAi,
            IChatNotifier chatNotifier,
            ILogger<GenerateTitleJobEventHandler> logger)
        {
            _unitOfWork = unitOfWork;
            _titleAi = titleAi;
            _chatNotifier = chatNotifier;
            _logger = logger;
        }

        public async Task Handle(GenerateTitleJob notification, CancellationToken cancellationToken)
        {
            try
            {
                var session = await _unitOfWork.SessionRepository.GetByIdAsync(notification.SessionId, cancellationToken);

                if (session != null)
                {
                    string generatedTitle = await _titleAi.GenerateTitleAsync(notification.Content, cancellationToken);

                    session.UpdateTitle(generatedTitle);

                    await _unitOfWork.SaveChangesAsync(cancellationToken);

                    await _chatNotifier.SendTitleUpdatedAsync(session.UserId, session.Id, generatedTitle);
                }
                else
                {
                    _logger.LogWarning("Không tìm thấy Session với ID {SessionId} để gen Title", notification.SessionId);
                    return;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi gen Title cho Session {SessionId}", notification.SessionId);
            }
        }
    }
}
