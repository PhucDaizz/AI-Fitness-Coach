using System.Text.Json.Serialization;

namespace AIService.Application.DTOs.Workout
{
    public class ActivePlanResponse
    {
        [JsonPropertyName("_id")]
        public string PlanId { get; set; }
    }
}
