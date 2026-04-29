using AIService.Application.Common.Contexts;
using AIService.Application.Common.Interfaces;
using AIService.Application.DTOs.ChatMessage;
using AIService.Application.Features.AI.Utils;
using AIService.Domain.Enum;
using MediatR;
using Microsoft.Extensions.Logging;
using Microsoft.SemanticKernel;
using System.Text;

namespace AIService.Application.Features.AI.Commands.StreamFitnessChat
{
    public sealed class StreamFitnessChatCommandHandler
        : IRequestHandler<StreamFitnessChatCommand>
    {
        private readonly Kernel _kernel;
        private readonly IChatNotifier _notifier;
        private readonly ICacheService _cacheService;
        private readonly IIntegrationEventService _integrationEventService;
        private readonly ILogger<StreamFitnessChatCommandHandler> _logger;
        
        
        private readonly IChatSessionManager _sessionManager;
        private readonly IChatContextBuilder _contextBuilder;
        private readonly IChatStreamingService _streamingService;
        private readonly IChatResponseSaver _responseSaver;

        public StreamFitnessChatCommandHandler(
            Kernel kernel,
            IChatNotifier notifier,
            ICacheService cacheService,
            IIntegrationEventService integrationEventService,

            IChatSessionManager sessionManager,
            IChatContextBuilder contextBuilder,
            IChatStreamingService streamingService,
            IChatResponseSaver responseSaver,

            ILogger<StreamFitnessChatCommandHandler> logger)
        {
            _kernel = kernel;
            _notifier = notifier;
            _cacheService = cacheService;
            _integrationEventService = integrationEventService;
            _logger = logger;
            _sessionManager = sessionManager;
            _contextBuilder = contextBuilder;
            _streamingService = streamingService;
            _responseSaver = responseSaver;
        }

        public async Task Handle(
            StreamFitnessChatCommand request,
            CancellationToken cancellationToken)
        {
            AccessTokenHolder.Current = request.AccessToken;

            try
            {
                // 1. Session
                var session = await _sessionManager.GetOrCreateSessionAsync(
                    request.SessionId, request.UserId, cancellationToken);
                var userMessageId = await _sessionManager.AddUserMessageAsync(session, request.Question, cancellationToken);

                // 2. Cache user message
                await CacheUserMessageAsync(request, userMessageId, cancellationToken);
                
                // 3. Build context (translate + memory)
                var (englishQuestion, longTermContext) = await _contextBuilder.BuildContextAsync(
                    request.UserId, request.Question, cancellationToken);

                // 4. Get recent history
                var recentChats = await _cacheService.GetRecentChatHistoryAsync<ChatMessageDto>(Guid.Parse(request.SessionId), 6);

                // 5. Build prompt
                var chatHistory = FitnessPromptFactory.CreatePTContext(
                    request.Question, englishQuestion, recentChats, longTermContext);

                // 6. Stream response
                var fullResponse = new StringBuilder();
                StreamingChatMessageContent? lastChunk = null;

                await foreach (var chunk in _streamingService.StreamResponseAsync(chatHistory, _kernel, cancellationToken))
                {
                    if (!string.IsNullOrEmpty(chunk.Content))
                    {
                        fullResponse.Append(chunk.Content);
                        await _notifier.SendMessageChunkAsync(request.UserId, request.MessageId, chunk.Content);
                    }

                    lastChunk = chunk;
                }

                await _notifier.SendMessageCompletedAsync(request.UserId, request.MessageId);

                // 7. Parse & Save
                var (promptTokens, completionTokens) = TokenUsageParser.Parse(lastChunk);
                _logger.LogInformation("[Handler] Done. MsgId: {Id}, Len: {Len}",
                    request.MessageId, fullResponse.Length);

                _ = _responseSaver.SaveAsync(new ChatSaveRequest(
                    Guid.Parse(request.SessionId),
                    request.UserId,
                    request.MessageId,
                    fullResponse.ToString(),
                    promptTokens,
                    completionTokens));
                
            }
            catch (OperationCanceledException)
            {
                _logger.LogWarning("[StreamChat] Cancelled. MsgId: {Id}", request.MessageId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[StreamChat] Error. MsgId: {Id}", request.MessageId);
                await _notifier.SendErrorAsync(request.UserId, "Có lỗi xảy ra, vui lòng thử lại.");
            }
            finally
            {
                AccessTokenHolder.Current = null;
            }
        }

        private async Task CacheUserMessageAsync(StreamFitnessChatCommand request, Guid userMessageId, CancellationToken ct)
        {
            var sessionGuid = Guid.Parse(request.SessionId);
            var userMsgCache = new
            {
                Role = MessageRole.User.ToString(),
                Content = request.Question,
                CreatedAt = DateTime.UtcNow
            };

            var userEvent = new MessageEmbeddingRequested
            {
                MessageId = userMessageId, 
                SessionId = sessionGuid,
                UserId = request.UserId,
                Role = MessageRole.User.ToString(),
                Content = request.Question,
                CreatedAt = DateTime.UtcNow
            };

            await Task.WhenAll(
                _cacheService.AppendToChatHistoryAsync(sessionGuid, userMsgCache, TimeSpan.FromHours(24)),
                _integrationEventService.PublishToQueueAsync(
                    "ai-service-message-embedding-queue", userEvent, ct)
            );
        }
    }
}
