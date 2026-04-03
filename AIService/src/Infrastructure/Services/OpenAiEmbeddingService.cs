using AIService.Application.Common.Interfaces;
using AIService.Infrastructure.Settings;
using Microsoft.Extensions.Options;
using OpenAI.Embeddings;
using System.ClientModel;

namespace AIService.Infrastructure.Services
{
    public class OpenAiEmbeddingService : IEmbeddingService
    {
        private readonly EmbeddingClient _embeddingClient;
        private readonly OpenAiSettings _settings;

        public int VectorSize => _settings.VectorSize;

        public OpenAiEmbeddingService(IOptions<OpenAiSettings> options)
        {
            _settings = options.Value;

            if (string.IsNullOrWhiteSpace(_settings.ApiKey))
            {
                throw new ArgumentException("Thiếu API Key của OpenAI trong file cấu hình (appsettings.json)!");
            }

            _embeddingClient = new EmbeddingClient(_settings.EmbeddingModel, _settings.ApiKey);
        }

        public async Task<float[]> GenerateEmbeddingAsync(string text, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(text))
                return Array.Empty<float>();

            ClientResult<OpenAIEmbedding> response =
                await _embeddingClient.GenerateEmbeddingAsync(text, cancellationToken: cancellationToken);

            var vector = response.Value.ToFloats().ToArray();

            return vector;
        }
    }
}
