using AIService.Application.Common.Interfaces;
using AIService.Application.Common.Models;
using AIService.Infrastructure.Settings;
using Microsoft.Extensions.Options;
using Qdrant.Client;
using Qdrant.Client.Grpc;

namespace AIService.Infrastructure.Services
{
    public class QdrantService : IQdrantService
    {
        private readonly QdrantClient _client;

        public QdrantService(IOptions<QdrantSettings> qdrantSettings)
        {
            var options = qdrantSettings.Value;
            _client = new QdrantClient(host: options.Host, port: options.Port, https: options.Https, apiKey: string.IsNullOrEmpty(options.ApiKey) ? null : options.ApiKey);
        }

        public async Task EnsureCollectionExistsAsync(string collectionName, ulong vectorSize)
        {
            var collections = await _client.ListCollectionsAsync();
            if (!collections.Contains(collectionName))
            {
                await _client.CreateCollectionAsync(collectionName, new VectorParams { Size = vectorSize, Distance = Distance.Cosine });
            }
        }

        public async Task UpsertVectorAsync(string collectionName, Guid id, float[] vector, Dictionary<string, object>? payload = null)
        {
            var point = new PointStruct
            {
                Id = id,
                Vectors = vector
            };

            if (payload != null)
            {
                foreach (var item in payload)
                {
                    point.Payload[item.Key] = MapToQdrantValue(item.Value);
                }
            }

            await _client.UpsertAsync(collectionName, new[] { point });
        }

        public async Task<IReadOnlyList<VectorSearchResult>> SearchSimilarAsync(string collectionName, float[] queryVector, ulong limit = 10)
        {
            var qdrantResults = await _client.SearchAsync(
                collectionName: collectionName,
                vector: queryVector,
                limit: limit
            );

            var mappedResults = qdrantResults.Select(r => new VectorSearchResult
            {
                Id = Guid.Parse(r.Id.Uuid),
                Score = r.Score
            }).ToList();

            return mappedResults;
        }

        private Value MapToQdrantValue(object obj)
        {
            return obj switch
            {
                null => new Value { NullValue = NullValue.NullValue },
                string s => new Value { StringValue = s },
                int i => new Value { IntegerValue = i },
                long l => new Value { IntegerValue = l },
                float f => new Value { DoubleValue = f },
                double d => new Value { DoubleValue = d },
                bool b => new Value { BoolValue = b },

                IEnumerable<string> list => new Value
                {
                    ListValue = new ListValue { Values = { list.Select(s => new Value { StringValue = s }) } }
                },

                _ => new Value { StringValue = obj.ToString() }
            };
        }
    }
}
