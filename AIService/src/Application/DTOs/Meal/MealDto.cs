namespace AIService.Application.DTOs.Meal
{
    public record MealDto(
        int Id,
        string Name,
        int Calories,
        float Protein,
        float Carbs,
        float Fat,
        string? CuisineType,
        List<string> DietTags,
        string? ImageUrl
    );
}
