using AIService.Application.Common.Interfaces;
using AIService.Application.Common.Models;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.VectorData;

namespace AIService.Infrastructure.Services
{
    public class VectorChatMemoryService : IChatMemoryService
    {
        private readonly IEmbeddingGenerator<string, Embedding<float>> _embedding;
        private readonly VectorStoreCollection<Guid, ChatMessageVectorRecord> _messageVectors;
        private readonly ILogger<VectorChatMemoryService> _logger; 

        public VectorChatMemoryService(
            IEmbeddingGenerator<string, Embedding<float>> embedding,
            VectorStoreCollection<Guid, ChatMessageVectorRecord> messageVectors,
            ILogger<VectorChatMemoryService> logger)
        {
            _embedding = embedding;
            _messageVectors = messageVectors;
            _logger = logger;
        }

        public async Task<List<string>> GetRelevantContextAsync(
            string userId,
            string question,
            int limit = 3,
            CancellationToken cancellationToken = default)
        {
            var vector = await _embedding.GenerateVectorAsync(question, cancellationToken: cancellationToken);

            var searchOptions = new VectorSearchOptions<ChatMessageVectorRecord>
            {
                Filter = r => r.UserId == userId,
                IncludeVectors = false
            };

            var searchResults = _messageVectors.SearchAsync(
                vector,
                limit, 
                searchOptions,
                cancellationToken);

            var contextList = new List<string>();

            await foreach (var result in searchResults)
            {
                if (result.Score >= 0.7)
                {
                    string rolePrefix = result.Record.Role == "User" ? "User asked" : "AI Coach replied";
                    contextList.Add($"[{result.Score:F2}] {rolePrefix}: {result.Record.Content}");
                }
            }

            return contextList;
        }
    }
}
