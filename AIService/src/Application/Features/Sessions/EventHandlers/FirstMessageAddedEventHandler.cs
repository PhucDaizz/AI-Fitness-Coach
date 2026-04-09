using AIService.Application.Common.Interfaces;
using AIService.Application.DTOs.ChatMessage;
using AIService.Domain.Events;
using MediatR;
using Microsoft.Extensions.Logging;

namespace AIService.Application.Features.Sessions.EventHandlers
{
    public class FirstMessageAddedEventHandler : INotificationHandler<FirstMessageAddedEvent>
    {
        private readonly IIntegrationEventService _integrationEventService;
        private readonly ILogger<FirstMessageAddedEventHandler> _logger;

        public FirstMessageAddedEventHandler(
            IUnitOfWork unitOfWork,
            ITitleGeneratorAiService titleAi, 
            IChatNotifier chatNotifier,
            IIntegrationEventService integrationEventService,
            ILogger<FirstMessageAddedEventHandler> logger)
        {
            _integrationEventService = integrationEventService;
            _logger = logger;
        }

        public async Task Handle(FirstMessageAddedEvent notification, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Bắt đầu gen Title cho Session {SessionId} với nội dung: {Content}",
                notification.SessionId, notification.FirstMessageContent);

            await _integrationEventService.PublishAsync(new GenerateTitleJob
                {
                    SessionId = notification.SessionId,
                    Content = notification.FirstMessageContent
                },
                "fitness-catalog.events",
                "topic",
                "ai.title.generate",
                cancellationToken);
        }
    }
}