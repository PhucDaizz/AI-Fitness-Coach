using System.Text.Json.Serialization;

namespace AIService.Application.Features.Workout.Commands.GeneratePlan.Models
{
    public class DayBlueprint
    {
        [JsonPropertyName("dayOfWeek")]
        public string DayOfWeek { get; set; } = "";

        [JsonPropertyName("muscleFocus")]
        public string MuscleFocus { get; set; } = "";

        [JsonPropertyName("exerciseKeywords")]
        public string ExerciseKeywords { get; set; } = "";

        [JsonPropertyName("orderIndex")]
        public int OrderIndex { get; set; }
    }
}
