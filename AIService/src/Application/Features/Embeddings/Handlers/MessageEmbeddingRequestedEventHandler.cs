using AIService.Application.Common.Interfaces;
using AIService.Application.Common.Models;
using AIService.Application.Features.Embeddings.Events;
using MediatR;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.VectorData;
using System.Text.RegularExpressions;

namespace AIService.Application.Features.Embeddings.Handlers
{
    public class MessageEmbeddingRequestedEventHandler : INotificationHandler<MessageEmbeddingRequestedEvent>
    {
        private readonly IEmbeddingService _embeddingService;
        private readonly VectorStoreCollection<Guid, ChatMessageVectorRecord> _messageVectors;
        private readonly ILogger<MessageEmbeddingRequestedEventHandler> _logger;

        public MessageEmbeddingRequestedEventHandler(
            IEmbeddingService embeddingService,
            VectorStoreCollection<Guid, ChatMessageVectorRecord> messageVectors,
            ILogger<MessageEmbeddingRequestedEventHandler> logger)
        {
            _embeddingService = embeddingService;
            _messageVectors = messageVectors;
            _logger = logger;
        }

        public async Task Handle(MessageEmbeddingRequestedEvent notification, CancellationToken cancellationToken)
        {
            try
            {
                await _messageVectors.EnsureCollectionExistsAsync(cancellationToken);

                string payloadText = GenerateTextForAI(notification.Role, notification.Content);

                var vectorArray = await _embeddingService.GenerateEmbeddingAsync(payloadText, cancellationToken);

                if (vectorArray == null || vectorArray.Length == 0)
                {
                    _logger.LogWarning("[VectorDB] Vector rỗng cho Message: {Id}", notification.MessageId);
                    return;
                }

                var record = new ChatMessageVectorRecord
                {
                    Id = notification.MessageId,
                    Vector = new ReadOnlyMemory<float>(vectorArray),
                    UserId = notification.UserId,
                    SessionId = notification.SessionId.ToString(),
                    Role = notification.Role,
                    Content = notification.Content,
                    CreatedAt = new DateTimeOffset(notification.CreatedAt).ToUnixTimeSeconds()
                };

                await _messageVectors.UpsertAsync(record, cancellationToken: cancellationToken);


                _logger.LogInformation("[VectorDB] Lưu thành công Vector cho Message: {Id}", notification.MessageId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[VectorDB] Lỗi khi lưu Vector Message {Id}", notification.MessageId);
                throw;
            }
        }

        private string GenerateTextForAI(string role, string content)
        {
            var rolePrefix = role.Equals("User", StringComparison.OrdinalIgnoreCase)
                ? "User asked"
                : "AI Coach replied";

            string cleanContent = StripMarkdown(content);

            return $"{rolePrefix}: {cleanContent}";
        }

        private string StripMarkdown(string markdownText)
        {
            if (string.IsNullOrWhiteSpace(markdownText))
                return string.Empty;

            var text = markdownText;

            text = Regex.Replace(text, @"(\*\*|__)(.*?)\1", "$2");
            text = Regex.Replace(text, @"(\*|_)(.*?)\1", "$2");

            text = Regex.Replace(text, @"^(#+)\s+", "", RegexOptions.Multiline);

            text = Regex.Replace(text, @"\[([^\]]+)\]\([^\)]+\)", "$1");

            text = text.Replace("`", "");

            text = Regex.Replace(text, @"\s+", " ").Trim();

            return text;
        }
    }
}
