namespace AIService.Application.DTOs.ChatMessage
{
    public record MessageEmbeddingRequested
    {
        public Guid MessageId { get; set; }
        public Guid SessionId { get; set; }
        public string UserId { get; set; }
        public string Role { get; set; }
        public string Content { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
