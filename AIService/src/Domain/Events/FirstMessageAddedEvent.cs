using AIService.Domain.Common;

namespace AIService.Domain.Events
{
    public record FirstMessageAddedEvent(Guid SessionId, string FirstMessageContent) : DomainEvent;
}
