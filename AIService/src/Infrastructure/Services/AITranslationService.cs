using AIService.Application.Common.Interfaces;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;

namespace AIService.Infrastructure.Services
{
    public class AITranslationService : IAITranslationService
    {
        private readonly IChatCompletionService _translatorAi;

        public AITranslationService(Kernel kernel)
        {
            _translatorAi = kernel.GetRequiredService<IChatCompletionService>("fast_translator");

        }

        public async Task<string> TranslateVietnameseToEnglishAsync(string question, CancellationToken cancellationToken = default)
        {
            var history = new ChatHistory("""
                Translate Vietnamese to English. Output only the translation.
    
                Input: Tôi muốn ăn cơm
                Output: I want to eat rice
    
                Input: Thời tiết hôm nay thế nào?
                Output: What is the weather like today?
                """);

            history.AddUserMessage($"Translate: {question}");

            var settings = new PromptExecutionSettings
            {
                FunctionChoiceBehavior = FunctionChoiceBehavior.None(),
                ExtensionData = new Dictionary<string, object>
                {
                    ["max_tokens"] = 300,
                    ["temperature"] = 0.0,
                    ["stop"] = new[] { "\n\n", "Note:", "Explanation:" } 
                }
            };

            var result = await _translatorAi.GetChatMessageContentAsync(
                history, settings, cancellationToken: cancellationToken);

            return CleanTranslation(result.Content, question);
        }

        private static string CleanTranslation(string? content, string fallback)
        {
            if (string.IsNullOrWhiteSpace(content)) return fallback;

            var prefixesToRemove = new[]
            {
                "Translation:", "Translated:", "English:", "Answer:",
                "Sure!", "Here is", "Of course", "Result:"
            };

            var cleaned = content.Trim();
            foreach (var prefix in prefixesToRemove)
            {
                if (cleaned.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
                    cleaned = cleaned[prefix.Length..].TrimStart(':', ' ');
            }

            var firstLine = cleaned.Split('\n')[0].Trim();
            return string.IsNullOrWhiteSpace(firstLine) ? fallback : firstLine;
        }
    }
}
