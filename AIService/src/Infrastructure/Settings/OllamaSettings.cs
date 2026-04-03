namespace AIService.Infrastructure.Settings
{
    public class OllamaSettings
    {
        public string Url { get; set; } = "http://localhost:11434/api/embeddings";
        public string Model { get; set; } = "nomic-embed-text";
        public int VectorSize { get; set; } = 1024;
    }
}
