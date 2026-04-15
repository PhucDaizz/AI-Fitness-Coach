using AIService.Domain.Enum;

namespace AIService.Application.DTOs.Meal
{
    public record MealListItemDto
    {
        public int Id { get; init; }
        public string Name { get; init; }
        public string? Description { get; init; }
        public string? ImageUrl { get; init; }

        // Dinh dưỡng cơ bản cho list
        public int Calories { get; init; }
        public float Protein { get; init; }
        public float Carbs { get; init; }
        public float Fat { get; init; }

        // Phân loại
        public string? CuisineType { get; init; }
        public List<string> DietTags { get; init; } = new();

        public EmbedStatus EmbedStatus { get; init; }
    }
}
