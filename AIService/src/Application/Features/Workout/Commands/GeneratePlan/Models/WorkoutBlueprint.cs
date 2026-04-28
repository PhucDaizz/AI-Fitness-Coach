using System.Text.Json.Serialization;

namespace AIService.Application.Features.Workout.Commands.GeneratePlan.Models
{
    public class WorkoutBlueprint
    {
        [JsonPropertyName("totalWeeks")]
        public int TotalWeeks { get; set; }

        [JsonPropertyName("weeks")]
        public List<WeekBlueprint> Weeks { get; set; } = new();
    }
}
