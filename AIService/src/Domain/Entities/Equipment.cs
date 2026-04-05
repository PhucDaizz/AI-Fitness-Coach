using AIService.Domain.Common;
using AIService.Domain.Exceptions;

namespace AIService.Domain.Entities
{
    public class Equipment : BaseEntity<int>
    {
        public string Name { get; private set; }
        public string? NameVN { get; private set; }

        private Equipment() { }

        private Equipment(int id, string name, string? nameVn)
        {
            if (string.IsNullOrEmpty(name))
                throw new DomainException("Tên thiết bị không được để trống");

            Id = id;
            Name = name;
            NameVN = nameVn;
        }

        public static Equipment Create(int id, string name, string? nameVn)
        {
            return new Equipment(id, name, nameVn);
        }

        public static Equipment CreateManual(string name, string? nameVn)
        {
            return new Equipment(0, name, nameVn);
        }

        public void Update(string name, string? nameVn)
        {
            if (string.IsNullOrEmpty(name))
                throw new DomainException("Tên thiết bị không được để trống");

            Name = name;
            NameVN = nameVn;
        }
    }
}