namespace AIService.Application.DTOs.Workout
{
    public class CalendarDayDto
    {
        public string DayId { get; set; }
        public string DayOfWeek { get; set; }
        public string MuscleFocus { get; set; }
        public string ScheduledDate { get; set; }
        public string Status { get; set; } // "completed" | "upcoming"
    }
}
