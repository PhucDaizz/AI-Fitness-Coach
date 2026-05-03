using MediatR;

namespace AIService.Application.Features.Embeddings.Commands.SyncExerciseEmbedding
{
    public record SyncExerciseEmbeddingCommand(int ExerciseId) : IRequest<bool>;
}
