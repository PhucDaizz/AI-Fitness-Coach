namespace AIService.Application.DTOs.Workout
{
    public class UserProfileDto
    {
        public string Gender { get; set; } = string.Empty;
        public DateTime? DateOfBirth { get; set; }
        public double WeightKg { get; set; }
        public double HeightCm { get; set; }
        public string Environment { get; set; } = string.Empty;
        public string FitnessGoal { get; set; } = string.Empty;
        public string FitnessLevel { get; set; } = string.Empty;
        public int SessionMinutes { get; set; }
        public List<string> Equipment { get; set; } = new();
        public string? Injuries { get; set; }
        public List<string> AvailableDays { get; set; } = new();
    }
}
