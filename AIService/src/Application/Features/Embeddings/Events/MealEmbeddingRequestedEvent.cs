using MediatR;

namespace AIService.Application.Features.Embeddings.Events
{
    public class MealEmbeddingRequestedEvent : INotification
    {
        public int MealId { get; set; }
        public MealEmbeddingRequestedEvent(int mealId)
        {
            this.MealId = mealId;
        }
    }
}
