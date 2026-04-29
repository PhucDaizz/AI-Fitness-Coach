using AIService.Application.DTOs.ChatMessage;

namespace AIService.Application.Common.Interfaces
{
    public interface IChatResponseSaver
    {
        Task SaveAsync(ChatSaveRequest request);
    }
}
