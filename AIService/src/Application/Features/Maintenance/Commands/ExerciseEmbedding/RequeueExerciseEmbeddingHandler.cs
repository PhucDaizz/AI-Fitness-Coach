using AIService.Application.Common.Interfaces;
using AIService.Application.Features.Embeddings.Events;
using AIService.Domain.Enum;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AIService.Application.Features.Maintenance.Commands.ExerciseEmbedding
{
    public class RequeueExerciseEmbeddingHandler : IRequestHandler<RequeueExerciseEmbeddingCommand, int>
    {
        private readonly IApplicationDbContext _context;
        private readonly IIntegrationEventService _publisher;

        public RequeueExerciseEmbeddingHandler(IApplicationDbContext context, IIntegrationEventService publisher)
        {
            _context = context;
            _publisher = publisher;
        }

        public async Task<int> Handle(RequeueExerciseEmbeddingCommand request, CancellationToken cancellationToken)
        {
            var exerciseIds = await _context.Exercises
                .Where(e => e.EmbedStatus == EmbedStatus.pending)
                .Select(e => e.Id)
                .ToListAsync(cancellationToken);

            if (!exerciseIds.Any()) return 0;

            foreach (var batch in exerciseIds.Chunk(500))
            {
                foreach (var id in batch)
                {
                    var @event = new ExerciseEmbeddingRequestedEvent(id);
                    await _publisher.PublishToQueueAsync("ai-service-exercise-embedding-queue", @event);
                }
            }

            return exerciseIds.Count;
        }
    }
}
