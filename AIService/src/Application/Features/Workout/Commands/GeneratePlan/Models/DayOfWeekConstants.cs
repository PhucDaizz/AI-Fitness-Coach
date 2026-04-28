namespace AIService.Application.Features.Workout.Commands.GeneratePlan.Models
{
    public static class DayOfWeekConstants
    {
        public const string Monday = "Monday";
        public const string Tuesday = "Tuesday";
        public const string Wednesday = "Wednesday";
        public const string Thursday = "Thursday";
        public const string Friday = "Friday";
        public const string Saturday = "Saturday";
        public const string Sunday = "Sunday";

        public static readonly HashSet<string> Valid = new(StringComparer.OrdinalIgnoreCase)
        {
            Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
        };

        public static string Normalize(string raw)
        {
            if (string.IsNullOrWhiteSpace(raw)) return raw;

            var lower = raw.Trim().ToLower();
            return lower switch
            {
                "monday" => Monday,
                "tuesday" => Tuesday,
                "wednesday" => Wednesday,
                "thursday" => Thursday,
                "friday" => Friday,
                "saturday" => Saturday,
                "sunday" => Sunday,
                _ => throw new ArgumentException($"Invalid dayOfWeek: '{raw}'")
            };
        }
    }
}
