namespace AIService.Application.DTOs.ChatMessage
{
    public sealed record ChatSaveRequest(
        Guid SessionId,
        string UserId,
        Guid MessageId,
        string ResponseText,
        int PromptTokens,
        int CompletionTokens);
}
