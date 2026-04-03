using Microsoft.Extensions.VectorData;

namespace AIService.Application.Common.Models
{
    public class ExerciseVectorRecord
    {
        [VectorStoreKey]
        public Guid Id { get; set; }

        [VectorStoreVector(1024, DistanceFunction = DistanceFunction.CosineSimilarity)]
        public ReadOnlyMemory<float> Vector { get; set; }

        [VectorStoreData(IsIndexed = true)]
        public int ExerciseId { get; set; }

        [VectorStoreData(IsFullTextIndexed = true)]
        public string Name { get; set; }

        [VectorStoreData(IsIndexed = true)]
        public string Category { get; set; }

        [VectorStoreData]
        public string CategoryVN { get; set; }

        [VectorStoreData(IsIndexed = true)]
        public List<string> PrimaryMuscles { get; set; } = new();

        [VectorStoreData(IsIndexed = true)]
        public List<string> SecondaryMuscles { get; set; } = new();

        [VectorStoreData(IsIndexed = true)]
        public List<string> Equipments { get; set; } = new();

        [VectorStoreData(IsIndexed = true)]
        public bool IsBodyweight { get; set; }

        [VectorStoreData(IsIndexed = true)]
        public List<string> LocationTypes { get; set; } = new();

        [VectorStoreData(IsIndexed = true)]
        public bool HasImage { get; set; }

        [VectorStoreData]
        public string ImageUrl { get; set; }

        [VectorStoreData]
        public string ImageThumbnailUrl { get; set; }

        [VectorStoreData]
        public bool IsFrontImage { get; set; }

        [VectorStoreData]
        public int EmbedVersion { get; set; }

        [VectorStoreData]
        public long EmbeddedAt { get; set; }
    }
}
