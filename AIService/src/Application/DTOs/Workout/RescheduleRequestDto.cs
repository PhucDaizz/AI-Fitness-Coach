namespace AIService.Application.DTOs.Workout
{
    public class RescheduleRequestDto
    {
        public string CurrentDay { get; set; } = string.Empty;
        public string TargetDay { get; set; } = string.Empty;
        public string Strategy { get; set; } = string.Empty; // "SHIFT" hoặc "SWAP"
    }
}
