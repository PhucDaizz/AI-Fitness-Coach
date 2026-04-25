using System.Text.Json.Serialization;

namespace AIService.Application.Features.Workout.Commands.GeneratePlan.Models
{
    public class WeekBlueprint
    {
        [JsonPropertyName("weekNumber")]
        public int WeekNumber { get; set; }

        [JsonPropertyName("focus")]
        public string Focus { get; set; } = "";

        [JsonPropertyName("days")]
        public List<DayBlueprint> Days { get; set; } = new();
    }
}
