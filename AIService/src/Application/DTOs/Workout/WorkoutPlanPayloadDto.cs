using System.Text.Json.Serialization;

namespace AIService.Application.DTOs.Workout
{
    public class WorkoutPlanPayloadDto
    {
        [JsonPropertyName("title")] public string Title { get; set; } = string.Empty;
        [JsonPropertyName("planType")] public string PlanType { get; set; } = string.Empty;
        [JsonPropertyName("weekNumber")] public int WeekNumber { get; set; }
        [JsonPropertyName("aiModelUsed")] public string AiModelUsed { get; set; } = string.Empty;
        [JsonPropertyName("startsAt")] public string StartsAt { get; set; } = string.Empty;
        [JsonPropertyName("days")] public List<WorkoutDayDto> Days { get; set; } = new();
    }
}
