using Microsoft.Extensions.VectorData;

namespace AIService.Application.Common.Models
{
    public class MealVectorRecord
    {
        [VectorStoreKey]
        public Guid Id { get; set; }

        [VectorStoreVector(1024, DistanceFunction = DistanceFunction.CosineSimilarity)]
        public ReadOnlyMemory<float> Vector { get; set; }

        [VectorStoreData(IsIndexed = true, StorageName = "meal_id")]
        public int MealId { get; set; }

        [VectorStoreData(IsFullTextIndexed = true, StorageName = "name")]
        public string Name { get; set; } = "";

        [VectorStoreData(IsIndexed = true, StorageName = "calories")]
        public int Calories { get; set; }

        [VectorStoreData(IsIndexed = true, StorageName = "protein")]
        public float Protein { get; set; }

        [VectorStoreData(StorageName = "carbs")]
        public float Carbs { get; set; }

        [VectorStoreData(StorageName = "fat")]
        public float Fat { get; set; }

        [VectorStoreData(IsIndexed = true, StorageName = "cuisine_type")]
        public string CuisineType { get; set; } = "";

        [VectorStoreData(IsIndexed = true, StorageName = "diet_tags")]
        public List<string> DietTags { get; set; } = new();

        [VectorStoreData(StorageName = "has_image")]
        public bool HasImage { get; set; }

        [VectorStoreData(StorageName = "image_url")]
        public string ImageUrl { get; set; } = "";

        [VectorStoreData(StorageName = "embed_version")]
        public int EmbedVersion { get; set; }

        [VectorStoreData(StorageName = "embedded_at")]
        public long EmbeddedAt { get; set; }
    }
}