using AIService.Domain.Common;
using AIService.Domain.Exceptions;

namespace AIService.Domain.Entities
{
    public class ExerciseCategory : BaseEntity<int>
    {
        public string Name { get; private set; }
        public string? NameVN { get; private set; }

        private ExerciseCategory() { }

        private ExerciseCategory(int id, string name, string? nameVn)
        {
            if (string.IsNullOrEmpty(name))
                throw new DomainException("Tên danh mục không được để trống");

            Id = id;
            Name = name;
            NameVN = nameVn;
        }

        public static ExerciseCategory Create(int id, string name, string? nameVn)
        {
            return new ExerciseCategory(id, name, nameVn);
        }

        public static ExerciseCategory CreateManual(string name, string? nameVn)
        {
            return new ExerciseCategory(0, name, nameVn);
        }

        public void Update(string name, string? nameVn)
        {
            if (string.IsNullOrEmpty(name))
                throw new DomainException("Tên danh mục không được để trống");

            Name = name;
            NameVN = nameVn;
        }
    }
}