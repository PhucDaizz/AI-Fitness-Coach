using AIService.Application.Common.Interfaces;
using AIService.Application.DTOs.ChatMessage;
using AIService.Application.Features.AI.Utils;
using AIService.Domain.Entities;
using AIService.Domain.Enum;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using System.Text;
using System.Text.Json;

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
        private readonly IServiceScopeFactory _scopeFactory;
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
            IServiceScopeFactory scopeFactory,
            ILogger<StreamFitnessChatCommandHandler> logger)
        {
            _kernel = kernel;
            _notifier = notifier;
            _translator = translator;
            _chatMemoryService = chatMemoryService;
            _unitOfWork = unitOfWork;
            _cacheService = cacheService;
            _integrationEventService = integrationEventService;
            _scopeFactory = scopeFactory;
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
                    _cacheService.AppendToChatHistoryAsync(
                        sessionGuid, userMsgCache, TimeSpan.FromHours(24)),
                    _integrationEventService.PublishToQueueAsync<MessageEmbeddingRequested>(
                        "ai-service-message-embedding-queue", userEvent, cancellationToken)
                );


                var maxRetries = 5;
                // ── Translate + LongTerm memory song song ────────────
                var attempt = 0;
                string englishQuestion = request.Question;
                List<string> longTermContext = new();

                while (attempt < maxRetries)
                {
                    try
                    {
                        var translateTask = _translator.TranslateVietnameseToEnglishAsync(
                            request.Question, cancellationToken);

                        var contextTask = _chatMemoryService.GetRelevantContextAsync(
                            request.UserId, request.Question, limit: 3, cancellationToken);

                        await Task.WhenAll(translateTask, contextTask);

                        englishQuestion = await translateTask;
                        longTermContext = await contextTask;
                        break;
                    }
                    catch (HttpOperationException ex) when (attempt < maxRetries - 1)
                    {
                        attempt++;
                        _logger.LogWarning("[StreamChat] Translate retry {Attempt}/{Max}", attempt, maxRetries);
                        await Task.Delay(TimeSpan.FromSeconds(attempt * 2), cancellationToken);
                    }
                }

                _logger.LogInformation("[StreamChat] VI: {VI} → EN: {EN}",
                    request.Question, englishQuestion);


                // ── Build history + Stream ───────────────────────────
                var chatHistory = FitnessPromptFactory.CreatePTContext(
                    request.Question, englishQuestion, recentChats, longTermContext);

                var settings = new PromptExecutionSettings
                {
                    FunctionChoiceBehavior = FunctionChoiceBehavior.Auto(autoInvoke: true)
                };

                var fullResponse = new StringBuilder();
                StreamingChatMessageContent? lastChunk = null;

                attempt = 0;

                while (attempt < maxRetries)
                {
                    try
                    {
                        await foreach (var chunk in _ptAi.GetStreamingChatMessageContentsAsync(
                            chatHistory, settings, _kernel, cancellationToken))
                        {
                            if (!string.IsNullOrEmpty(chunk.Content))
                            {
                                fullResponse.Append(chunk.Content);
                                await _notifier.SendMessageChunkAsync(
                                    request.UserId, request.MessageId, chunk.Content);
                            }
                            lastChunk = chunk;
                        }
                        break; 
                    }
                    catch (HttpOperationException ex) when (attempt < maxRetries - 1)
                    {
                        attempt++;
                        fullResponse.Clear();
                        _logger.LogWarning("[StreamChat] Gemini 500, retry {Attempt}/{Max}", attempt, maxRetries);
                        await Task.Delay(TimeSpan.FromSeconds(attempt * 2), cancellationToken); 
                    }
                }

                await _notifier.SendMessageCompletedAsync(request.UserId, request.MessageId);

                _logger.LogInformation("[StreamChat] Done. MsgId: {Id}, Len: {Len}",
                    request.MessageId, fullResponse.Length);

                var responseText = fullResponse.ToString();
                var (prompt, complete) = ParseUsage(lastChunk);

                _ = SaveInBackgroundAsync(
                    sessionGuid, request,
                    responseText, prompt, complete);
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

        private async Task SaveInBackgroundAsync(
            Guid sessionGuid,
            StreamFitnessChatCommand request,
            string responseText,
            int promptTokens,
            int completionTokens)
        {
            try
            {
                await using var scope = _scopeFactory.CreateAsyncScope();
                var sp = scope.ServiceProvider;

                var unitOfWork = sp.GetRequiredService<IUnitOfWork>();
                var cacheService = sp.GetRequiredService<ICacheService>();
                var integrationEventSvc = sp.GetRequiredService<IIntegrationEventService>();

                var session = await unitOfWork.SessionRepository.GetByIdAsync(sessionGuid, CancellationToken.None);

                int totalTokens = promptTokens + completionTokens;
                if (totalTokens > 0)
                {
                    var today = DateOnly.FromDateTime(DateTime.UtcNow);

                    var dailyStat = await unitOfWork.TokenDailyStatRepository.GetByDateAsync(today, CancellationToken.None);

                    if (dailyStat == null)
                    {
                        dailyStat = new TokenDailyStat(today);
                        dailyStat.AddTokens(promptTokens, completionTokens, totalTokens);
                        await unitOfWork.TokenDailyStatRepository.AddAsync(dailyStat, CancellationToken.None);
                    }
                    else
                    {
                        dailyStat.AddTokens(promptTokens, completionTokens, totalTokens);

                        unitOfWork.TokenDailyStatRepository.Update(dailyStat);
                    }
                }

                if (session != null)
                {
                    session.AddAssistantMessage(request.MessageId, responseText, promptTokens, completionTokens);
                }

                var aiMsgCache = new
                {
                    Role = MessageRole.Assistant.ToString(),
                    Content = responseText,
                    CreatedAt = DateTime.UtcNow
                };

                var aiEvent = new MessageEmbeddingRequested
                {
                    MessageId = request.MessageId,
                    SessionId = sessionGuid,
                    UserId = request.UserId,
                    Role = MessageRole.Assistant.ToString(),
                    Content = responseText,
                    CreatedAt = DateTime.UtcNow
                };

                await Task.WhenAll(
                    unitOfWork.SaveChangesAsync(CancellationToken.None),
                    cacheService.AppendToChatHistoryAsync(
                        sessionGuid, aiMsgCache, TimeSpan.FromHours(24)),
                    integrationEventSvc.PublishToQueueAsync<MessageEmbeddingRequested>(
                        "ai-service-message-embedding-queue", aiEvent, CancellationToken.None)
                );

                _logger.LogInformation("[StreamChat] Background saved. MsgId: {Id}",
                    request.MessageId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[StreamChat] Background save failed. MsgId: {Id}",
                    request.MessageId);
            }
        }

        private static (int Prompt, int Completion) ParseUsage(StreamingChatMessageContent? chunk)
        {
            if (chunk?.Metadata == null) return (0, 0);

            int promptTokens = 0;
            int completionTokens = 0;

            // Google Gemini
            if (chunk.Metadata.TryGetValue("PromptTokenCount", out var gPt) && gPt is int gPtInt)
            {
                promptTokens = gPtInt;
            }
            if (chunk.Metadata.TryGetValue("CandidatesTokenCount", out var gCt) && gCt is int gCtInt)
            {
                completionTokens = gCtInt;
            }

            if (promptTokens > 0 || completionTokens > 0)
            {
                return (promptTokens, completionTokens);
            }

            // OpenAI / Ollama
            if (chunk.Metadata.TryGetValue("Usage", out var usageObj) && usageObj != null)
            {
                if (usageObj is JsonElement jsonElement)
                {
                    if (jsonElement.TryGetProperty("PromptTokens", out var pt))
                        promptTokens = pt.GetInt32();
                    if (jsonElement.TryGetProperty("CompletionTokens", out var ct))
                        completionTokens = ct.GetInt32();
                }
                else
                {
                    var type = usageObj.GetType();
                    var pProp = type.GetProperty("PromptTokens");
                    var cProp = type.GetProperty("CompletionTokens");

                    if (pProp != null)
                        promptTokens = (int)(pProp.GetValue(usageObj) ?? 0);
                    if (cProp != null)
                        completionTokens = (int)(cProp.GetValue(usageObj) ?? 0);
                }
            }

            return (promptTokens, completionTokens);
        }
    }
}
