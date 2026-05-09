namespace AIService.Application.DTOs.Workout
{
    public class CompletedDayLogDto
    {
        public string _Id { get; set; } = string.Empty;
        public string DayId { get; set; } = string.Empty;
        public string PlanId { get; set; } = string.Empty;
        public string DifficultyFeedback { get; set; } = string.Empty; // "easy", "ok", "hard"
        public int? DurationMinutes { get; set; } 
        public List<ExerciseLogSummaryDto> Exercises { get; set; } = new();
    }
}
