using AIService.Domain.Common;
using AIService.Domain.Enum;
using AIService.Domain.Exceptions;

namespace AIService.Domain.Entities
{
    public class Exercise : BaseEntity<int>
    {
        public Guid? UUId { get; private set; }
        public string Name { get; private set; }
        public string? Description { get; private set; }
        public DescriptionSource DescriptionSource { get; private set; }

        public int? CategoryId { get; private set; }
        public ExerciseCategory? Category { get; private set; }

        // 3. Quan hệ N-N với Cơ và Thiết bị (Navigation Properties)
        private readonly List<ExerciseMuscle> _exerciseMuscles = new();
        public IReadOnlyCollection<ExerciseMuscle> ExerciseMuscles => _exerciseMuscles.AsReadOnly();

        public IEnumerable<MuscleGroup> PrimaryMuscles => _exerciseMuscles.Where(em => em.IsPrimary).Select(em => em.MuscleGroup);
        public IEnumerable<MuscleGroup> SecondaryMuscles => _exerciseMuscles.Where(em => !em.IsPrimary).Select(em => em.MuscleGroup);


        private readonly List<Equipment> _equipments = new();
        public IReadOnlyCollection<Equipment> Equipments => _equipments.AsReadOnly();

        // 4. Dữ liệu bổ trợ cho AI & Logic
        public List<string> LocationType { get; private set; } = new(); // ["Gym", "Home"]
        public string? ImageUrl { get; private set; }
        public string? ImageThumbnailUrl { get; private set; }
        public bool IsFrontImage { get; private set; }
        public EmbedStatus EmbedStatus { get; private set; }

        private Exercise() { }

        private Exercise(int id, Guid? uuId, string name, string? description, DescriptionSource source)
        {
            if (id <= 0) throw new DomainException("id không hợp lệ");
            if (string.IsNullOrWhiteSpace(name)) throw new DomainException("Tên bài tập không được để trống");

            Id = id;
            UUId = uuId;
            Name = name;
            Description = description;
            DescriptionSource = source;
            EmbedStatus = EmbedStatus.pending;
            IsFrontImage = true;
        }

        public static Exercise Create(int id, Guid? uuId, string name, string? description = null, DescriptionSource source = DescriptionSource.wger)
        {
            return new Exercise(id, uuId, name, description, source);
        }


        public void AddEquipment(Equipment equipment)
        {
            if (equipment == null) return;
            if (!_equipments.Any(e => e.Id == equipment.Id))
                _equipments.Add(equipment);
        }

        public void AddMuscle(int muscleId, bool isPrimary)
        {
            if (!_exerciseMuscles.Any(em => em.MuscleId == muscleId && em.IsPrimary == isPrimary))
                _exerciseMuscles.Add(new ExerciseMuscle(this.Id, muscleId, isPrimary));
        }

        public void SetLocationTypes(List<string> locations)
        {
            LocationType = locations ?? new List<string>();
        }

        public void UpdateEmbedStatus(EmbedStatus status)
        {
            EmbedStatus = status;
            UpdatedAt = DateTime.UtcNow;
        }

        public void SetCategory(int? categoryId)
        {
            if (categoryId.HasValue && categoryId.Value <= 0)
                throw new DomainException("ID Danh mục không hợp lệ");

            CategoryId = categoryId;
        }

        public void SetImages(string? imageUrl, string? thumbnail_url, bool isFront = true)
        {
            ImageUrl = imageUrl;
            ImageThumbnailUrl = thumbnail_url;
            IsFrontImage = isFront;
        }
    }
}