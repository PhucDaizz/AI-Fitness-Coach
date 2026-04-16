namespace AIService.Infrastructure.Settings
{
    public class OpenAiSettings
    {
        public string ApiKey { get; set; } = string.Empty;
        public string EmbeddingModel { get; set; } = "text-embedding-3-small";
        public int VectorSize { get; set; } = 1536;
    }
}
