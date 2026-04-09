using AIService.Application.Common.Interfaces;
using AIService.Application.Features.AI.Utils;
using AIService.Domain.Entities;
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
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<StreamFitnessChatCommandHandler> _logger;
        private readonly IChatCompletionService _ptAi;

        public StreamFitnessChatCommandHandler(
            Kernel kernel,
            IChatNotifier notifier,
            IAITranslationService translator,
            IUnitOfWork unitOfWork,
            ILogger<StreamFitnessChatCommandHandler> logger)
        {
            _kernel = kernel;
            _notifier = notifier;
            _translator = translator;
            _unitOfWork = unitOfWork;
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


                // ── Bước 1: Dịch ────────────────────────────────────
                var englishQuestion = await _translator.TranslateVietnameseToEnglishAsync(
                    request.Question, cancellationToken);

                _logger.LogInformation(
                    "[StreamChat] VI: {VI} → EN: {EN}",
                    request.Question, englishQuestion);

                // ── Bước 2: Build history ────────────────────────────
                var chatHistory = FitnessPromptFactory.CreatePTContext(request.Question, englishQuestion);

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

                _logger.LogInformation("[StreamChat] Token thu được -> Prompt: {P}, Completion: {C}", promptTokens, completionTokens);

                await _unitOfWork.SaveChangesAsync(cancellationToken);

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
