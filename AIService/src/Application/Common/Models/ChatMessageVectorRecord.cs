using Microsoft.Extensions.VectorData;

namespace AIService.Application.Common.Models
{
    public class ChatMessageVectorRecord
    {
        [VectorStoreKey]
        public Guid Id { get; set; }

        [VectorStoreVector(1024, DistanceFunction = DistanceFunction.CosineSimilarity)]
        public ReadOnlyMemory<float> Vector { get; set; }

        [VectorStoreData(IsIndexed = true, StorageName = "user_id")]
        public string UserId { get; set; } = "";

        [VectorStoreData(IsIndexed = true, StorageName = "session_id")]
        public string SessionId { get; set; }

        [VectorStoreData(IsIndexed = true, StorageName = "role")]
        public string Role { get; set; } = "";

        [VectorStoreData(StorageName = "content")]
        public string Content { get; set; } = "";

        [VectorStoreData(IsIndexed = true, StorageName = "created_at")]
        public long CreatedAt { get; set; }
    }
}
