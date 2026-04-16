using AIService.Application.Common.Interfaces;
using AIService.Application.Common.Models;
using AIService.Application.DTOs.Meal;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.VectorData;

namespace AIService.Infrastructure.Services
{
    public sealed class NutritionSearchService : INutritionSearchService
    {
        private readonly VectorStoreCollection<Guid, MealVectorRecord> _collection;
        private readonly IEmbeddingGenerator<string, Embedding<float>> _embedding;
        private readonly IApplicationDbContext _context;
        private readonly ILogger<NutritionSearchService> _logger;

        public NutritionSearchService(
            VectorStoreCollection<Guid, MealVectorRecord> collection,
            IEmbeddingGenerator<string, Embedding<float>> embedding,
            IApplicationDbContext context,
            ILogger<NutritionSearchService> logger)
        {
            _collection = collection;
            _embedding = embedding;
            _context = context;
            _logger = logger;
        }

        public async Task<IReadOnlyList<MealSearchResult>> SearchAsync(
            string query, int top = 5, double minScore = 0.4, CancellationToken ct = default)
        {
            _logger.LogInformation("Searching nutrition: {Query}", query);

            var vector = await _embedding.GenerateVectorAsync(query, cancellationToken: ct);

            var searchOptions = new VectorSearchOptions<MealVectorRecord> { IncludeVectors = false };
            var vectorResults = _collection.SearchAsync(vector, top, searchOptions, ct);

            var records = new List<(MealVectorRecord Record, double Score)>();
            await foreach (var result in vectorResults)
            {
                if (result.Score >= minScore)
                    records.Add((result.Record, result.Score ?? 0));
            }

            if (records.Count == 0) return new List<MealSearchResult>().AsReadOnly();

            var mealIds = records.Select(r => r.Record.MealId).ToList();
            var dbMeals = await _context.Meals
                .AsNoTracking()
                .Where(m => mealIds.Contains(m.Id))
                .ToDictionaryAsync(m => m.Id, ct);

            // BƯỚC 3: Map data
            var finalResults = new List<MealSearchResult>();
            foreach (var item in records)
            {
                dbMeals.TryGetValue(item.Record.MealId, out var dbMeal);
                finalResults.Add(new MealSearchResult(item.Record, dbMeal, item.Score));
            }

            return finalResults.OrderByDescending(x => x.Score).ToList().AsReadOnly();
        }
    }
}
