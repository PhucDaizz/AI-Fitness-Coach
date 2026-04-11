using AIService.Application.Common.Interfaces;
using AIService.Application.Common.Models;
using AIService.Application.DTOs.Exercise;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.VectorData;

namespace AIService.Infrastructure.Services
{
    public sealed class ExerciseSearchService : IExerciseSearchService
    {
        private readonly VectorStoreCollection<Guid, ExerciseVectorRecord> _collection;
        private readonly IEmbeddingGenerator<string, Embedding<float>> _embedding;
        private readonly IApplicationDbContext _context;
        private readonly ILogger<ExerciseSearchService> _logger;

        public ExerciseSearchService(
            VectorStoreCollection<Guid, ExerciseVectorRecord> collection,
            IEmbeddingGenerator<string, Embedding<float>> embedding,
            IApplicationDbContext context,
            ILogger<ExerciseSearchService> logger)
        {
            _collection = collection;
            _embedding = embedding;
            _context = context;
            _logger = logger;
        }

        public async Task<IReadOnlyList<ExerciseSearchResult>> SearchAsync(
            string query, int top = 5, double minScore = 0.4, CancellationToken ct = default)
        {
            _logger.LogInformation("Searching exercises: {Query}", query);

            var vector = await _embedding.GenerateVectorAsync(query, cancellationToken: ct);

            var searchOptions = new VectorSearchOptions<ExerciseVectorRecord> { IncludeVectors = false };
            var vectorResults = _collection.SearchAsync(vector, top, searchOptions, ct);

            var records = new List<(ExerciseVectorRecord Record, double Score)>();
            await foreach (var result in vectorResults)
            {
                if (result.Score >= minScore)
                    records.Add((result.Record, result.Score ?? 0));
            }

            if (records.Count == 0) return new List<ExerciseSearchResult>().AsReadOnly();

            var exerciseIds = records.Select(r => r.Record.ExerciseId).ToList();

            var dbExercises = await _context.Exercises
                .AsNoTracking()
                .Where(e => exerciseIds.Contains(e.Id))
                .ToDictionaryAsync(e => e.Id, ct);

            var finalResults = new List<ExerciseSearchResult>();
            foreach (var item in records)
            {
                dbExercises.TryGetValue(item.Record.ExerciseId, out var dbExercise);
                finalResults.Add(new ExerciseSearchResult(item.Record, dbExercise, item.Score));
            }

            return finalResults.OrderByDescending(x => x.Score).ToList().AsReadOnly();
        }
    }
}