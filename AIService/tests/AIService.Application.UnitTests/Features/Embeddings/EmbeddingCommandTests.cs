using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AIService.Application.Common.Interfaces;
using AIService.Application.Common.Models;
using AIService.Application.Features.Embeddings.Commands.SyncExerciseEmbedding;
using AIService.Application.Features.Embeddings.Commands.SyncMealEmbedding;
using AIService.Domain.Entities;
using AIService.Domain.Enum;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.VectorData;
using MockQueryable.NSubstitute;
using NSubstitute;
using Xunit;

namespace AIService.Application.UnitTests.Features.Embeddings
{
    public class EmbeddingCommandTests
    {
        private readonly IApplicationDbContext _context;
        private readonly IEmbeddingService _embeddingService;
        private readonly VectorStoreCollection<Guid, ExerciseVectorRecord> _exerciseVectors;
        private readonly VectorStoreCollection<Guid, MealVectorRecord> _mealVectors;
        private readonly ILogger<SyncExerciseEmbeddingCommandHandler> _exerciseLogger;
        private readonly ILogger<SyncMealEmbeddingCommandHandler> _mealLogger;

        public EmbeddingCommandTests()
        {
            _context = Substitute.For<IApplicationDbContext>();
            _embeddingService = Substitute.For<IEmbeddingService>();
            _exerciseVectors = Substitute.For<VectorStoreCollection<Guid, ExerciseVectorRecord>>();
            _mealVectors = Substitute.For<VectorStoreCollection<Guid, MealVectorRecord>>();
            _exerciseLogger = Substitute.For<ILogger<SyncExerciseEmbeddingCommandHandler>>();
            _mealLogger = Substitute.For<ILogger<SyncMealEmbeddingCommandHandler>>();
        }

        #region SyncExerciseEmbeddingCommand Tests

        [Fact]
        public async Task Handle_SyncExercise_WhenExerciseExists_ShouldGenerateEmbeddingAndUpsertAndSave()
        {
            // Arrange
            int exerciseId = 1;
            var exercise = AIService.Domain.Entities.Exercise.Create(exerciseId, Guid.NewGuid(), "Push Up");
            var exerciseList = new List<AIService.Domain.Entities.Exercise> { exercise };
            var mockDbSet = exerciseList.BuildMockDbSet();
            _context.Exercises.Returns(mockDbSet);

            var floatArray = new float[] { 0.1f, 0.2f, 0.3f };
            _embeddingService.GenerateEmbeddingAsync(Arg.Any<string>(), Arg.Any<CancellationToken>())
                .Returns(floatArray);

            var handler = new SyncExerciseEmbeddingCommandHandler(_context, _embeddingService, _exerciseVectors, _exerciseLogger);
            var command = new SyncExerciseEmbeddingCommand(exerciseId);

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.Should().BeTrue();
            exercise.EmbedStatus.Should().Be(EmbedStatus.embedded);

            await _exerciseVectors.Received(1).EnsureCollectionExistsAsync(Arg.Any<CancellationToken>());
            await _exerciseVectors.Received(1).UpsertAsync(
                Arg.Is<ExerciseVectorRecord>(r => r.ExerciseId == exerciseId && r.Name == "Push Up"),
                Arg.Any<CancellationToken>());

            await _context.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Handle_SyncExercise_WhenExerciseDoesNotExist_ShouldReturnFalse()
        {
            // Arrange
            int exerciseId = 99;
            var exerciseList = new List<AIService.Domain.Entities.Exercise>();
            var mockDbSet = exerciseList.BuildMockDbSet();
            _context.Exercises.Returns(mockDbSet);

            var handler = new SyncExerciseEmbeddingCommandHandler(_context, _embeddingService, _exerciseVectors, _exerciseLogger);
            var command = new SyncExerciseEmbeddingCommand(exerciseId);

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.Should().BeFalse();

            await _exerciseVectors.DidNotReceiveWithAnyArgs().EnsureCollectionExistsAsync(Arg.Any<CancellationToken>());
            await _exerciseVectors.DidNotReceiveWithAnyArgs().UpsertAsync((ExerciseVectorRecord)default!, Arg.Any<CancellationToken>());
            await _context.DidNotReceiveWithAnyArgs().SaveChangesAsync(Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Handle_SyncExercise_WhenEmbeddingGenerationFails_ShouldThrowException()
        {
            // Arrange
            int exerciseId = 1;
            var exercise = AIService.Domain.Entities.Exercise.Create(exerciseId, Guid.NewGuid(), "Push Up");
            var exerciseList = new List<AIService.Domain.Entities.Exercise> { exercise };
            var mockDbSet = exerciseList.BuildMockDbSet();
            _context.Exercises.Returns(mockDbSet);

            _embeddingService.GenerateEmbeddingAsync(Arg.Any<string>(), Arg.Any<CancellationToken>())
                .Returns((float[])null!);

            var handler = new SyncExerciseEmbeddingCommandHandler(_context, _embeddingService, _exerciseVectors, _exerciseLogger);
            var command = new SyncExerciseEmbeddingCommand(exerciseId);

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.Should().BeFalse();
            exercise.EmbedStatus.Should().Be(EmbedStatus.pending); // Remains pending

            await _exerciseVectors.DidNotReceiveWithAnyArgs().UpsertAsync((ExerciseVectorRecord)default!, Arg.Any<CancellationToken>());
            await _context.DidNotReceiveWithAnyArgs().SaveChangesAsync(Arg.Any<CancellationToken>());
        }

        #endregion

        #region SyncMealEmbeddingCommand Tests

        [Fact]
        public async Task Handle_SyncMeal_WhenMealExists_ShouldGenerateEmbeddingAndUpsertAndSave()
        {
            // Arrange
            int mealId = 1;
            var meal = AIService.Domain.Entities.Meal.Create("Chicken Breast", 165, 31f, 0f, 3.6f);
            meal.GetType().GetProperty("Id")?.SetValue(meal, mealId); // EF set ID
            
            var mealList = new List<AIService.Domain.Entities.Meal> { meal };
            var mockDbSet = mealList.BuildMockDbSet();
            _context.Meals.Returns(mockDbSet);

            var floatArray = new float[] { 0.4f, 0.5f, 0.6f };
            _embeddingService.GenerateEmbeddingAsync(Arg.Any<string>(), Arg.Any<CancellationToken>())
                .Returns(floatArray);

            var handler = new SyncMealEmbeddingCommandHandler(_context, _embeddingService, _mealVectors, _mealLogger);
            var command = new SyncMealEmbeddingCommand(mealId);

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.Should().BeTrue();
            meal.EmbedStatus.Should().Be(EmbedStatus.embedded);

            await _mealVectors.Received(1).EnsureCollectionExistsAsync(Arg.Any<CancellationToken>());
            await _mealVectors.Received(1).UpsertAsync(
                Arg.Is<MealVectorRecord>(r => r.MealId == mealId && r.Name == "Chicken Breast"),
                Arg.Any<CancellationToken>());

            await _context.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Handle_SyncMeal_WhenMealDoesNotExist_ShouldReturnFalse()
        {
            // Arrange
            int mealId = 99;
            var mealList = new List<AIService.Domain.Entities.Meal>();
            var mockDbSet = mealList.BuildMockDbSet();
            _context.Meals.Returns(mockDbSet);

            var handler = new SyncMealEmbeddingCommandHandler(_context, _embeddingService, _mealVectors, _mealLogger);
            var command = new SyncMealEmbeddingCommand(mealId);

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.Should().BeFalse();

            await _mealVectors.DidNotReceiveWithAnyArgs().EnsureCollectionExistsAsync(Arg.Any<CancellationToken>());
            await _mealVectors.DidNotReceiveWithAnyArgs().UpsertAsync((MealVectorRecord)default!, Arg.Any<CancellationToken>());
            await _context.DidNotReceiveWithAnyArgs().SaveChangesAsync(Arg.Any<CancellationToken>());
        }

        #endregion
    }
}
