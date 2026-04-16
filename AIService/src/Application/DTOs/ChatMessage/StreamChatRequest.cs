namespace AIService.Application.DTOs.ChatMessage
{
    public class StreamChatRequest
    {
        public string Question { get; set; } = string.Empty;
        public string SessionId { get; set; } = string.Empty;
    }
}
