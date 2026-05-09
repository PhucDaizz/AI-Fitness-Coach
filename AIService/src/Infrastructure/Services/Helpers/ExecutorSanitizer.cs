using AIService.Application.DTOs.Workout;
using AIService.Application.Features.Workout.Commands.GeneratePlan.Models;
using Microsoft.Extensions.Logging;

namespace AIService.Infrastructure.Services.Helpers
{
    public static class ExecutorSanitizer
    {
        public static void ValidateAndSanitize(WorkoutPlanPayloadDto payload, UserProfileDto profile, ILogger logger)
        {
            foreach (var day in payload.Days)
            {
                day.DayOfWeek = DayOfWeekConstants.Normalize(day.DayOfWeek);
                day.Exercises ??= new List<WorkoutExerciseDto>();

                for (int i = 0; i < day.Exercises.Count; i++)
                {
                    var ex = day.Exercises[i];

                    // Clamp sets
                    ex.Sets = Math.Clamp(ex.Sets, 1, 6);

                    // Clamp restSeconds
                    ex.RestSeconds = Math.Clamp(ex.RestSeconds, 30, 180);

                    // Fix empty reps
                    if (string.IsNullOrWhiteSpace(ex.Reps))
                        ex.Reps = "10-12";

                    // Fix orderIndex
                    ex.OrderIndex = i + 1;

                    // Safety note nếu có chấn thương
                    if (!string.IsNullOrWhiteSpace(profile.Injuries) &&
                        string.IsNullOrWhiteSpace(ex.Notes))
                    {
                        ex.Notes = "Stop immediately if you feel pain in the injured area.";
                    }
                }

                // Giới hạn số bài theo thời gian
                var maxExercises = profile.SessionMinutes switch
                {
                    <= 30 => 4,
                    <= 45 => 5,
                    <= 60 => 6,
                    <= 75 => 7,
                    _ => 8
                };

                if (day.Exercises.Count > maxExercises)
                {
                    logger.LogWarning(
                        "[Executor] Day {D} has {E} exercises, trimming to {Max}",
                        day.DayOfWeek, day.Exercises.Count, maxExercises);

                    day.Exercises = day.Exercises.Take(maxExercises).ToList();
                }
            }
        }
    }
}
