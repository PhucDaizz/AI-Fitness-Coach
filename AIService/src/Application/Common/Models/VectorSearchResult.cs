namespace AIService.Application.Common.Models
{
    public class VectorSearchResult
    {
        public Guid Id { get; set; } 
        public float Score { get; set; } 
        public Dictionary<string, object> Payload { get; set; } = new();
    }
}
