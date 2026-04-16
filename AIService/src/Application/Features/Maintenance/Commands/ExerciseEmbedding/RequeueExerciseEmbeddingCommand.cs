using MediatR;

namespace AIService.Application.Features.Maintenance.Commands.ExerciseEmbedding
{
    public record RequeueExerciseEmbeddingCommand : IRequest<int>;
}
