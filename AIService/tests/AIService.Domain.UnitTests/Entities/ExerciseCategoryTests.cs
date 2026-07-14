using AIService.Domain.Entities;
using AIService.Domain.Exceptions;
using FluentAssertions;
using Xunit;

namespace AIService.Domain.UnitTests.Entities
{
    public class ExerciseCategoryTests
    {
        [Fact]
        public void Create_WithValidData_ShouldReturnCategory()
        {
            // Act
            var category = ExerciseCategory.Create(1, "Strength", "Sức mạnh");

            // Assert
            category.Should().NotBeNull();
            category.Id.Should().Be(1);
            category.Name.Should().Be("Strength");
            category.NameVN.Should().Be("Sức mạnh");
        }

        [Fact]
        public void Create_WithEmptyName_ShouldThrowDomainException()
        {
            // Act
            var act = () => ExerciseCategory.Create(1, "", "Sức mạnh");

            // Assert
            act.Should().Throw<DomainException>()
               .WithMessage("Tên danh mục không được để trống");
        }

        [Fact]
        public void CreateManual_WithValidData_ShouldReturnCategoryWithZeroId()
        {
            // Act
            var category = ExerciseCategory.CreateManual("Cardio", "Tim mạch");

            // Assert
            category.Should().NotBeNull();
            category.Id.Should().Be(0);
            category.Name.Should().Be("Cardio");
            category.NameVN.Should().Be("Tim mạch");
        }

        [Fact]
        public void Update_WithValidData_ShouldUpdateProperties()
        {
            // Arrange
            var category = ExerciseCategory.Create(1, "Strength", "Sức mạnh");

            // Act
            category.Update("Power", "Sức mạnh bộc phát");

            // Assert
            category.Name.Should().Be("Power");
            category.NameVN.Should().Be("Sức mạnh bộc phát");
        }

        [Fact]
        public void Update_WithEmptyName_ShouldThrowDomainException()
        {
            // Arrange
            var category = ExerciseCategory.Create(1, "Strength", "Sức mạnh");

            // Act
            var act = () => category.Update("", "Sức mạnh");

            // Assert
            act.Should().Throw<DomainException>()
               .WithMessage("Tên danh mục không được để trống");
        }
    }
}
