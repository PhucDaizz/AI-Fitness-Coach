using Application.Common.Interfaces;
using Microsoft.Extensions.Logging;
using Nexus.BuildingBlocks.Interfaces;

namespace Infrastructure.Services
{
    public class IntegrationEventService : IIntegrationEventService
    {
        private readonly IMessagePublisher _publisher;
        private readonly ILogger<IntegrationEventService> _logger;

        public IntegrationEventService(IMessagePublisher publisher, ILogger<IntegrationEventService> logger)
        {
            _publisher = publisher;
            _logger = logger;
        }

        public async Task PublishAsync<T>(
            T integrationEvent,
            string exchange,
            string exchangeType,
            string routingKey,
            CancellationToken cancellationToken = default) where T : class
        {
            _logger.LogInformation(
                "Publishing integration event {EventType} to exchange {Exchange} with routing key {RoutingKey}",
                typeof(T).Name, exchange, routingKey);

            await _publisher.PublishAsync(exchange, exchangeType, routingKey, integrationEvent);
        }

        public async Task PublishToQueueAsync<T>(
            string queueName,
            T integrationEvent,
            CancellationToken cancellationToken = default) where T : class
        {
            _logger.LogInformation(
                "Publishing integration event {EventType} directly to queue {Queue}",
                typeof(T).Name, queueName);

            await _publisher.PublishAsync(queueName, integrationEvent);
        }
    }
}
