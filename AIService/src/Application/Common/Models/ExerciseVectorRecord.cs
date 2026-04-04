using Microsoft.Extensions.VectorData;

namespace AIService.Application.Common.Models
{
    public class ExerciseVectorRecord
    {
        [VectorStoreKey]
        public Guid Id { get; set; }

        [VectorStoreVector(1024, DistanceFunction = DistanceFunction.CosineSimilarity)]
        public ReadOnlyMemory<float> Vector { get; set; }

        [VectorStoreData(IsIndexed = true, StorageName = "exercise_id")]
        public int ExerciseId { get; set; }

        [VectorStoreData(IsFullTextIndexed = true, StorageName = "name")]
        public string Name { get; set; } = "";

        [VectorStoreData(IsIndexed = true, StorageName = "category")]
        public string Category { get; set; } = "";

        [VectorStoreData(StorageName = "category_vn")]
        public string CategoryVN { get; set; } = "";

        [VectorStoreData(IsIndexed = true, StorageName = "primary_muscles")]
        public List<string> PrimaryMuscles { get; set; } = new();

        [VectorStoreData(IsIndexed = true, StorageName = "secondary_muscles")]
        public List<string> SecondaryMuscles { get; set; } = new();

        [VectorStoreData(IsIndexed = true, StorageName = "equipments")]
        public List<string> Equipments { get; set; } = new();

        [VectorStoreData(IsIndexed = true, StorageName = "is_bodyweight")]
        public bool IsBodyweight { get; set; }

        [VectorStoreData(IsIndexed = true, StorageName = "location_types")]
        public List<string> LocationTypes { get; set; } = new();

        [VectorStoreData(IsIndexed = true, StorageName = "has_image")]
        public bool HasImage { get; set; }

        [VectorStoreData(StorageName = "image_url")]
        public string ImageUrl { get; set; } = "";

        [VectorStoreData(StorageName = "image_thumbnail_url")]
        public string ImageThumbnailUrl { get; set; } = "";

        [VectorStoreData(StorageName = "is_front_image")]
        public bool IsFrontImage { get; set; }

        [VectorStoreData(StorageName = "embed_version")]
        public int EmbedVersion { get; set; }

        [VectorStoreData(StorageName = "embedded_at")]
        public long EmbeddedAt { get; set; }
    }
}