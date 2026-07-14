using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using AIService.Application.Common.Interfaces;
using AIService.Application.Common.Models;
using AIService.Application.Features.Meal.Commands.CreateMeal;
using AIService.Application.Features.Meal.Commands.DeleteMeal;
using AIService.Application.Features.Meal.Commands.UpdateMeal;
using AIService.Domain.Entities;
using AIService.Domain.Repositories;
using Domain.Common.Response;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.VectorData;
using NSubstitute;
using Xunit;

namespace AIService.Application.UnitTests.Features.Meal
{
    public class MealCommandTests
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMealRepository _mealRepository;
        private readonly VectorStoreCollection<Guid, MealVectorRecord> _mealVectors;
        private readonly ILogger<DeleteMealCommandHandler> _logger;

        public MealCommandTests()
        {
            _unitOfWork = Substitute.For<IUnitOfWork>();
            _mealRepository = Substitute.For<IMealRepository>();
            _unitOfWork.MealRepository.Returns(_mealRepository);
            
            // Try mocking the VectorStoreCollection
            _mealVectors = Substitute.For<VectorStoreCollection<Guid, MealVectorRecord>>();
            _logger = Substitute.For<ILogger<DeleteMealCommandHandler>>();
        }

        #region CreateMealCommand Tests

        [Fact]
        public async Task Handle_CreateMeal_ShouldAddMealAndSave()
        {
            // Arrange
            var handler = new CreateMealCommandHandler(_unitOfWork);
            var command = new CreateMealCommand
            {
                Name = "Chicken Breast",
                Calories = 165,
                Protein = 31f,
                Carbs = 0f,
                Fat = 3.6f,
                Description = "High protein chicken",
                CuisineType = "Western",
                ImageUrl = "http://example.com/chicken.png",
                DietTags = new List<string> { "HighProtein", "LowCarb" }
            };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.IsSuccess.Should().BeTrue();
            result.Value.Should().BeTrue();

            await _mealRepository.Received(1).AddAsync(
                Arg.Is<AIService.Domain.Entities.Meal>(m => 
                    m != null && 
                    m.Name == "Chicken Breast" && 
                    m.Calories == 165 && 
                    m.Protein == 31f && 
                    m.Description == "High protein chicken" &&
                    m.CuisineType == "Western" &&
                    m.ImageUrl == "http://example.com/chicken.png"),
                Arg.Any<CancellationToken>());

            await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
        }

        #endregion

        #region UpdateMealCommand Tests

        [Fact]
        public async Task Handle_UpdateMeal_WhenMealExists_ShouldUpdateAndSave()
        {
            // Arrange
            int id = 1;
            var existingMeal = AIService.Domain.Entities.Meal.Create("Old Meal", 100, 10f, 10f, 2f);
            _mealRepository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(existingMeal);

            var handler = new UpdateMealCommandHandler(_unitOfWork);
            var command = new UpdateMealCommand
            {
                Id = id,
                Name = "Salmon Salad",
                Calories = 250,
                Protein = 22f,
                Carbs = 5f,
                Fat = 15f,
                Description = "Healthy salmon salad",
                CuisineType = "Mediterranean",
                ImageUrl = "http://example.com/salmon.png",
                DietTags = new List<string> { "Keto", "GlutenFree" }
            };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.IsSuccess.Should().BeTrue();
            result.Value.Should().BeTrue();

            existingMeal.Name.Should().Be("Salmon Salad");
            existingMeal.Calories.Should().Be(250);
            existingMeal.Description.Should().Be("Healthy salmon salad");
            existingMeal.CuisineType.Should().Be("Mediterranean");

            _mealRepository.Received(1).Update(existingMeal);
            await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Handle_UpdateMeal_WhenMealDoesNotExist_ShouldReturnFailureResult()
        {
            // Arrange
            int id = 99;
            _mealRepository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns((AIService.Domain.Entities.Meal)null!);

            var handler = new UpdateMealCommandHandler(_unitOfWork);
            var command = new UpdateMealCommand
            {
                Id = id,
                Name = "Salmon Salad"
            };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.IsSuccess.Should().BeFalse();
            result.Error.Code.Should().Be("Meal.NotFound");
            result.Error.Message.Should().Be($"Không tìm thấy món ăn với Id: {id}");

            _mealRepository.DidNotReceiveWithAnyArgs().Update(default!);
            await _unitOfWork.DidNotReceiveWithAnyArgs().SaveChangesAsync(Arg.Any<CancellationToken>());
        }

        #endregion

        #region DeleteMealCommand Tests

        [Fact]
        public async Task Handle_DeleteMeal_WhenMealExists_ShouldDeleteVectorAndMealAndSave()
        {
            // Arrange
            int id = 1;
            var existingMeal = AIService.Domain.Entities.Meal.Create("Chicken Breast", 165, 31f, 0f, 3.6f);
            _mealRepository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(existingMeal);

            var handler = new DeleteMealCommandHandler(_unitOfWork, _mealVectors, _logger);
            var command = new DeleteMealCommand { Id = id };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.IsSuccess.Should().BeTrue();
            result.Value.Should().BeTrue();

            await _mealVectors.Received(1).DeleteAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
            _mealRepository.Received(1).Delete(existingMeal);
            await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Handle_DeleteMeal_WhenVectorDeletionFails_ShouldStillDeleteMealFromSqlAndSave()
        {
            // Arrange
            int id = 1;
            var existingMeal = AIService.Domain.Entities.Meal.Create("Chicken Breast", 165, 31f, 0f, 3.6f);
            _mealRepository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(existingMeal);
            
            // Mock delete vector throws exception
            _mealVectors
                .When(x => x.DeleteAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>()))
                .Do(x => throw new Exception("VectorDB connection error"));

            var handler = new DeleteMealCommandHandler(_unitOfWork, _mealVectors, _logger);
            var command = new DeleteMealCommand { Id = id };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.IsSuccess.Should().BeTrue();
            result.Value.Should().BeTrue();

            // SQL deletion should still be processed
            _mealRepository.Received(1).Delete(existingMeal);
            await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Handle_DeleteMeal_WhenMealDoesNotExist_ShouldReturnFailureResult()
        {
            // Arrange
            int id = 99;
            _mealRepository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns((AIService.Domain.Entities.Meal)null!);

            var handler = new DeleteMealCommandHandler(_unitOfWork, _mealVectors, _logger);
            var command = new DeleteMealCommand { Id = id };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.IsSuccess.Should().BeFalse();
            result.Error.Code.Should().Be("Meal.NotFound");
            result.Error.Message.Should().Be($"Không tìm thấy món ăn với Id: {id}");

            await _mealVectors.DidNotReceiveWithAnyArgs().DeleteAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
            _mealRepository.DidNotReceiveWithAnyArgs().Delete(default!);
            await _unitOfWork.DidNotReceiveWithAnyArgs().SaveChangesAsync(Arg.Any<CancellationToken>());
        }

        #endregion
    }
}
