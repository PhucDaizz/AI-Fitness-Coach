namespace AIService.Application.DTOs.Exercise
{
    public record ExerciseDetailDto : ExerciseBaseDto
    {
        public string? Description { get; init; }
        public string? ImageUrl { get; init; }
        public bool IsFrontImage { get; init; }
    };
}
