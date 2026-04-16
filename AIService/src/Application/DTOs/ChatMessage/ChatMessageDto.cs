namespace AIService.Application.DTOs.ChatMessage
{
    public record ChatMessageDto(
        string Role,       
        string Content,
        DateTime CreatedAt
    );
}
