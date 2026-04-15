namespace AIService.Application.DTOs.Meal
{
    public record AdminMealDto: MealDto
    {
        public string EmbedStatus { get; init; } = string.Empty;

        public AdminMealDto(int id, string name, int calories, float protein, float carbs, float fat, string? cuisineType, List<string> dietTags, string? imageUrl, string embedStatus)
            : base(id, name, calories, protein, carbs, fat, cuisineType, dietTags, imageUrl)
        {
            EmbedStatus = embedStatus;
        }
    }
}
