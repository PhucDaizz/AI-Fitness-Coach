using System;
using System.Collections.Generic;
using System.Linq;
using AIService.Domain.Entities;
using AIService.Domain.Enum;
using AIService.Domain.Exceptions;
using FluentAssertions;
using Xunit;

namespace AIService.Domain.UnitTests.Entities
{
    public class ExerciseTests
    {
        [Fact]
        public void Create_WithValidData_ShouldReturnExercise()
        {
            // Arrange
            int id = 1;
            Guid uuid = Guid.NewGuid();
            string name = "Push Up";
            string description = "Standard push up exercise";
            DescriptionSource source = DescriptionSource.wger;

            // Act
            var exercise = Exercise.Create(id, uuid, name, description, source);

            // Assert
            exercise.Should().NotBeNull();
            exercise.Id.Should().Be(id);
            exercise.UUId.Should().Be(uuid);
            exercise.Name.Should().Be(name);
            exercise.Description.Should().Be(description);
            exercise.DescriptionSource.Should().Be(source);
            exercise.EmbedStatus.Should().Be(EmbedStatus.pending);
            exercise.IsFrontImage.Should().BeTrue();
        }

        [Theory]
        [InlineData(-1)]
        [InlineData(-100)]
        public void Create_WithNegativeId_ShouldThrowDomainException(int invalidId)
        {
            // Arrange
            Guid uuid = Guid.NewGuid();
            string name = "Push Up";

            // Act
            Action act = () => Exercise.Create(invalidId, uuid, name);

            // Assert
            act.Should().Throw<DomainException>().WithMessage("id không hợp lệ");
        }

        [Theory]
        [InlineData("")]
        [InlineData(" ")]
        [InlineData(null)]
        public void Create_WithInvalidName_ShouldThrowDomainException(string? invalidName)
        {
            // Arrange
            int id = 1;
            Guid uuid = Guid.NewGuid();

            // Act
            Action act = () => Exercise.Create(id, uuid, invalidName!);

            // Assert
            act.Should().Throw<DomainException>().WithMessage("Tên bài tập không được để trống");
        }

        [Fact]
        public void CreateManual_WithValidName_ShouldCreateExerciseWithGeneratedUuidAndZeroId()
        {
            // Arrange
            string name = "Squat";

            // Act
            var exercise = Exercise.CreateManual(name);

            // Assert
            exercise.Should().NotBeNull();
            exercise.Id.Should().Be(0);
            exercise.UUId.Should().NotBeNull().And.NotBe(Guid.Empty);
            exercise.Name.Should().Be(name);
        }

        [Fact]
        public void Update_WithValidData_ShouldModifyProperties()
        {
            // Arrange
            var exercise = Exercise.Create(1, Guid.NewGuid(), "Old Name", "Old Description", DescriptionSource.wger);
            string newName = "New Name";
            string newDescription = "New Description";
            DescriptionSource newSource = DescriptionSource.gpt_generated;

            // Act
            exercise.Update(newName, newDescription, newSource);

            // Assert
            exercise.Name.Should().Be(newName);
            exercise.Description.Should().Be(newDescription);
            exercise.DescriptionSource.Should().Be(newSource);
        }

        [Theory]
        [InlineData("")]
        [InlineData(" ")]
        [InlineData(null)]
        public void Update_WithInvalidName_ShouldThrowDomainException(string? invalidName)
        {
            // Arrange
            var exercise = Exercise.Create(1, Guid.NewGuid(), "Old Name");

            // Act
            Action act = () => exercise.Update(invalidName!, "Description", DescriptionSource.wger);

            // Assert
            act.Should().Throw<DomainException>().WithMessage("Tên bài tập không được để trống");
        }

        [Fact]
        public void AddEquipment_WithNewEquipment_ShouldAddToList()
        {
            // Arrange
            var exercise = Exercise.Create(1, Guid.NewGuid(), "Push Up");
            var equipment = Equipment.Create(1, "Barbell", "Thanh tạ");

            // Act
            exercise.AddEquipment(equipment);

            // Assert
            exercise.Equipments.Should().ContainSingle()
                .Which.Should().BeEquivalentTo(equipment);
        }

        [Fact]
        public void AddEquipment_WithDuplicateEquipment_ShouldNotAddDuplicate()
        {
            // Arrange
            var exercise = Exercise.Create(1, Guid.NewGuid(), "Push Up");
            var equipment = Equipment.Create(1, "Barbell", "Thanh tạ");
            exercise.AddEquipment(equipment);

            // Act
            exercise.AddEquipment(equipment);

            // Assert
            exercise.Equipments.Should().HaveCount(1);
        }

        [Fact]
        public void AddMuscle_WithNewMuscle_ShouldAddToList()
        {
            // Arrange
            var exercise = Exercise.Create(1, Guid.NewGuid(), "Push Up");

            // Act
            exercise.AddMuscle(10, isPrimary: true);

            // Assert
            exercise.ExerciseMuscles.Should().ContainSingle();
            var muscle = exercise.ExerciseMuscles.First();
            muscle.MuscleId.Should().Be(10);
            muscle.IsPrimary.Should().BeTrue();
        }

        [Fact]
        public void RemoveMuscle_WithExistingMuscle_ShouldRemoveFromList()
        {
            // Arrange
            var exercise = Exercise.Create(1, Guid.NewGuid(), "Push Up");
            exercise.AddMuscle(10, isPrimary: true);
            exercise.ExerciseMuscles.Should().HaveCount(1);

            // Act
            exercise.RemoveMuscle(10);

            // Assert
            exercise.ExerciseMuscles.Should().BeEmpty();
        }

        [Fact]
        public void SyncMuscles_WithIncomingMuscles_ShouldAddUpdateAndRemoveMuscles()
        {
            // Arrange
            var exercise = Exercise.Create(1, Guid.NewGuid(), "Push Up");
            exercise.AddMuscle(1, isPrimary: true); // ID 1 is primary
            exercise.AddMuscle(2, isPrimary: false); // ID 2 is secondary

            var incomingMuscles = new List<(int MuscleId, bool IsPrimary)>
            {
                (2, true),  // ID 2 changes to primary
                (3, false)  // ID 3 is newly added
                // ID 1 should be removed
            };

            // Act
            exercise.SyncMuscles(incomingMuscles);

            // Assert
            exercise.ExerciseMuscles.Should().HaveCount(2);
            
            var muscle2 = exercise.ExerciseMuscles.FirstOrDefault(em => em.MuscleId == 2);
            muscle2.Should().NotBeNull();
            muscle2.IsPrimary.Should().BeTrue(); // Updated

            var muscle3 = exercise.ExerciseMuscles.FirstOrDefault(em => em.MuscleId == 3);
            muscle3.Should().NotBeNull();
            muscle3.IsPrimary.Should().BeFalse(); // Added

            exercise.ExerciseMuscles.Any(em => em.MuscleId == 1).Should().BeFalse(); // Removed
        }

        [Fact]
        public void SyncEquipments_WithIncomingEquipments_ShouldAddAndRemoveEquipments()
        {
            // Arrange
            var exercise = Exercise.Create(1, Guid.NewGuid(), "Push Up");
            var eq1 = Equipment.Create(1, "Dumbbell", "Tạ đơn");
            var eq2 = Equipment.Create(2, "Barbell", "Thanh tạ");
            exercise.AddEquipment(eq1);
            exercise.AddEquipment(eq2);

            var eq3 = Equipment.Create(3, "Kettlebell", "Tạ ấm");
            var incomingEquipments = new List<Equipment> { eq2, eq3 }; // Keep 2, add 3, remove 1

            // Act
            exercise.SyncEquipments(incomingEquipments);

            // Assert
            exercise.Equipments.Should().HaveCount(2);
            exercise.Equipments.Any(e => e.Id == 2).Should().BeTrue();
            exercise.Equipments.Any(e => e.Id == 3).Should().BeTrue();
            exercise.Equipments.Any(e => e.Id == 1).Should().BeFalse();
        }

        [Theory]
        [InlineData(0)]
        [InlineData(-5)]
        public void SetCategory_WithInvalidId_ShouldThrowDomainException(int invalidCategoryId)
        {
            // Arrange
            var exercise = Exercise.Create(1, Guid.NewGuid(), "Push Up");

            // Act
            Action act = () => exercise.SetCategory(invalidCategoryId);

            // Assert
            act.Should().Throw<DomainException>().WithMessage("ID Danh mục không hợp lệ");
        }

        [Fact]
        public void SetCategory_WithValidId_ShouldUpdateCategoryId()
        {
            // Arrange
            var exercise = Exercise.Create(1, Guid.NewGuid(), "Push Up");

            // Act
            exercise.SetCategory(5);

            // Assert
            exercise.CategoryId.Should().Be(5);
        }

        [Fact]
        public void SetImages_WithValidUrls_ShouldUpdateImages()
        {
            // Arrange
            var exercise = Exercise.Create(1, Guid.NewGuid(), "Push Up");
            string imageUrl = "http://example.com/image.jpg";
            string thumbnailUrl = "http://example.com/thumb.jpg";

            // Act
            exercise.SetImages(imageUrl, thumbnailUrl, isFront: false);

            // Assert
            exercise.ImageUrl.Should().Be(imageUrl);
            exercise.ImageThumbnailUrl.Should().Be(thumbnailUrl);
            exercise.IsFrontImage.Should().BeFalse();
        }

        [Fact]
        public void UpdateEmbedStatus_WithNewStatus_ShouldUpdateStatusAndTimestamp()
        {
            // Arrange
            var exercise = Exercise.Create(1, Guid.NewGuid(), "Push Up");
            var previousUpdateTime = exercise.UpdatedAt;

            // Act
            exercise.UpdateEmbedStatus(EmbedStatus.embedded);

            // Assert
            exercise.EmbedStatus.Should().Be(EmbedStatus.embedded);
            exercise.UpdatedAt.Should().NotBeNull();
            exercise.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(2));
        }
    }
}
