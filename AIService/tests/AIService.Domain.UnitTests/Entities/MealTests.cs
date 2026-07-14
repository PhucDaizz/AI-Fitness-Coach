using System;
using System.Collections.Generic;
using AIService.Domain.Entities;
using AIService.Domain.Enum;
using AIService.Domain.Exceptions;
using FluentAssertions;
using Xunit;

namespace AIService.Domain.UnitTests.Entities
{
    public class MealTests
    {
        [Fact]
        public void Create_WithValidData_ShouldReturnMeal()
        {
            // Arrange
            string name = "Chicken Breast";
            int calories = 165;
            float protein = 31f;
            float carbs = 0f;
            float fat = 3.6f;

            // Act
            var meal = Meal.Create(name, calories, protein, carbs, fat);

            // Assert
            meal.Should().NotBeNull();
            meal.Name.Should().Be(name);
            meal.Calories.Should().Be(calories);
            meal.Protein.Should().Be(protein);
            meal.Carbs.Should().Be(carbs);
            meal.Fat.Should().Be(fat);
            meal.EmbedStatus.Should().Be(EmbedStatus.pending);
        }

        [Theory]
        [InlineData("")]
        [InlineData(" ")]
        [InlineData(null)]
        public void Create_WithInvalidName_ShouldThrowDomainException(string? invalidName)
        {
            // Act
            Action act = () => Meal.Create(invalidName!, 100, 10f, 10f, 2f);

            // Assert
            act.Should().Throw<DomainException>().WithMessage("Tên món ăn không được để trống");
        }

        [Theory]
        [InlineData(-1, 10f, 10f, 2f)]
        [InlineData(100, -1f, 10f, 2f)]
        [InlineData(100, 10f, -1f, 2f)]
        [InlineData(100, 10f, 10f, -2f)]
        public void Create_WithNegativeNutrients_ShouldThrowDomainException(int calories, float protein, float carbs, float fat)
        {
            // Act
            Action act = () => Meal.Create("Chicken", calories, protein, carbs, fat);

            // Assert
            act.Should().Throw<DomainException>().WithMessage("Chỉ số dinh dưỡng không được âm");
        }

        [Fact]
        public void Update_WithValidData_ShouldModifyProperties()
        {
            // Arrange
            var meal = Meal.Create("Chicken Breast", 165, 31f, 0f, 3.6f);
            string newName = "Salmon";
            int newCalories = 208;
            float newProtein = 20f;
            float newCarbs = 0f;
            float newFat = 13f;

            // Act
            meal.Update(newName, newCalories, newProtein, newCarbs, newFat);

            // Assert
            meal.Name.Should().Be(newName);
            meal.Calories.Should().Be(newCalories);
            meal.Protein.Should().Be(newProtein);
            meal.Carbs.Should().Be(newCarbs);
            meal.Fat.Should().Be(newFat);
        }

        [Theory]
        [InlineData("")]
        [InlineData(" ")]
        [InlineData(null)]
        public void Update_WithInvalidName_ShouldThrowDomainException(string? invalidName)
        {
            // Arrange
            var meal = Meal.Create("Chicken Breast", 165, 31f, 0f, 3.6f);

            // Act
            Action act = () => meal.Update(invalidName!, 200, 20f, 10f, 5f);

            // Assert
            act.Should().Throw<DomainException>().WithMessage("Tên món ăn không được để trống");
        }

        [Fact]
        public void SetDetails_WithValidData_ShouldUpdateProperties()
        {
            // Arrange
            var meal = Meal.Create("Chicken Breast", 165, 31f, 0f, 3.6f);
            string description = "Baked chicken breast with herbs";
            string cuisineType = "Western";
            string imageUrl = "http://example.com/chicken.jpg";

            // Act
            meal.SetDetails(description, cuisineType, imageUrl);

            // Assert
            meal.Description.Should().Be(description);
            meal.CuisineType.Should().Be(cuisineType);
            meal.ImageUrl.Should().Be(imageUrl);
        }

        [Fact]
        public void SetDietTags_WithTags_ShouldUpdateDietTags()
        {
            // Arrange
            var meal = Meal.Create("Chicken Breast", 165, 31f, 0f, 3.6f);
            var tags = new List<string> { "HighProtein", "LowCarb" };

            // Act
            meal.SetDietTags(tags);

            // Assert
            meal.DietTags.Should().BeEquivalentTo(tags);
        }

        [Fact]
        public void SetDietTags_WithNull_ShouldResetToEmptyList()
        {
            // Arrange
            var meal = Meal.Create("Chicken Breast", 165, 31f, 0f, 3.6f);
            meal.SetDietTags(new List<string> { "HighProtein" });

            // Act
            meal.SetDietTags(null!);

            // Assert
            meal.DietTags.Should().BeEmpty();
        }

        [Fact]
        public void UpdateEmbedStatus_WithNewStatus_ShouldUpdateStatusAndTimestamp()
        {
            // Arrange
            var meal = Meal.Create("Chicken Breast", 165, 31f, 0f, 3.6f);

            // Act
            meal.UpdateEmbedStatus(EmbedStatus.embedded);

            // Assert
            meal.EmbedStatus.Should().Be(EmbedStatus.embedded);
            meal.UpdatedAt.Should().NotBeNull();
            meal.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(2));
        }
    }
}
