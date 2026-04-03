using AIService.Application.Common.Interfaces;
using AIService.Application.Features.Embeddings.Events;
using AIService.Domain.Enum;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AIService.Application.Features.Maintenance.Commands.MealEmbedding
{
    public class RequeueMealEmbeddingHandler : IRequestHandler<RequeueMealEmbeddingCommand, int>
    {
        private readonly IApplicationDbContext _context;
        private readonly IIntegrationEventService _publisher;

        public RequeueMealEmbeddingHandler(IApplicationDbContext context, IIntegrationEventService publisher)
        {
            _context = context;
            _publisher = publisher;
        }

        public async Task<int> Handle(RequeueMealEmbeddingCommand request, CancellationToken cancellationToken)
        {
            var mealIds = await _context.Meals
                .Where(m => m.EmbedStatus == EmbedStatus.pending)
                .Select(m => m.Id)
                .ToListAsync(cancellationToken);

            if (!mealIds.Any()) return 0;

            foreach (var id in mealIds)
            {
                var @event = new MealEmbeddingRequestedEvent(id);
                await _publisher.PublishToQueueAsync(
                    "ai-service-meal-embedding-queue",
                    @event);
            }

            return mealIds.Count;
        }
    }
}
