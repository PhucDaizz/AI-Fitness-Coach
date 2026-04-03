using MediatR;

namespace AIService.Application.Features.Embeddings.Events
{
    public class ExerciseEmbeddingRequestedEvent : INotification
    {
        public int ExerciseId { get; set; }

        public ExerciseEmbeddingRequestedEvent(int exerciseId)
        {
            ExerciseId = exerciseId;
        }
    }
}
