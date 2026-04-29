using AIService.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.SemanticKernel;

namespace AIService.Infrastructure.Services
{
    public sealed class ChatContextBuilder : IChatContextBuilder
    {
        private readonly IAITranslationService _translator;
        private readonly IChatMemoryService _chatMemoryService;
        private readonly ILogger<ChatContextBuilder> _logger;

        public ChatContextBuilder(
            IAITranslationService translator,
            IChatMemoryService chatMemoryService,
            ILogger<ChatContextBuilder> logger)
        {
            _translator = translator;
            _chatMemoryService = chatMemoryService;
            _logger = logger;
        }

        public async Task<(string, List<string>)> BuildContextAsync(
            string userId, string vietnameseQuestion, CancellationToken ct)
        {
            const int maxRetries = 15;
            var attempt = 0;
            string englishQuestion = vietnameseQuestion;
            List<string> longTermContext = new();

            while (attempt < maxRetries)
            {
                try
                {
                    var translateTask = _translator.TranslateVietnameseToEnglishAsync(vietnameseQuestion, ct);
                    var contextTask = _chatMemoryService.GetRelevantContextAsync(userId, vietnameseQuestion, limit: 3, ct);

                    await Task.WhenAll(translateTask, contextTask);

                    englishQuestion = await translateTask;
                    longTermContext = await contextTask;

                    _logger.LogInformation("[ContextBuilder] VI: {VI} → EN: {EN}", vietnameseQuestion, englishQuestion);
                    return (englishQuestion, longTermContext);
                }
                catch (HttpOperationException) when (attempt < maxRetries - 1)
                {
                    attempt++;
                    _logger.LogWarning("[ContextBuilder] Retry {Attempt}/{Max}", attempt, maxRetries);
                    await Task.Delay(TimeSpan.FromSeconds(attempt * 2), ct);
                }
            }

            return (englishQuestion, longTermContext);
        }
    }
}
