using AIService.Application.DTOs.MuscleGroup;
using AIService.Domain.Enum;
using Domain.Common.Response;
using MediatR;

namespace AIService.Application.Features.Exercise.Commands.UpdateExercise
{
    public class UpdateExerciseCommand : IRequest<Result<bool>>
    {
        public int Id { get; set; }
        public string Name { get; set; } = default!;
        public string? Description { get; set; }
        public DescriptionSource DescriptionSource { get; set; }
        public int? CategoryId { get; set; }
        public List<string> LocationType { get; set; } = new();
        public string? ImageUrl { get; set; }
        public string? ImageThumbnailUrl { get; set; }
        public bool IsFrontImage { get; set; } = true;

        public List<UpdateMuscleInputDto> Muscles { get; set; } = new();
        public List<int> EquipmentIds { get; set; } = new();
    }
}
