using AIService.Domain.Common;
using AIService.Domain.Enum;
using AIService.Domain.Exceptions;

namespace AIService.Domain.Entities
{
    public class Exercise : BaseEntity<int>, AggregateRoot
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

        public static Exercise CreateManual(string name, string? description = null, DescriptionSource source = DescriptionSource.wger)
        {
            return new Exercise(0, Guid.NewGuid(), name, description, source);
        }

        public void Update(string name, string? description, DescriptionSource source)
        {
            if (string.IsNullOrWhiteSpace(name)) throw new DomainException("Tên bài tập không được để trống");

            Name = name;
            Description = description;
            DescriptionSource = source;
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

        public void RemoveMuscle(int muscleId)
        {
            var muscleToRemove = _exerciseMuscles.FirstOrDefault(em => em.MuscleId == muscleId);
            if (muscleToRemove != null)
            {
                _exerciseMuscles.Remove(muscleToRemove);
            }
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

        public void SyncMuscles(List<(int MuscleId, bool IsPrimary)> incomingMuscles)
        {
            var incomingMuscleIds = incomingMuscles.Select(m => m.MuscleId).ToList();
            _exerciseMuscles.RemoveAll(em => !incomingMuscleIds.Contains(em.MuscleId));

            foreach (var incoming in incomingMuscles)
            {
                var existingMuscle = _exerciseMuscles.FirstOrDefault(em => em.MuscleId == incoming.MuscleId);

                if (existingMuscle != null)
                {
                    existingMuscle.Update(incoming.IsPrimary);
                }
                else
                {
                    _exerciseMuscles.Add(ExerciseMuscle.Create(this.Id, incoming.MuscleId, incoming.IsPrimary));
                }
            }
        }

        public void SyncEquipments(List<Equipment> incomingEquipments)
        {
            var incomingEqIds = incomingEquipments.Select(e => e.Id).ToList();

            _equipments.RemoveAll(e => !incomingEqIds.Contains(e.Id));

            foreach (var eq in incomingEquipments)
            {
                if (!_equipments.Any(e => e.Id == eq.Id))
                {
                    _equipments.Add(eq);
                }
            }
        }
    }
}