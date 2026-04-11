using AIService.Application.Common.Interfaces;
using AIService.Application.DTOs.ChatMessage;
using AIService.Application.Features.AI.Utils;
using AIService.Domain.Entities;
using AIService.Domain.Enum;
using MediatR;
using Microsoft.Extensions.Logging;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using System.Text;

namespace AIService.Application.Features.AI.Commands.StreamFitnessChat
{
    public sealed class StreamFitnessChatCommandHandler
        : IRequestHandler<StreamFitnessChatCommand>
    {
        private readonly Kernel _kernel;
        private readonly IChatNotifier _notifier;
        private readonly IAITranslationService _translator;
        private readonly IChatMemoryService _chatMemoryService;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICacheService _cacheService;
        private readonly IIntegrationEventService _integrationEventService;
        private readonly ILogger<StreamFitnessChatCommandHandler> _logger;
        private readonly IChatCompletionService _ptAi;

        public StreamFitnessChatCommandHandler(
            Kernel kernel,
            IChatNotifier notifier,
            IAITranslationService translator,
            IChatMemoryService chatMemoryService,
            IUnitOfWork unitOfWork,
            ICacheService cacheService,
            IIntegrationEventService integrationEventService,
            ILogger<StreamFitnessChatCommandHandler> logger)
        {
            _kernel = kernel;
            _notifier = notifier;
            _translator = translator;
            _chatMemoryService = chatMemoryService;
            _unitOfWork = unitOfWork;
            _cacheService = cacheService;
            _integrationEventService = integrationEventService;
            _logger = logger;
            _ptAi = kernel.GetRequiredService<IChatCompletionService>("pt_brain");
        }

        public async Task Handle(
            StreamFitnessChatCommand request,
            CancellationToken cancellationToken)
        {
            try
            {
                var sessionGuid = Guid.Parse(request.SessionId);
                var userGuid = Guid.TryParse(request.UserId, out var parsedUser) ? parsedUser : Guid.Empty;

                var session = await _unitOfWork.SessionRepository.GetByIdAsync(sessionGuid, cancellationToken);

                if (session == null)
                {
                    session = Session.Create(sessionGuid, userGuid);
                    await _unitOfWork.SessionRepository.AddAsync(session, cancellationToken);
                }

                var userMessageId = Guid.NewGuid();
                session.AddUserMessage(userMessageId, request.Question);

                await _unitOfWork.SaveChangesAsync(cancellationToken);

                var recentChats = await _cacheService.GetRecentChatHistoryAsync<ChatMessageDto>(sessionGuid, 6);

                var userMsgCache = new { Role = MessageRole.User.ToString(), Content = request.Question, CreatedAt = DateTime.UtcNow };
                await _cacheService.AppendToChatHistoryAsync(sessionGuid, userMsgCache, TimeSpan.FromHours(24));

                await _integrationEventService.PublishToQueueAsync<MessageEmbeddingRequested>("ai-service-message-embedding-queue", 
                    new MessageEmbeddingRequested
                    {
                        MessageId = userMessageId,
                        SessionId = sessionGuid,
                        UserId = request.UserId,
                        Role = MessageRole.User.ToString(),
                        Content = request.Question,
                        CreatedAt = DateTime.UtcNow
                    }, cancellationToken);

                // ── Bước 1: Dịch ────────────────────────────────────
                var englishQuestion = await _translator.TranslateVietnameseToEnglishAsync(
                    request.Question, cancellationToken);

                _logger.LogInformation(
                    "[StreamChat] VI: {VI} → EN: {EN}",
                    request.Question, englishQuestion);

                var longTermContext = await _chatMemoryService.GetRelevantContextAsync(
                    request.UserId,
                    request.Question,
                    limit: 3,
                    cancellationToken);

                // ── Bước 2: Build history ────────────────────────────
                var chatHistory = FitnessPromptFactory.CreatePTContext(
                    request.Question,
                    englishQuestion,
                    recentChats,       
                    longTermContext);  

                var settings = new PromptExecutionSettings
                {
                    FunctionChoiceBehavior = FunctionChoiceBehavior.Auto(autoInvoke: true)
                };

                // ── Bước 3: Stream từng chunk về client ──────────────
                var fullResponse = new StringBuilder();

                int promptTokens = 0;
                int completionTokens = 0;

                await foreach (var chunk in _ptAi.GetStreamingChatMessageContentsAsync(
                    chatHistory,
                    settings,
                    _kernel,
                    cancellationToken))
                {
                    var text = chunk.Content;
                    if (string.IsNullOrEmpty(text)) continue;

                    fullResponse.Append(text);

                    // Push chunk về FE qua SignalR
                    await _notifier.SendMessageChunkAsync(request.UserId, request.MessageId, text);

                    if (chunk.Metadata != null)
                    {
                        if (chunk.Metadata.TryGetValue("Usage", out var usageObj) && usageObj != null)
                        {
                            try
                            {
                                if (usageObj is System.Text.Json.JsonElement jsonElement)
                                {
                                    if (jsonElement.TryGetProperty("PromptTokens", out var pt)) promptTokens = pt.GetInt32();
                                    if (jsonElement.TryGetProperty("CompletionTokens", out var ct)) completionTokens = ct.GetInt32();
                                }
                                else
                                {
                                    var type = usageObj.GetType();
                                    var pProp = type.GetProperty("PromptTokens");
                                    var cProp = type.GetProperty("CompletionTokens");

                                    if (pProp != null) promptTokens = (int)(pProp.GetValue(usageObj) ?? promptTokens);
                                    if (cProp != null) completionTokens = (int)(cProp.GetValue(usageObj) ?? completionTokens);
                                }
                            }
                            catch (Exception ex)
                            {
                                _logger.LogWarning(ex, "[StreamChat] Parse Usage object failed.");
                            }
                        }

                        if (chunk.Metadata.TryGetValue("PromptTokenCount", out var gPt) && gPt is int gPtInt) promptTokens = gPtInt;
                        if (chunk.Metadata.TryGetValue("CandidatesTokenCount", out var gCt) && gCt is int gCtInt) completionTokens = gCtInt;
                    }
                }

                // ── Bước 4: Báo hoàn tất ────────────────────────────
                await _notifier.SendMessageCompletedAsync(request.UserId, request.MessageId);

                session.AddAssistantMessage(request.MessageId, fullResponse.ToString(), promptTokens, completionTokens);

                await _unitOfWork.SaveChangesAsync(cancellationToken);

                var aiMsgCache = new { Role = MessageRole.Assistant.ToString(), Content = fullResponse.ToString(), CreatedAt = DateTime.UtcNow };
                await _cacheService.AppendToChatHistoryAsync(sessionGuid, aiMsgCache, TimeSpan.FromHours(24));

                await _integrationEventService.PublishToQueueAsync<MessageEmbeddingRequested>(
                    "ai-service-message-embedding-queue",
                    new MessageEmbeddingRequested
                    {
                        MessageId = request.MessageId,
                        SessionId = sessionGuid,
                        UserId = request.UserId,
                        Role = MessageRole.Assistant.ToString(),
                        Content = fullResponse.ToString(),
                        CreatedAt = DateTime.UtcNow
                    }, cancellationToken);

                _logger.LogInformation("[StreamChat] Done. MsgId: {Id}, Len: {Len}", request.MessageId, fullResponse.Length);
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
        }
    }
}
