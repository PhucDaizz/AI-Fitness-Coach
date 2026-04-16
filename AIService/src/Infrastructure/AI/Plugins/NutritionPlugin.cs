using AIService.Application.Common.Interfaces;
using AIService.Application.Features.Meal.Utils;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.SemanticKernel;
using System.ComponentModel;

namespace AIService.Infrastructure.AI.Plugins
{
    public sealed class NutritionPlugin
    {
        private readonly IServiceProvider _sp;

        public NutritionPlugin(IServiceProvider sp)
        {
            _sp = sp;
        }

        [KernelFunction("search_nutrition")]
        [Description("""
            Search the nutrition and meal database.
            Use when user asks about: meals, food, calories, protein,
            carbs, fat, diet plan, meal plan, what to eat,
            weight loss diet, bulking diet, macros.
            Input must be in English.
            """)]
        public async Task<string> SearchNutritionAsync(
            [Description("English keywords or question about nutrition/meals")]
            string query,
            CancellationToken ct = default)
        {
            await using var scope = _sp.CreateAsyncScope();
            var searchService = scope.ServiceProvider.GetRequiredService<INutritionSearchService>();

            var results = await searchService.SearchAsync(query, ct: ct);

            return results.Count == 0
                ? "No meals found matching this query."
                : MealResultFormatter.Format(results);
        }
    }
}