using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AIService.Application.Common.Interfaces;
using AIService.Application.Features.Embeddings.Events;
using AIService.Application.Features.Maintenance.Commands.ExerciseEmbedding;
using AIService.Application.Features.Maintenance.Commands.MealEmbedding;
using AIService.Domain.Entities;
using AIService.Domain.Enum;
using FluentAssertions;
using MockQueryable.NSubstitute;
using NSubstitute;
using Xunit;

namespace AIService.Application.UnitTests.Features.Maintenance
{
    public class MaintenanceCommandTests
    {
        private readonly IApplicationDbContext _context;
        private readonly IIntegrationEventService _publisher;

        public MaintenanceCommandTests()
        {
            _context = Substitute.For<IApplicationDbContext>();
            _publisher = Substitute.For<IIntegrationEventService>();
        }

        #region RequeueExerciseEmbeddingCommand Tests

        [Fact]
        public async Task Handle_RequeueExerciseEmbedding_WhenPendingExercisesExist_ShouldPublishEventsAndReturnCount()
        {
            // Arrange
            var exercise1 = AIService.Domain.Entities.Exercise.Create(1, Guid.NewGuid(), "Push Up");
            exercise1.UpdateEmbedStatus(EmbedStatus.pending);

            var exercise2 = AIService.Domain.Entities.Exercise.Create(2, Guid.NewGuid(), "Pull Up");
            exercise2.UpdateEmbedStatus(EmbedStatus.pending);

            var exercise3 = AIService.Domain.Entities.Exercise.Create(3, Guid.NewGuid(), "Squat");
            exercise3.UpdateEmbedStatus(EmbedStatus.embedded); // Not pending, shouldn't be requeued

            var exerciseList = new List<AIService.Domain.Entities.Exercise> { exercise1, exercise2, exercise3 };
            var mockDbSet = exerciseList.BuildMockDbSet();
            _context.Exercises.Returns(mockDbSet);

            var handler = new RequeueExerciseEmbeddingHandler(_context, _publisher);
            var command = new RequeueExerciseEmbeddingCommand();

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.Should().Be(2);

            await _publisher.Received(1).PublishToQueueAsync(
                "ai-service-exercise-embedding-queue",
                Arg.Is<ExerciseEmbeddingRequestedEvent>(e => e.ExerciseId == 1));

            await _publisher.Received(1).PublishToQueueAsync(
                "ai-service-exercise-embedding-queue",
                Arg.Is<ExerciseEmbeddingRequestedEvent>(e => e.ExerciseId == 2));

            await _publisher.DidNotReceive().PublishToQueueAsync(
                "ai-service-exercise-embedding-queue",
                Arg.Is<ExerciseEmbeddingRequestedEvent>(e => e.ExerciseId == 3));
        }

        [Fact]
        public async Task Handle_RequeueExerciseEmbedding_WhenNoPendingExercisesExist_ShouldDoNothingAndReturnZero()
        {
            // Arrange
            var exerciseList = new List<AIService.Domain.Entities.Exercise>();
            var mockDbSet = exerciseList.BuildMockDbSet();
            _context.Exercises.Returns(mockDbSet);

            var handler = new RequeueExerciseEmbeddingHandler(_context, _publisher);
            var command = new RequeueExerciseEmbeddingCommand();

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.Should().Be(0);

            await _publisher.DidNotReceiveWithAnyArgs().PublishToQueueAsync(Arg.Any<string>(), Arg.Any<object>());
        }

        #endregion

        #region RequeueMealEmbeddingCommand Tests

        [Fact]
        public async Task Handle_RequeueMealEmbedding_WhenPendingMealsExist_ShouldPublishEventsAndReturnCount()
        {
            // Arrange
            var meal1 = AIService.Domain.Entities.Meal.Create("Chicken salad", 350, 35f, 10f, 12f);
            meal1.GetType().GetProperty("Id")?.SetValue(meal1, 10);
            meal1.UpdateEmbedStatus(EmbedStatus.pending);

            var meal2 = AIService.Domain.Entities.Meal.Create("Beef steak", 600, 50f, 2f, 40f);
            meal2.GetType().GetProperty("Id")?.SetValue(meal2, 20);
            meal2.UpdateEmbedStatus(EmbedStatus.pending);

            var meal3 = AIService.Domain.Entities.Meal.Create("Apple", 80, 0.3f, 22f, 0.2f);
            meal3.GetType().GetProperty("Id")?.SetValue(meal3, 30);
            meal3.UpdateEmbedStatus(EmbedStatus.embedded); // Not pending

            var mealList = new List<AIService.Domain.Entities.Meal> { meal1, meal2, meal3 };
            var mockDbSet = mealList.BuildMockDbSet();
            _context.Meals.Returns(mockDbSet);

            var handler = new RequeueMealEmbeddingHandler(_context, _publisher);
            var command = new RequeueMealEmbeddingCommand();

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.Should().Be(2);

            await _publisher.Received(1).PublishToQueueAsync(
                "ai-service-meal-embedding-queue",
                Arg.Is<MealEmbeddingRequestedEvent>(e => e.MealId == 10));

            await _publisher.Received(1).PublishToQueueAsync(
                "ai-service-meal-embedding-queue",
                Arg.Is<MealEmbeddingRequestedEvent>(e => e.MealId == 20));

            await _publisher.DidNotReceive().PublishToQueueAsync(
                "ai-service-meal-embedding-queue",
                Arg.Is<MealEmbeddingRequestedEvent>(e => e.MealId == 30));
        }

        [Fact]
        public async Task Handle_RequeueMealEmbedding_WhenNoPendingMealsExist_ShouldDoNothingAndReturnZero()
        {
            // Arrange
            var mealList = new List<AIService.Domain.Entities.Meal>();
            var mockDbSet = mealList.BuildMockDbSet();
            _context.Meals.Returns(mockDbSet);

            var handler = new RequeueMealEmbeddingHandler(_context, _publisher);
            var command = new RequeueMealEmbeddingCommand();

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.Should().Be(0);

            await _publisher.DidNotReceiveWithAnyArgs().PublishToQueueAsync(Arg.Any<string>(), Arg.Any<object>());
        }

        #endregion
    }
}
