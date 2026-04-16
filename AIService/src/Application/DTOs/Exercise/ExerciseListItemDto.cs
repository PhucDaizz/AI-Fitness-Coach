using AIService.Application.DTOs.Category;
using AIService.Domain.Enum;

namespace AIService.Application.DTOs.Exercise
{
    public record ExerciseListItemDto : ExerciseBaseDto
    {
        public EmbedStatus EmbedStatus { get; init; }
    }
}
