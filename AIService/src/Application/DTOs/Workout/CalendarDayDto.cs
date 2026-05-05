namespace AIService.Application.DTOs.Workout
{
    public class CalendarDayDto
    {
        public string DayId { get; set; }
        public string DayOfWeek { get; set; }
        public string MuscleFocus { get; set; }
        public string ScheduledDate { get; set; }
        public string Status { get; set; } // "completed" | "upcoming"
        public List<CurrentExerciseDto> Exercises { get; set; } = new();
    }

    public class CurrentExerciseDto
    {
        public string ExerciseId { get; set; } = "";
        public string Name { get; set; } = "";
        public int Sets { get; set; }
        public string Reps { get; set; } = "";
        public int RestSeconds { get; set; }
    }
}
