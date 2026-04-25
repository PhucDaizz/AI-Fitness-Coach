namespace AIService.Application.DTOs.Workout
{
    public record GeneratePlanRequest(
        int TotalWeeks,
        string StartsAt
    );
}
