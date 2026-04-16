using AIService.Application.Common.Models;

namespace AIService.Application.Common.Interfaces
{
    public interface IQdrantService
    {
        Task EnsureCollectionExistsAsync(string collectionName, ulong vectorSize);
        Task UpsertVectorAsync(string collectionName, Guid id, float[] vector, Dictionary<string, object>? payload = null);
        Task<IReadOnlyList<VectorSearchResult>> SearchSimilarAsync(string collectionName, float[] queryVector, ulong limit = 10);
    }
}
