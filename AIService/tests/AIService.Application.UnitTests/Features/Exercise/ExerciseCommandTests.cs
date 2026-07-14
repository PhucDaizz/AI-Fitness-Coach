using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using AIService.Application.Common.Interfaces;
using AIService.Application.Common.Models;
using AIService.Application.DTOs.MuscleGroup;
using AIService.Application.Features.Exercise.Commands.CreateExercise;
using AIService.Application.Features.Exercise.Commands.DeleteExercise;
using AIService.Application.Features.Exercise.Commands.UpdateExercise;
using AIService.Domain.Entities;
using AIService.Domain.Enum;
using AIService.Domain.Repositories;
using Domain.Common.Response;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.VectorData;
using NSubstitute;
using Xunit;

namespace AIService.Application.UnitTests.Features.Exercise
{
    public class ExerciseCommandTests
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IExerciseRepository _exerciseRepository;
        private readonly IMuscleGroupRepository _muscleRepository;
        private readonly IEquipmentRepository _equipmentRepository;
        private readonly VectorStoreCollection<Guid, ExerciseVectorRecord> _exerciseVectors;
        private readonly ILogger<DeleteExerciseCommandHandler> _logger;

        public ExerciseCommandTests()
        {
            _unitOfWork = Substitute.For<IUnitOfWork>();
            _exerciseRepository = Substitute.For<IExerciseRepository>();
            _muscleRepository = Substitute.For<IMuscleGroupRepository>();
            _equipmentRepository = Substitute.For<IEquipmentRepository>();

            _unitOfWork.ExerciseRepository.Returns(_exerciseRepository);
            _unitOfWork.MuscleGroupRepository.Returns(_muscleRepository);
            _unitOfWork.EquipmentRepository.Returns(_equipmentRepository);

            _exerciseVectors = Substitute.For<VectorStoreCollection<Guid, ExerciseVectorRecord>>();
            _logger = Substitute.For<ILogger<DeleteExerciseCommandHandler>>();
        }

        #region CreateExerciseCommand Tests

        [Fact]
        public async Task Handle_CreateExercise_ShouldAddExerciseWithRelationsAndSave()
        {
            // Arrange
            var muscleGroup = AIService.Domain.Entities.MuscleGroup.Create(10, "Biceps", true, "Cơ nhị đầu");
            var equipment = AIService.Domain.Entities.Equipment.Create(20, "Barbell", "Thanh tạ");

            _muscleRepository.GetByIdAsync(10).Returns(muscleGroup);
            _equipmentRepository.GetByIdAsync(20).Returns(equipment);

            var handler = new CreateExerciseCommandHandler(_unitOfWork);
            var command = new CreateExerciseCommand
            {
                Name = "Bicep Curl",
                Description = "Standard bicep curl",
                DescriptionSource = DescriptionSource.gpt_generated,
                CategoryId = 2,
                LocationType = new List<string> { "Gym" },
                ImageUrl = "http://example.com/curl.jpg",
                ImageThumbnailUrl = "http://example.com/curl-thumb.jpg",
                IsFrontImage = true,
                Muscles = new List<MuscleInputDto> { new MuscleInputDto { MuscleId = 10, IsPrimary = true } },
                EquipmentIds = new List<int> { 20 }
            };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.IsSuccess.Should().BeTrue();
            result.Value.Should().BeTrue();

            await _exerciseRepository.Received(1).AddAsync(
                Arg.Is<AIService.Domain.Entities.Exercise>(e => 
                    e != null && 
                    e.Name == "Bicep Curl" && 
                    e.CategoryId == 2 && 
                    e.ImageUrl == "http://example.com/curl.jpg"),
                Arg.Any<CancellationToken>());

            await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
        }

        #endregion

        #region UpdateExerciseCommand Tests

        [Fact]
        public async Task Handle_UpdateExercise_WhenExerciseExists_ShouldUpdateDetailsAndRelationsAndSave()
        {
            // Arrange
            int id = 1;
            var existingExercise = AIService.Domain.Entities.Exercise.Create(id, Guid.NewGuid(), "Old Name");
            _exerciseRepository.GetByIdWithDetailsAsync(id, Arg.Any<CancellationToken>()).Returns(existingExercise);

            var equipment = AIService.Domain.Entities.Equipment.Create(20, "Barbell", "Thanh tạ");
            _equipmentRepository.GetByIdAsync(20, Arg.Any<CancellationToken>()).Returns(equipment);

            var handler = new UpdateExerciseCommandHandler(_unitOfWork);
            var command = new UpdateExerciseCommand
            {
                Id = id,
                Name = "New Name",
                Description = "New Description",
                DescriptionSource = DescriptionSource.manual,
                CategoryId = 5,
                LocationType = new List<string> { "Home" },
                ImageUrl = "http://example.com/new.jpg",
                ImageThumbnailUrl = "http://example.com/new-thumb.jpg",
                IsFrontImage = false,
                Muscles = new List<UpdateMuscleInputDto> { new UpdateMuscleInputDto { MuscleId = 10, IsPrimary = false } },
                EquipmentIds = new List<int> { 20 }
            };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.IsSuccess.Should().BeTrue();
            result.Value.Should().BeTrue();

            existingExercise.Name.Should().Be("New Name");
            existingExercise.Description.Should().Be("New Description");
            existingExercise.CategoryId.Should().Be(5);
            existingExercise.IsFrontImage.Should().BeFalse();

            _exerciseRepository.Received(1).Update(existingExercise);
            await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Handle_UpdateExercise_WhenExerciseDoesNotExist_ShouldReturnFailureResult()
        {
            // Arrange
            int id = 99;
            _exerciseRepository.GetByIdWithDetailsAsync(id, Arg.Any<CancellationToken>()).Returns((AIService.Domain.Entities.Exercise)null!);

            var handler = new UpdateExerciseCommandHandler(_unitOfWork);
            var command = new UpdateExerciseCommand { Id = id };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.IsSuccess.Should().BeFalse();
            result.Error.Code.Should().Be("Exercise.NotFound");
            result.Error.Message.Should().Be($"Không tìm thấy bài tập với Id: {id}");

            _exerciseRepository.DidNotReceiveWithAnyArgs().Update(default!);
            await _unitOfWork.DidNotReceiveWithAnyArgs().SaveChangesAsync(Arg.Any<CancellationToken>());
        }

        #endregion

        #region DeleteExerciseCommand Tests

        [Fact]
        public async Task Handle_DeleteExercise_WhenExerciseExists_ShouldDeleteVectorAndExerciseAndSave()
        {
            // Arrange
            int id = 1;
            var existingExercise = AIService.Domain.Entities.Exercise.Create(id, Guid.NewGuid(), "Push Up");
            _exerciseRepository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(existingExercise);

            var handler = new DeleteExerciseCommandHandler(_unitOfWork, _exerciseVectors, _logger);
            var command = new DeleteExerciseCommand { Id = id };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.IsSuccess.Should().BeTrue();
            result.Value.Should().BeTrue();

            await _exerciseVectors.Received(1).DeleteAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
            _exerciseRepository.Received(1).Delete(existingExercise);
            await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Handle_DeleteExercise_WhenVectorDeletionFails_ShouldStillDeleteExerciseFromSqlAndSave()
        {
            // Arrange
            int id = 1;
            var existingExercise = AIService.Domain.Entities.Exercise.Create(id, Guid.NewGuid(), "Push Up");
            _exerciseRepository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(existingExercise);

            _exerciseVectors
                .When(x => x.DeleteAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>()))
                .Do(x => throw new Exception("VectorDB Error"));

            var handler = new DeleteExerciseCommandHandler(_unitOfWork, _exerciseVectors, _logger);
            var command = new DeleteExerciseCommand { Id = id };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.IsSuccess.Should().BeTrue();
            result.Value.Should().BeTrue();

            _exerciseRepository.Received(1).Delete(existingExercise);
            await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Handle_DeleteExercise_WhenExerciseDoesNotExist_ShouldReturnFailureResult()
        {
            // Arrange
            int id = 99;
            _exerciseRepository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns((AIService.Domain.Entities.Exercise)null!);

            var handler = new DeleteExerciseCommandHandler(_unitOfWork, _exerciseVectors, _logger);
            var command = new DeleteExerciseCommand { Id = id };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.IsSuccess.Should().BeFalse();
            result.Error.Code.Should().Be("Exercise.NotFound");
            result.Error.Message.Should().Be($"Không tìm thấy bài tập với Id: {id}");

            await _exerciseVectors.DidNotReceiveWithAnyArgs().DeleteAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
            _exerciseRepository.DidNotReceiveWithAnyArgs().Delete(default!);
            await _unitOfWork.DidNotReceiveWithAnyArgs().SaveChangesAsync(Arg.Any<CancellationToken>());
        }

        #endregion
    }
}
