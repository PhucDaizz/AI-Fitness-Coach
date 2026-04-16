using AIService.Application.DTOs.Exercise;
using System.Text;

namespace AIService.Application.Features.Exercise.Utils
{
    public static class ExerciseResultFormatter
    {
        public static string Format(IReadOnlyList<ExerciseSearchResult> results)
        {
            if (results.Count == 0) return "No exercises found matching this query.";

            var sb = new StringBuilder();
            sb.AppendLine("=== EXERCISE SEARCH RESULTS ===");

            foreach (var r in results)
            {
                sb.AppendLine($"### {r.Record.Name}");
                sb.AppendLine($"- Description: {r.Description}");
                sb.AppendLine($"- Category: {r.CategoryDisplay}");
                sb.AppendLine($"- Primary Muscles: {string.Join(", ", r.Record.PrimaryMuscles)}");

                if (r.Record.SecondaryMuscles.Any())
                    sb.AppendLine($"- Secondary Muscles: {string.Join(", ", r.Record.SecondaryMuscles)}");

                sb.AppendLine($"- Equipment: {r.EquipmentDisplay}");

                if (r.Record.LocationTypes.Any())
                    sb.AppendLine($"- Location: {string.Join(", ", r.Record.LocationTypes)}");

                if (!string.IsNullOrEmpty(r.ImageUrl))
                    sb.AppendLine($"- Image: {r.ImageUrl}");

                sb.AppendLine($"- Match: {r.Score:F2}");
                sb.AppendLine("---");
            }

            return sb.ToString();
        }
    }
}
