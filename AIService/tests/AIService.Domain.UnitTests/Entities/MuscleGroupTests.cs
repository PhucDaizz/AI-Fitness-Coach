using AIService.Domain.Entities;
using AIService.Domain.Exceptions;
using FluentAssertions;
using Xunit;

namespace AIService.Domain.UnitTests.Entities
{
    public class MuscleGroupTests
    {
        [Fact]
        public void Create_WithValidData_ShouldReturnMuscleGroup()
        {
            // Act
            var muscleGroup = MuscleGroup.Create(1, "Chest", true, "Ngực");

            // Assert
            muscleGroup.Should().NotBeNull();
            muscleGroup.Id.Should().Be(1);
            muscleGroup.NameEN.Should().Be("Chest");
            muscleGroup.IsFront.Should().BeTrue();
            muscleGroup.NameVN.Should().Be("Ngực");
        }

        [Fact]
        public void Create_WithEmptyNameEn_ShouldThrowDomainException()
        {
            // Act
            var act = () => MuscleGroup.Create(1, "", true, "Ngực");

            // Assert
            act.Should().Throw<DomainException>()
               .WithMessage("Tên tiếng Anh không được để trống");
        }

        [Fact]
        public void CreateManual_WithValidData_ShouldReturnMuscleGroupWithZeroId()
        {
            // Act
            var muscleGroup = MuscleGroup.CreateManual("Back", false, "Lưng");

            // Assert
            muscleGroup.Should().NotBeNull();
            muscleGroup.Id.Should().Be(0);
            muscleGroup.NameEN.Should().Be("Back");
            muscleGroup.IsFront.Should().BeFalse();
            muscleGroup.NameVN.Should().Be("Lưng");
        }

        [Fact]
        public void Update_WithValidData_ShouldUpdateProperties()
        {
            // Arrange
            var muscleGroup = MuscleGroup.Create(1, "Chest", true, "Ngực");

            // Act
            muscleGroup.Update("Pectorals", true, "Cơ ngực lớn");

            // Assert
            muscleGroup.NameEN.Should().Be("Pectorals");
            muscleGroup.IsFront.Should().BeTrue();
            muscleGroup.NameVN.Should().Be("Cơ ngực lớn");
        }

        [Fact]
        public void Update_WithEmptyNameEn_ShouldThrowDomainException()
        {
            // Arrange
            var muscleGroup = MuscleGroup.Create(1, "Chest", true, "Ngực");

            // Act
            var act = () => muscleGroup.Update("", true, "Ngực");

            // Assert
            act.Should().Throw<DomainException>()
               .WithMessage("Tên tiếng Anh không được để trống");
        }
    }
}
