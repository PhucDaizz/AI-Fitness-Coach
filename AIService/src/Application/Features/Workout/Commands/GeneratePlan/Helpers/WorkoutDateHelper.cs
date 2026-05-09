using AIService.Application.DTOs.Workout;
using AIService.Application.Features.Workout.Commands.GeneratePlan.Models;

namespace AIService.Application.Features.Workout.Commands.GeneratePlan.Helpers
{
    public static class WorkoutDateHelper
    {
        public static DateTime ResolveDayDate(DateTime weekStart, string dayOfWeek) 
        {
            var dayIndex = new Dictionary<string, int>
            {
                ["Monday"] = 1,
                ["Tuesday"] = 2,
                ["Wednesday"] = 3,
                ["Thursday"] = 4,
                ["Friday"] = 5,
                ["Saturday"] = 6,
                ["Sunday"] = 0
            };

            var startDay = (int)weekStart.DayOfWeek;
            var targetDay = dayIndex[dayOfWeek];

            var diff = targetDay - startDay;
            if (diff < 0) diff += 7;

            return weekStart.AddDays(diff).Date;
        }

        public static void NormalizeDays(WorkoutPlanPayloadDto payload) 
        {
            int order = 1;
            foreach (var day in payload.Days.OrderBy(d => d.OrderIndex))
            {
                day.DayOfWeek = DayOfWeekConstants.Normalize(day.DayOfWeek);
                day.OrderIndex = order++;
                for (int i = 0; i < day.Exercises.Count; i++)
                    day.Exercises[i].OrderIndex = i + 1;
            }
        }
    }
}
