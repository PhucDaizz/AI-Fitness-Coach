namespace AIService.Application.DTOs.MuscleGroup
{
    public class UpdateMuscleGroupDto
    {
        public string NameEN { get; set; } = default!;
        public string? NameVN { get; set; }
        public bool IsFront { get; set; }
    }
}
