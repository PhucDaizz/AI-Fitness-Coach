using AIService.Application.Common.Interfaces;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;

namespace AIService.Infrastructure.Services
{
    public class AITitleGeneratorService : ITitleGeneratorAiService
    {
        private readonly IChatCompletionService _titleAi;

        public AITitleGeneratorService(Kernel kernel)
        {
            _titleAi = kernel.GetRequiredService<IChatCompletionService>("fast_translator");
        }

        public async Task<string> GenerateTitleAsync(string firstMessage, CancellationToken cancellationToken = default)
        {
            if (firstMessage.Trim().Length <= 15)
            {
                return firstMessage.Trim();
            }

            var history = new ChatHistory("""
                You are an assistant that creates short, catchy titles for fitness chat sessions.
                Rule 1: Maximum 5 words.
                Rule 2: Respond ONLY with the title. No quotes, no prefix.
                Rule 3: Always in Vietnamese.

                Input: Chỉ tôi vài bài tập ngực tại nhà không cần tạ
                Output: Bài tập ngực tại nhà

                Input: Hôm nay tôi ăn phở bò, 1 quả trứng và uống trà sữa thì tính calo thế nào?
                Output: Tính calo Phở bò

                Input: Làm sao để giảm mỡ bụng nhanh nhất trong 1 tháng
                Output: Giảm mỡ bụng cấp tốc
                """);

            var truncatedMessage = firstMessage.Length > 200 ? firstMessage.Substring(0, 200) : firstMessage;
            history.AddUserMessage($"Input: {truncatedMessage}");

            var settings = new PromptExecutionSettings
            {
                FunctionChoiceBehavior = FunctionChoiceBehavior.None(), 
                ExtensionData = new Dictionary<string, object>
                {
                    ["max_tokens"] = 20, 
                    ["temperature"] = 0.7, 
                    ["stop"] = new[] { "\n" } 
                }
            };

            try
            {
                var result = await _titleAi.GetChatMessageContentAsync(history, settings, cancellationToken: cancellationToken);
                return CleanTitle(result.Content, firstMessage);
            }
            catch
            {
                return FallbackTitle(firstMessage);
            }
        }

        private static string CleanTitle(string? content, string fallback)
        {
            if (string.IsNullOrWhiteSpace(content)) return FallbackTitle(fallback);

            var cleaned = content.Trim();

            cleaned = cleaned.Trim('"', '\'', '.', '*', '-', ':');

            var prefixesToRemove = new[] { "Output:", "Title:", "Chủ đề:" };
            foreach (var prefix in prefixesToRemove)
            {
                if (cleaned.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
                    cleaned = cleaned[prefix.Length..].TrimStart(' ', ':');
            }

            return string.IsNullOrWhiteSpace(cleaned) ? FallbackTitle(fallback) : cleaned;
        }

        private static string FallbackTitle(string message)
        {
            return message.Length > 30 ? message.Substring(0, 30).Trim() + "..." : message;
        }
    }
}
