using AIService.Application.Common.Interfaces;
using AIService.Domain.Common;
using MediatR;

namespace AIService.Infrastructure.Services
{
    public class DomainEventService : IDomainEventService
    {
        private readonly IMediator _mediator;

        public DomainEventService(IMediator mediator)
        {
            _mediator = mediator;
        }
        public async Task PublishAsync(IDomainEvent domainEvent, CancellationToken cancellationToken = default)
        {
            await _mediator.Publish(domainEvent, cancellationToken);
        }
    }
}
