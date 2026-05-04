using System.Text.Json.Serialization;

namespace AIService.Application.DTOs.Workout
{
    public class ReplaceDayRequestDto
    {
        [JsonPropertyName("muscleFocus")]
        public string MuscleFocus { get; set; } = string.Empty;

        [JsonPropertyName("exercises")]
        public List<ReplaceExerciseDto> Exercises { get; set; } = new();
    }
}
