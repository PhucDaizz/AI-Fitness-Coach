using MediatR;

namespace AIService.Application.Features.Embeddings.Events
{
    public record MessageEmbeddingRequestedEvent(
        Guid MessageId,
        Guid SessionId,
        string UserId,
        string Role,
        string Content,
        DateTime CreatedAt 
    ) : INotification;
}
