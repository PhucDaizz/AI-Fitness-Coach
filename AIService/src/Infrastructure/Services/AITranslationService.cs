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
            _translatorAi = kernel.GetRequiredService<IChatCompletionService>("pt_brain");

        }

        public async Task<string> TranslateVietnameseToEnglishAsync(string question, CancellationToken cancellationToken = default)
        {
            // Với model nhỏ: system prompt CỰC ngắn, rõ ràng
            var history = new ChatHistory("""
                Translate Vietnamese to English. Output only the translation.
    
                Input: Tôi muốn ăn cơm
                Output: I want to eat rice
    
                Input: Thời tiết hôm nay thế nào?
                Output: What is the weather like today?
                """);

            // Wrap input rõ ràng để model biết đâu là "data" cần dịch
            history.AddUserMessage($"Translate: {question}");

            var settings = new PromptExecutionSettings
            {
                FunctionChoiceBehavior = FunctionChoiceBehavior.None(),
                ExtensionData = new Dictionary<string, object>
                {
                    ["max_tokens"] = 300,
                    ["temperature"] = 0.0,
                    ["stop"] = new[] { "\n\n", "Note:", "Explanation:" } // chặn model "nói thêm"
                }
            };

            var result = await _translatorAi.GetChatMessageContentAsync(
                history, settings, cancellationToken: cancellationToken);

            return CleanTranslation(result.Content, question);
        }

        private static string CleanTranslation(string? content, string fallback)
        {
            if (string.IsNullOrWhiteSpace(content)) return fallback;

            // Strip các prefix model hay tự thêm vào dù đã dặn không được
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

            // Chỉ lấy dòng đầu tiên nếu model "nói thêm" ở dòng sau
            var firstLine = cleaned.Split('\n')[0].Trim();
            return string.IsNullOrWhiteSpace(firstLine) ? fallback : firstLine;
        }
    }
}
