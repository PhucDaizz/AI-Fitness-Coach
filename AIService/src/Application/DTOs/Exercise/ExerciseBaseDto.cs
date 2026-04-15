using AIService.Application.DTOs.Category;
using AIService.Application.DTOs.Equipment;
using AIService.Application.DTOs.MuscleGroup;

namespace AIService.Application.DTOs.Exercise
{
    public record ExerciseBaseDto
    {
        public int Id { get; init; }
        public Guid? UUId { get; init; }
        public string Name { get; init; }
        public string? ImageThumbnailUrl { get; init; }

        public List<MuscleDto> PrimaryMuscles { get; init; } = new();
        public List<MuscleDto> SecondaryMuscles { get; init; } = new();
        public List<EquipmentDto> Equipments { get; init; } = new();
        public CategoryDto? Category { get; init; }
        public List<string> LocationTypes { get; init; } = new();
    }
}
