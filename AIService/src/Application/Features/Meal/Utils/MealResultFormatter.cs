using AIService.Application.DTOs.Meal;
using System.Text;

namespace AIService.Application.Features.Meal.Utils
{
    public static class MealResultFormatter
    {
        public static string Format(IReadOnlyList<MealSearchResult> results)
        {
            if (results.Count == 0) return "No meals found.";

            var sb = new StringBuilder();
            sb.AppendLine("=== NUTRITION SEARCH RESULTS ===");

            foreach (var r in results)
            {
                sb.AppendLine($"### {r.Record.Name}");
                sb.AppendLine($"- Description: {r.DbMeal?.Description ?? "N/A"}");
                sb.AppendLine($"- Calories: {r.Record.Calories} kcal");
                sb.AppendLine($"- Macros: P:{r.Record.Protein}g | C:{r.Record.Carbs}g | F:{r.Record.Fat}g");
                sb.AppendLine($"- Cuisine: {r.Record.CuisineType}");

                if (r.Record.DietTags.Any())
                    sb.AppendLine($"- Diet Tags: {string.Join(", ", r.Record.DietTags)}");

                if (!string.IsNullOrEmpty(r.ImageUrl))
                    sb.AppendLine($"- Image URL: {r.ImageUrl}");

                sb.AppendLine($"- Match Score: {r.Score:F2}");
                sb.AppendLine("---");
            }

            return sb.ToString();
        }
    }
}
