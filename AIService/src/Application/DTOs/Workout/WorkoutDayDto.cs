using System.Text.Json.Serialization;

namespace AIService.Application.DTOs.Workout
{
    public class WorkoutDayDto
    {
        [JsonPropertyName("dayOfWeek")] public string DayOfWeek { get; set; } = string.Empty;
        [JsonPropertyName("muscleFocus")] public string MuscleFocus { get; set; } = string.Empty;
        [JsonPropertyName("orderIndex")] public int OrderIndex { get; set; }
        [JsonPropertyName("scheduledDate")] public string? ScheduledDate { get; set; }
        [JsonPropertyName("exercises")] public List<WorkoutExerciseDto> Exercises { get; set; } = new();
    }
}
