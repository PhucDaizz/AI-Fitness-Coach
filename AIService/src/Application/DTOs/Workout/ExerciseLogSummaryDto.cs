namespace AIService.Application.DTOs.Workout
{
    public class ExerciseLogSummaryDto
    {
        public string ExerciseId { get; set; } = string.Empty;
        public int SetsDone { get; set; }
        public string RepsDone { get; set; } = string.Empty;
        public float? WeightKg { get; set; } 
    }
}
