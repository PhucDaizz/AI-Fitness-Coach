using AIService.Application.DTOs.MuscleGroup;
using AIService.Domain.Enum;
using Domain.Common.Response;
using MediatR;

namespace AIService.Application.Features.Exercise.Commands.CreateExercise
{
    public class CreateExerciseCommand : IRequest<Result<bool>>
    {
        public string Name { get; set; } = default!;
        public string? Description { get; set; }
        public DescriptionSource DescriptionSource { get; set; }
        public int? CategoryId { get; set; }
        public List<string> LocationType { get; set; } = new();
        public string? ImageUrl { get; set; }
        public string? ImageThumbnailUrl { get; set; }
        public bool IsFrontImage { get; set; } = true;

        public List<MuscleInputDto> Muscles { get; set; } = new();
        public List<int> EquipmentIds { get; set; } = new();
    }
}
