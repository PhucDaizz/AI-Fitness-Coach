using System.Text.Json.Serialization;

namespace AIService.Application.DTOs.Workout
{
    public class ReplaceExerciseDto
    {
        [JsonPropertyName("exerciseId")]
        public string ExerciseId { get; set; } = string.Empty;

        [JsonPropertyName("sets")]
        public int Sets { get; set; }

        [JsonPropertyName("reps")]
        public string Reps { get; set; } = string.Empty;

        [JsonPropertyName("restSeconds")]
        public int RestSeconds { get; set; }

        [JsonPropertyName("notes")]
        public string Notes { get; set; } = string.Empty;

        [JsonPropertyName("orderIndex")]
        public int OrderIndex { get; set; }
    }
}
