using System;
using AIService.Domain.Entities;
using AIService.Domain.Exceptions;
using FluentAssertions;
using Xunit;

namespace AIService.Domain.UnitTests.Entities
{
    public class EquipmentTests
    {
        [Fact]
        public void Create_WithValidData_ShouldReturnEquipment()
        {
            // Arrange
            int id = 1;
            string name = "Barbell";
            string nameVn = "Thanh tạ";

            // Act
            var equipment = Equipment.Create(id, name, nameVn);

            // Assert
            equipment.Should().NotBeNull();
            equipment.Id.Should().Be(id);
            equipment.Name.Should().Be(name);
            equipment.NameVN.Should().Be(nameVn);
        }

        [Theory]
        [InlineData("")]
        [InlineData(null)]
        public void Create_WithInvalidName_ShouldThrowDomainException(string? invalidName)
        {
            // Arrange
            int id = 1;

            // Act
            Action act = () => Equipment.Create(id, invalidName!, "Thanh tạ");

            // Assert
            act.Should().Throw<DomainException>().WithMessage("Tên thiết bị không được để trống");
        }

        [Fact]
        public void CreateManual_WithValidName_ShouldCreateEquipmentWithZeroId()
        {
            // Arrange
            string name = "Dumbbell";
            string nameVn = "Tạ đơn";

            // Act
            var equipment = Equipment.CreateManual(name, nameVn);

            // Assert
            equipment.Should().NotBeNull();
            equipment.Id.Should().Be(0);
            equipment.Name.Should().Be(name);
            equipment.NameVN.Should().Be(nameVn);
        }

        [Fact]
        public void Update_WithValidData_ShouldModifyProperties()
        {
            // Arrange
            var equipment = Equipment.Create(1, "Barbell", "Thanh tạ");
            string newName = "Dumbbell";
            string newNameVn = "Tạ đơn";

            // Act
            equipment.Update(newName, newNameVn);

            // Assert
            equipment.Name.Should().Be(newName);
            equipment.NameVN.Should().Be(newNameVn);
        }

        [Theory]
        [InlineData("")]
        [InlineData(null)]
        public void Update_WithInvalidName_ShouldThrowDomainException(string? invalidName)
        {
            // Arrange
            var equipment = Equipment.Create(1, "Barbell", "Thanh tạ");

            // Act
            Action act = () => equipment.Update(invalidName!, "Tạ đơn");

            // Assert
            act.Should().Throw<DomainException>().WithMessage("Tên thiết bị không được để trống");
        }
    }
}
