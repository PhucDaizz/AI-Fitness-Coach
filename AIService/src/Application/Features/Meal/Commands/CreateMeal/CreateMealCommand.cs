using Domain.Common.Response;
using MediatR;

namespace AIService.Application.Features.Meal.Commands.CreateMeal
{
    public class CreateMealCommand : IRequest<Result<bool>>
    {
        public string Name { get; set; } = default!;
        public string? Description { get; set; }
        public int Calories { get; set; }
        public float Protein { get; set; }
        public float Carbs { get; set; }
        public float Fat { get; set; }
        public string? CuisineType { get; set; }
        public List<string> DietTags { get; set; } = new();
        public string? ImageUrl { get; set; }
    }
}
