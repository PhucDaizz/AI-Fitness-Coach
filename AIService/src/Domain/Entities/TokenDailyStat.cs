using AIService.Domain.Common;

namespace AIService.Domain.Entities
{
    public class TokenDailyStat : BaseEntity<Guid>
    {
        public DateOnly Date { get; private set; }
        public long TotalPromptTokens { get; private set; }
        public long TotalCompletionTokens { get; private set; }
        public long TotalTokens { get; private set; }

        protected TokenDailyStat() { }

        public TokenDailyStat(DateOnly date)
        {
            Id = Guid.NewGuid();
            Date = date;
            TotalPromptTokens = 0;
            TotalCompletionTokens = 0;
            TotalTokens = 0;
        }

        public void AddTokens(int promptTokens, int completionTokens, int totalTokens)
        {
            TotalPromptTokens += promptTokens;
            TotalCompletionTokens += completionTokens;
            TotalTokens += totalTokens;
        }
    }
}
