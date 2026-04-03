using Microsoft.Extensions.VectorData;

namespace AIService.Application.Common.Models
{
    public class MealVectorRecord
    {
        [VectorStoreKey]
        public Guid Id { get; set; }

        [VectorStoreVector(1024, DistanceFunction = DistanceFunction.CosineSimilarity)]
        public ReadOnlyMemory<float> Vector { get; set; }

        [VectorStoreData(IsIndexed = true)]
        public int MealId { get; set; }

        [VectorStoreData(IsFullTextIndexed = true)]
        public string Name { get; set; }

        [VectorStoreData(IsIndexed = true)]
        public int Calories { get; set; }

        [VectorStoreData(IsIndexed = true)]
        public float Protein { get; set; }

        [VectorStoreData]
        public float Carbs { get; set; }

        [VectorStoreData]
        public float Fat { get; set; }

        [VectorStoreData(IsIndexed = true)]
        public string CuisineType { get; set; }

        [VectorStoreData(IsIndexed = true)]
        public List<string> DietTags { get; set; } = new();

        [VectorStoreData]
        public bool HasImage { get; set; }

        [VectorStoreData]
        public string ImageUrl { get; set; }

        [VectorStoreData]
        public int EmbedVersion { get; set; }

        [VectorStoreData]
        public long EmbeddedAt { get; set; }
    }
}