namespace AIService.Application.DTOs.Workout
{
    public class WorkoutPlanSummaryDto
    {
        public string _Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime StartsAt { get; set; }
    }
}
