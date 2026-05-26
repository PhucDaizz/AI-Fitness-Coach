namespace AIService.Application.DTOs.Workout
{
    public record WorkoutPlanGenerationJobDto(
        string JobId,
        string UserId,
        string Status,
        string Message,
        List<string>? PlanIds = null,
        string? Summary = null,
        string? Error = null,
        bool IsExisting = false
    );
}
