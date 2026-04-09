using MediatR;

namespace AIService.Application.DTOs.ChatMessage
{
    public class GenerateTitleJob: INotification
    {
        public Guid SessionId { get; set; }
        public string Content { get; set; }
    }
}
