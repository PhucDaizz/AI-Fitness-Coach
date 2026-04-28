namespace AIService.Application.DTOs.System
{
    public enum ToolUsageTimeFrame
    {
        Last7Days = 1,
        ThisMonth = 2,
        ThisYear = 3,
        AllTime = 4 
    }

    public class ToolUsagePieChartDto
    {
        public string ToolName { get; set; } = string.Empty;
        public long TotalUsage { get; set; }
    }
}
