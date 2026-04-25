namespace AIService.Application.DTOs.Workout
{
    public record GenerateWorkoutPlanResult(
        List<string> PlanIds,
        string Summary
    );
}
