using AIService.Application.Features.Embeddings.Events;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Nexus.BuildingBlocks.Interfaces;

namespace AIService.Infrastructure.BackgroundJobs.Consumer
{
    public class EmbeddingConsumer : BackgroundService
    {
        private readonly IMessageConsumer _consumer;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<EmbeddingConsumer> _logger;

        public EmbeddingConsumer(
            IMessageConsumer consumer,
            IServiceScopeFactory scopeFactory,
            ILogger<EmbeddingConsumer> logger)
        {
            _consumer = consumer;
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            await _consumer.Subscribe<ExerciseEmbeddingRequestedEvent>(
                exchange: "fitness-catalog.events",
                exchangeType: "topic",
                routingKey: "exercise.embedding.requested",
                queueName: "ai-service-exercise-embedding-queue",
                handler: (msg) => ProcessMessage(msg, stoppingToken));

            await _consumer.Subscribe<MealEmbeddingRequestedEvent>(
                exchange: "fitness-catalog.events",
                exchangeType: "topic",
                routingKey: "meal.embedding.requested",
                queueName: "ai-service-meal-embedding-queue",
                handler: (msg) => ProcessMessage(msg, stoppingToken));
        }

        private async Task ProcessMessage<TMessage>(TMessage message, CancellationToken token) where TMessage : class
        {
            using var scope = _scopeFactory.CreateScope();
            var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();

            try
            {
                await mediator.Publish(message, token);

                _logger.LogInformation("Successfully processed message {MessageType} : {MessageData}",
                    typeof(TMessage).Name, System.Text.Json.JsonSerializer.Serialize(message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error handling message {MessageType}", typeof(TMessage).Name);
            }
        }

    }
}
