namespace AIService.Application.DTOs.ExerciseCategory
{
    public record ExerciseCategoryDetailDto(int Id, string Name, string? NameVN, DateTime CreatedAt, DateTime? UpdatedAt);
}
