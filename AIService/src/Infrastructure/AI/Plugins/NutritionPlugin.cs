using AIService.Application.Common.Interfaces; 
using AIService.Application.Common.Models;
using Microsoft.EntityFrameworkCore;         
using Microsoft.Extensions.AI;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.VectorData;
using Microsoft.SemanticKernel;
using System.ComponentModel;
using System.Text;

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
            CancellationToken cancellationToken = default)
        {
            await using var scope = _sp.CreateAsyncScope();
            var collection = scope.ServiceProvider.GetRequiredService<VectorStoreCollection<Guid, MealVectorRecord>>();
            var embedding = scope.ServiceProvider.GetRequiredService<IEmbeddingGenerator<string, Embedding<float>>>();
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<ExercisePlugin>>();

            var context = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();

            logger.LogInformation("[NutritionPlugin] Searching: {Query}", query);

            var vector = await embedding.GenerateVectorAsync(query, cancellationToken: cancellationToken);

            var searchResults = collection.SearchAsync(
                vector,
                top: 5,
                new VectorSearchOptions<MealVectorRecord> { IncludeVectors = false },
                cancellationToken);

            var sb = new StringBuilder();
            sb.AppendLine("=== NUTRITION SEARCH RESULTS ===");

            var found = false;
            await foreach (var result in searchResults)
            {
                if (result.Score < 0.4) continue;
                found = true;

                var m = result.Record;

                var dbMeal = await context.Meals
                    .AsNoTracking()
                    .FirstOrDefaultAsync(x => x.Id == m.MealId, cancellationToken);

                var description = dbMeal?.Description ?? "No description available.";

                sb.AppendLine($"### {m.Name}");
                sb.AppendLine($"- Description: {description}"); 
                sb.AppendLine($"- Calories: {m.Calories} kcal");
                sb.AppendLine($"- Macros: Protein: {m.Protein}g | Carbs: {m.Carbs}g | Fat: {m.Fat}g");
                sb.AppendLine($"- Cuisine: {m.CuisineType}");

                if (m.DietTags.Any())
                    sb.AppendLine($"- Diet Tags: {string.Join(", ", m.DietTags)}");

                if (dbMeal != null && !string.IsNullOrEmpty(dbMeal.ImageUrl))
                    sb.AppendLine($"- Image URL: {dbMeal.ImageUrl}");

                sb.AppendLine($"- Match Score: {result.Score:F2}");
                sb.AppendLine("---");
            }

            if (!found)
            {
                logger.LogWarning("[NutritionPlugin] No results for: {Query}", query);
                return "No meals found matching this query.";
            }

            return sb.ToString();
        }
    }
}