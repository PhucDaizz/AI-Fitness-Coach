namespace AIService.Application.DTOs.Workout
{
    public class AnalyticsSummaryDto
    {
        public int CurrentStreak { get; set; }
        public int LongestStreak { get; set; }
        public int SessionsThisWeek { get; set; }
        public double TotalVolumeKg { get; set; }
        public double CompletionRate { get; set; }
        public string ActivePlanId { get; set; }
    }
}
