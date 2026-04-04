using AIService.Domain.Common;
using AIService.Domain.Enum;
using AIService.Domain.Exceptions;

namespace AIService.Domain.Entities
{
    public class Meal : BaseEntity<int>
    {
        public string Name { get; private set; }
        public string? Description { get; private set; }

        // Dinh dưỡng
        public int Calories { get; private set; }
        public float Protein { get; private set; }
        public float Carbs { get; private set; }
        public float Fat { get; private set; }

        // Phân loại
        public string? CuisineType { get; private set; }
        public List<string> DietTags { get; private set; } = new();

        // Media & AI
        public string? ImageUrl { get; private set; }
        public EmbedStatus EmbedStatus { get; private set; }

        private Meal() { }

        private Meal(string name, int calories, float protein, float carbs, float fat)
        {
            if (string.IsNullOrWhiteSpace(name)) throw new DomainException("Tên món ăn không được để trống");
            if (calories < 0 || protein < 0 || carbs < 0 || fat < 0)
                throw new DomainException("Chỉ số dinh dưỡng không được âm");

            Name = name;
            Calories = calories;
            Protein = protein;
            Carbs = carbs;
            Fat = fat;
            EmbedStatus = EmbedStatus.pending;
        }

        public static Meal Create(string name, int calories, float protein, float carbs, float fat)
        {
            return new Meal(name, calories, protein, carbs, fat);
        }

        public void Update(string name, int calories, float protein, float carbs, float fat)
        {
            if (string.IsNullOrWhiteSpace(name)) throw new DomainException("Tên món ăn không được để trống");
            if (calories < 0 || protein < 0 || carbs < 0 || fat < 0)
                throw new DomainException("Chỉ số dinh dưỡng không được âm");

            Name = name;
            Calories = calories;
            Protein = protein;
            Carbs = carbs;
            Fat = fat;
        }

        public void SetDetails(string? description, string? cuisineType, string? imageUrl)
        {
            Description = description;
            CuisineType = cuisineType;
            ImageUrl = imageUrl;
        }

        public void SetDietTags(List<string> tags)
        {
            DietTags = tags ?? new List<string>();
        }

        public void UpdateEmbedStatus(EmbedStatus status)
        {
            EmbedStatus = status;
            UpdatedAt = DateTime.UtcNow;
        }
    }
}