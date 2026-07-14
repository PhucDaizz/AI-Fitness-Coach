using System.Threading;
using System.Threading.Tasks;
using AIService.Application.Common.Interfaces;
using AIService.Application.Features.ExerciseCategory.Commands.CreateExerciseCategory;
using AIService.Application.Features.ExerciseCategory.Commands.DeleteExerciseCategory;
using AIService.Application.Features.ExerciseCategory.Commands.UpdateExerciseCategory;
using AIService.Domain.Entities;
using AIService.Domain.Repositories;
using Domain.Common.Response;
using FluentAssertions;
using NSubstitute;
using Xunit;

namespace AIService.Application.UnitTests.Features.ExerciseCategory
{
    public class ExerciseCategoryCommandTests
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IExerciseCategoryRepository _categoryRepository;

        public ExerciseCategoryCommandTests()
        {
            _unitOfWork = Substitute.For<IUnitOfWork>();
            _categoryRepository = Substitute.For<IExerciseCategoryRepository>();
            _unitOfWork.ExerciseCategoryRepository.Returns(_categoryRepository);
        }

        #region CreateExerciseCategoryCommand Tests

        [Fact]
        public async Task Handle_CreateCategory_ShouldAddCategoryAndSave()
        {
            // Arrange
            var handler = new CreateExerciseCategoryCommandHandler(_unitOfWork);
            var command = new CreateExerciseCategoryCommand
            {
                Name = "Chest",
                NameVN = "Cơ ngực"
            };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.IsSuccess.Should().BeTrue();
            result.Value.Should().BeTrue();

            await _categoryRepository.Received(1).AddAsync(
                Arg.Is<AIService.Domain.Entities.ExerciseCategory>(c => c != null && c.Name == "Chest" && c.NameVN == "Cơ ngực"),
                Arg.Any<CancellationToken>());

            await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
        }

        #endregion

        #region UpdateExerciseCategoryCommand Tests

        [Fact]
        public async Task Handle_UpdateCategory_WhenCategoryExists_ShouldUpdateAndSave()
        {
            // Arrange
            int id = 1;
            var existingCategory = AIService.Domain.Entities.ExerciseCategory.Create(id, "Old Name", "Tên cũ");
            _categoryRepository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(existingCategory);

            var handler = new UpdateExerciseCategoryCommandHandler(_unitOfWork);
            var command = new UpdateExerciseCategoryCommand
            {
                Id = id,
                Name = "New Name",
                NameVN = "Tên mới"
            };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.IsSuccess.Should().BeTrue();
            result.Value.Should().BeTrue();

            existingCategory.Name.Should().Be("New Name");
            existingCategory.NameVN.Should().Be("Tên mới");

            _categoryRepository.Received(1).Update(existingCategory);
            await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Handle_UpdateCategory_WhenCategoryDoesNotExist_ShouldReturnFailureResult()
        {
            // Arrange
            int id = 99;
            _categoryRepository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns((AIService.Domain.Entities.ExerciseCategory)null!);

            var handler = new UpdateExerciseCategoryCommandHandler(_unitOfWork);
            var command = new UpdateExerciseCategoryCommand
            {
                Id = id,
                Name = "New Name",
                NameVN = "Tên mới"
            };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.IsSuccess.Should().BeFalse();
            result.Error.Code.Should().Be("ExerciseCategory.NotFound");
            result.Error.Message.Should().Be($"Không tìm thấy danh mục với Id: {id}");

            _categoryRepository.DidNotReceiveWithAnyArgs().Update(default!);
            await _unitOfWork.DidNotReceiveWithAnyArgs().SaveChangesAsync(Arg.Any<CancellationToken>());
        }

        #endregion

        #region DeleteExerciseCategoryCommand Tests

        [Fact]
        public async Task Handle_DeleteCategory_WhenCategoryExists_ShouldDeleteAndSave()
        {
            // Arrange
            int id = 1;
            var existingCategory = AIService.Domain.Entities.ExerciseCategory.Create(id, "Chest", "Cơ ngực");
            _categoryRepository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(existingCategory);

            var handler = new DeleteExerciseCategoryCommandHandler(_unitOfWork);
            var command = new DeleteExerciseCategoryCommand { Id = id };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.IsSuccess.Should().BeTrue();
            result.Value.Should().BeTrue();

            _categoryRepository.Received(1).Delete(existingCategory);
            await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Handle_DeleteCategory_WhenCategoryDoesNotExist_ShouldReturnFailureResult()
        {
            // Arrange
            int id = 99;
            _categoryRepository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns((AIService.Domain.Entities.ExerciseCategory)null!);

            var handler = new DeleteExerciseCategoryCommandHandler(_unitOfWork);
            var command = new DeleteExerciseCategoryCommand { Id = id };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.IsSuccess.Should().BeFalse();
            result.Error.Code.Should().Be("ExerciseCategory.NotFound");
            result.Error.Message.Should().Be($"Không tìm thấy danh mục với Id: {id}");

            _categoryRepository.DidNotReceiveWithAnyArgs().Delete(default!);
            await _unitOfWork.DidNotReceiveWithAnyArgs().SaveChangesAsync(Arg.Any<CancellationToken>());
        }

        #endregion
    }
}
