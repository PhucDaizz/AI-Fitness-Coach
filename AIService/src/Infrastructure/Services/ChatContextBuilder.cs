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
                    var translateTask = _translator.TranslateVietnameseToEnglishAsync(
                        vietnameseQuestion,
                        ct);

                    Task<List<string>> contextTask;

                    if (ShouldSkipMemorySearch(vietnameseQuestion))
                    {
                        _logger.LogInformation(
                            "[ContextBuilder] Skip memory search for simple message: {Message}",
                            vietnameseQuestion);

                        contextTask = Task.FromResult(new List<string>());
                    }
                    else
                    {
                        contextTask = _chatMemoryService.GetRelevantContextAsync(
                            userId,
                            vietnameseQuestion,
                            limit: 3,
                            ct);
                    }

                    await Task.WhenAll(translateTask, contextTask);

                    englishQuestion = await translateTask;
                    longTermContext = await contextTask;

                    _logger.LogInformation(
                        "[ContextBuilder] VI: {VI} → EN: {EN} | Context count: {Count}",
                        vietnameseQuestion,
                        englishQuestion,
                        longTermContext.Count);

                    return (englishQuestion, longTermContext);
                }
                catch (HttpOperationException ex) when (ex.Message.Contains("400", StringComparison.OrdinalIgnoreCase))
                {
                    _logger.LogError(ex, "[ContextBuilder] ! Nội dung Request gửi đi bị sai.");

                    if (ex.InnerException != null)
                    {
                        _logger.LogError("[ContextBuilder] Chi tiết từ LLM: {Detail}", ex.InnerException.Message);
                    }

                    throw;
                }
                catch (HttpOperationException ex) when (attempt < maxRetries - 1)
                {
                    attempt++;

                    _logger.LogWarning(
                        "[ContextBuilder] Retry {Attempt}/{Max} do lỗi: {Msg}",
                        attempt,
                        maxRetries,
                        ex.Message);

                    await Task.Delay(TimeSpan.FromSeconds(attempt * 2), ct);
                }
            }

            return (englishQuestion, longTermContext);
        }

        private static bool ShouldSkipMemorySearch(string message)
        {
            if (string.IsNullOrWhiteSpace(message))
                return true;

            var normalized = NormalizeSimpleMessage(message);

            var simpleMessages = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                "ok", "oke", "oki", "okie", "okay", "okey", "k", "kk",
                "ok bạn", "ok ban", "ok nha", "ok nhé", "ok nhe", "ok rồi", "ok roi",
                "ổn", "on", "ổn rồi", "on roi",
                "được", "duoc", "đc", "dc", "được rồi", "duoc roi", "đc rồi", "dc roi",
                "đồng ý", "dong y", "nhất trí", "nhat tri",

                "ừ", "ừm", "uh", "uhm", "um",
                "ừ đúng", "uh đúng", "uh dung",
                "đúng", "dung", "đúng rồi", "dung roi",
                "chuẩn", "chuan", "chuẩn rồi", "chuan roi",
                "phải", "phai", "phải rồi", "phai roi",

                "tiếp", "tiep", "tiếp đi", "tiep di",
                "tiếp tục", "tiep tuc", "làm tiếp", "lam tiep",
                "nữa", "nua", "tiếp nha", "tiep nha", "tiếp nhé", "tiep nhe",

                "no", "nope", "không", "khong", "ko", "kô", "hong", "hông",
                "không cần", "khong can", "ko cần", "ko can",
                "thôi", "thoi", "thôi khỏi", "thoi khoi",
                "bỏ qua", "bo qua", "sai", "chưa", "chua", "chưa đúng", "chua dung",

                "thanks", "thank", "thank you", "ty", "tks", "thx",
                "cảm ơn", "cam on", "cám ơn",
                "cảm ơn bạn", "cam on ban",
                "cảm ơn nhé", "cam on nhe",
                "cảm ơn nha", "cam on nha",
                "ok cảm ơn", "ok cam on",
                "cảm ơn nhiều", "cam on nhieu",

                "rồi", "roi", "hiểu rồi", "hieu roi",
                "biết rồi", "biet roi",
                "rõ rồi", "ro roi",
                "nắm rồi", "nam roi",
                "got it", "i see", "understood",

                "haha", "hehe", "hihi", "kkk", "lol"
            };

            if (simpleMessages.Contains(normalized))
                return true;

            return normalized.Length < 10;
        }

        private static string NormalizeSimpleMessage(string message)
        {
            var normalized = message
                .Trim()
                .ToLowerInvariant();

            var charsToRemove = new[]
            {
                '.', ',', '!', '?', ';', ':',
                '"', '\'', '`',
                '“', '”', '‘', '’',
                '(', ')', '[', ']', '{', '}'
            };

            foreach (var c in charsToRemove)
            {
                normalized = normalized.Replace(c.ToString(), "");
            }

            while (normalized.Contains("  "))
            {
                normalized = normalized.Replace("  ", " ");
            }

            return normalized.Trim();
        }
    }
}