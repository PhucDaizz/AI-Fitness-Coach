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
    public sealed class ExercisePlugin
    {
        private readonly IServiceProvider _sp;

        public ExercisePlugin(IServiceProvider sp)
        {
            _sp = sp;
        }

        [KernelFunction("search_exercises")]
        [Description("""
        Search the exercise database for workout information.
        Use when user asks about: exercises, workouts, gym, muscles,
        cardio, training techniques, equipment, weekly training plans,
        bodyweight exercises, strength training.
        Input must be in English.
        """)]
        public async Task<string> SearchExercisesAsync(
            [Description("English keywords or question about exercises")]
        string query,
            CancellationToken cancellationToken = default)
        {
            await using var scope = _sp.CreateAsyncScope();
            var collection = scope.ServiceProvider.GetRequiredService<VectorStoreCollection<Guid, ExerciseVectorRecord>>();
            var embedding = scope.ServiceProvider.GetRequiredService<IEmbeddingGenerator<string, Embedding<float>>>();
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<ExercisePlugin>>();

            var context = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();


            logger.LogInformation("[ExercisePlugin] Searching: {Query}", query);

            var vector = await embedding.GenerateVectorAsync(query, cancellationToken: cancellationToken);

            var searchResults = collection.SearchAsync(
                vector,
                top: 5,
                new VectorSearchOptions<ExerciseVectorRecord> { IncludeVectors = false },
                cancellationToken);

            var vectorRecords = new List<ExerciseVectorRecord>();
            await foreach (var result in searchResults)
            {
                if (result.Score >= 0.4)
                {
                    vectorRecords.Add(result.Record);
                }
            }

            if (!vectorRecords.Any()) return "No exercises found matching this query.";

            var exerciseIds = vectorRecords.Select(v => v.ExerciseId).ToList();

            var dbExercises = await context.Exercises
                .AsNoTracking()
                .Where(e => exerciseIds.Contains(e.Id))
                .ToDictionaryAsync(e => e.Id, cancellationToken);

            var sb = new StringBuilder();
            sb.AppendLine("=== EXERCISE SEARCH RESULTS ===");

            foreach (var item in vectorRecords)
            {
                dbExercises.TryGetValue(item.ExerciseId, out var dbExercise);
                var description = dbExercise?.Description ?? "No description.";

                sb.AppendLine($"### Exercise Name: {item.Name}");
                sb.AppendLine($"- Description: {description}");

                var categoryStr = string.IsNullOrEmpty(item.CategoryVN) ? item.Category : $"{item.CategoryVN} ({item.Category})";
                sb.AppendLine($"- Category: {categoryStr}");

                sb.AppendLine($"- Primary Muscles: {string.Join(", ", item.PrimaryMuscles)}");

                if (item.SecondaryMuscles.Any())
                {
                    sb.AppendLine($"- Secondary Muscles: {string.Join(", ", item.SecondaryMuscles)}");
                }

                sb.AppendLine($"- Equipment: {(item.IsBodyweight ? "Bodyweight only" : string.Join(", ", item.Equipments))}");

                if (item.LocationTypes.Any())
                {
                    sb.AppendLine($"- Location: {string.Join(", ", item.LocationTypes)}");
                }

                var imageUrl = dbExercise?.ImageUrl ?? item.ImageUrl;
                if (!string.IsNullOrEmpty(imageUrl))
                {
                    sb.AppendLine($"- Image URL: {imageUrl}");
                }

                sb.AppendLine("---");

            }
            return sb.ToString();
        }
    }
}
