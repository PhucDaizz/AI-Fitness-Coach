namespace AIService.Application.DTOs.ChatMessage
{
    public record ChatMessageDto(
        Guid Id,
        string Role,       
        string Content,
        DateTime CreatedAt
    );
}
