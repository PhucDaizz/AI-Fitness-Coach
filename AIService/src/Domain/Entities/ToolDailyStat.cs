using AIService.Domain.Common;

namespace AIService.Domain.Entities
{
    public class ToolDailyStat : BaseEntity<Guid>
    {
        public DateOnly Date { get; private set; }
        public string ToolName { get; private set; } 
        public int UsageCount { get; private set; }

        protected ToolDailyStat() { }

        public ToolDailyStat(DateOnly date, string toolName)
        {
            Id = Guid.NewGuid();
            Date = date;
            ToolName = toolName;
            UsageCount = 0;
        }

        public void IncrementUsage()
        {
            UsageCount++;
        }
    }
}
