namespace Application.Common.Interfaces
{
    public interface IIntegrationEventService
    {
        Task PublishAsync<T>(
            T integrationEvent,
            string exchange,
            string exchangeType,
            string routingKey,
            CancellationToken cancellationToken = default) where T : class;

        Task PublishToQueueAsync<T>(
            string queueName,
            T integrationEvent,
            CancellationToken cancellationToken = default) where T : class;
    }
}
