using System.Text.Json.Serialization;

namespace AIService.Application.DTOs.Workout
{
    public class WorkoutPlanDayDto
    {
        [JsonPropertyName("_id")]
        public string Id { get; set; }
        public string DayOfWeek { get; set; } = string.Empty;
        public string MuscleFocus { get; set; } = string.Empty;
        public DateTime ScheduledDate { get; set; }
    }
}
