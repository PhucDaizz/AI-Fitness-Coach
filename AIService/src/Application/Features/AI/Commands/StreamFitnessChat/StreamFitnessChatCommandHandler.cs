using AIService.Application.Common.Interfaces;
using AIService.Application.Features.AI.Utils;
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
        private readonly ILogger<StreamFitnessChatCommandHandler> _logger;
        private readonly IChatCompletionService _ptAi;

        public StreamFitnessChatCommandHandler(
            Kernel kernel,
            IChatNotifier notifier,
            IAITranslationService translator,
            ILogger<StreamFitnessChatCommandHandler> logger)
        {
            _kernel = kernel;
            _notifier = notifier;
            _translator = translator;
            _logger = logger;
            _ptAi = kernel.GetRequiredService<IChatCompletionService>("pt_brain");
        }

        public async Task Handle(
            StreamFitnessChatCommand request,
            CancellationToken cancellationToken)
        {
            try
            {
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
                }

                // ── Bước 4: Báo hoàn tất ────────────────────────────
                await _notifier.SendMessageCompletedAsync(request.UserId, request.MessageId);

                _logger.LogInformation(
                    "[StreamChat] Done. MsgId: {Id}, Len: {Len}",
                    request.MessageId, fullResponse.Length);
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
