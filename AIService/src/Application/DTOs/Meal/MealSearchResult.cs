using AIService.Application.Common.Models;

namespace AIService.Application.DTOs.Meal
{
    public sealed record MealSearchResult(
        MealVectorRecord Record,
        Domain.Entities.Meal? DbMeal,
        double Score)
    {
        public string ImageUrl => DbMeal?.ImageUrl ?? Record.ImageUrl ?? string.Empty;
    }
}
