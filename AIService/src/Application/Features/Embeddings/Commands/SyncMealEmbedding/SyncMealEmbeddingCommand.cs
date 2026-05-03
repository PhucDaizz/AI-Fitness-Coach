using MediatR;

namespace AIService.Application.Features.Embeddings.Commands.SyncMealEmbedding
{
    public record SyncMealEmbeddingCommand(int MealId) : IRequest<bool>;
}
