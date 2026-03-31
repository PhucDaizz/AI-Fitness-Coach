using AIService.Domain.Common;

namespace AIService.Application.Common.Interfaces
{
    public interface IDomainEventService
    {
        Task PublishAsync(IDomainEvent domainEvent, CancellationToken cancellationToken = default);
    }
}
