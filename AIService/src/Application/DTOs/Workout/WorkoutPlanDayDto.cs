namespace AIService.Application.DTOs.Workout
{
    public class WorkoutPlanDayDto
    {
        public string DayOfWeek { get; set; } = string.Empty;
        public string MuscleFocus { get; set; } = string.Empty;
        public DateTime ScheduledDate { get; set; }
    }
}
