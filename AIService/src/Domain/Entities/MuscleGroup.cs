using AIService.Domain.Common;
using AIService.Domain.Exceptions;

namespace AIService.Domain.Entities
{
    public class MuscleGroup : BaseEntity<int>
    {
        public string NameEN { get; private set; }
        public string? NameVN { get; private set; }
        public bool IsFront { get; private set; }

        private MuscleGroup() { }

        private MuscleGroup(int id, string nameEn, bool isFront, string? nameVn)
        {
            if (string.IsNullOrEmpty(nameEn))
                throw new DomainException("Tên tiếng Anh không được để trống");

            Id = id;
            NameEN = nameEn;
            NameVN = nameVn;
            IsFront = isFront;
        }

        public static MuscleGroup Create(int id, string nameEn, bool isFront, string? nameVn)
        {
            return new MuscleGroup(id, nameEn, isFront, nameVn);
        }

        public static MuscleGroup CreateManual(string nameEn, bool isFront, string? nameVn)
        {
            return new MuscleGroup(0, nameEn, isFront, nameVn);
        }

        public void Update(string nameEn, bool isFront, string? nameVn)
        {
            if (string.IsNullOrEmpty(nameEn))
                throw new DomainException("Tên tiếng Anh không được để trống");

            NameEN = nameEn;
            NameVN = nameVn;
            IsFront = isFront;
        }
    }
}