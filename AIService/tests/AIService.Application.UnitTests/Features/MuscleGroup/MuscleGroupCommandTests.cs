using System.Threading;
using System.Threading.Tasks;
using AIService.Application.Common.Interfaces;
using AIService.Application.Features.MuscleGroup.Commands.CreateMuscleGroup;
using AIService.Application.Features.MuscleGroup.Commands.DeleteMuscleGroup;
using AIService.Application.Features.MuscleGroup.Commands.UpdateMuscleGroup;
using AIService.Domain.Entities;
using AIService.Domain.Repositories;
using Domain.Common.Response;
using FluentAssertions;
using NSubstitute;
using Xunit;

namespace AIService.Application.UnitTests.Features.MuscleGroup
{
    public class MuscleGroupCommandTests
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMuscleGroupRepository _muscleRepository;

        public MuscleGroupCommandTests()
        {
            _unitOfWork = Substitute.For<IUnitOfWork>();
            _muscleRepository = Substitute.For<IMuscleGroupRepository>();
            _unitOfWork.MuscleGroupRepository.Returns(_muscleRepository);
        }

        #region CreateMuscleGroupCommand Tests

        [Fact]
        public async Task Handle_CreateMuscleGroup_ShouldAddMuscleGroupAndSave()
        {
            // Arrange
            var handler = new CreateMuscleGroupCommandHandler(_unitOfWork);
            var command = new CreateMuscleGroupCommand
            {
                NameEN = "Chest",
                NameVN = "Cơ ngực",
                IsFront = true
            };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.IsSuccess.Should().BeTrue();
            result.Value.Should().BeTrue();

            await _muscleRepository.Received(1).AddAsync(
                Arg.Is<AIService.Domain.Entities.MuscleGroup>(m => 
                    m != null && m.NameEN == "Chest" && m.NameVN == "Cơ ngực" && m.IsFront == true),
                Arg.Any<CancellationToken>());

            await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
        }

        #endregion

        #region UpdateMuscleGroupCommand Tests

        [Fact]
        public async Task Handle_UpdateMuscleGroup_WhenMuscleGroupExists_ShouldUpdateAndSave()
        {
            // Arrange
            int id = 1;
            var existingMuscleGroup = AIService.Domain.Entities.MuscleGroup.Create(id, "Biceps", true, "Cơ nhị đầu");
            _muscleRepository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(existingMuscleGroup);

            var handler = new UpdateMuscleGroupCommandHandler(_unitOfWork);
            var command = new UpdateMuscleGroupCommand
            {
                Id = id,
                NameEN = "Biceps New",
                NameVN = "Cơ nhị đầu mới",
                IsFront = false
            };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.IsSuccess.Should().BeTrue();
            result.Value.Should().BeTrue();

            existingMuscleGroup.NameEN.Should().Be("Biceps New");
            existingMuscleGroup.NameVN.Should().Be("Cơ nhị đầu mới");
            existingMuscleGroup.IsFront.Should().BeFalse();

            _muscleRepository.Received(1).Update(existingMuscleGroup);
            await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Handle_UpdateMuscleGroup_WhenMuscleGroupDoesNotExist_ShouldReturnFailureResult()
        {
            // Arrange
            int id = 99;
            _muscleRepository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns((AIService.Domain.Entities.MuscleGroup)null!);

            var handler = new UpdateMuscleGroupCommandHandler(_unitOfWork);
            var command = new UpdateMuscleGroupCommand
            {
                Id = id,
                NameEN = "Biceps"
            };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.IsSuccess.Should().BeFalse();
            result.Error.Code.Should().Be("MuscleGroup.NotFound");
            result.Error.Message.Should().Be($"Không tìm thấy nhóm cơ với Id: {id}");

            _muscleRepository.DidNotReceiveWithAnyArgs().Update(default!);
            await _unitOfWork.DidNotReceiveWithAnyArgs().SaveChangesAsync(Arg.Any<CancellationToken>());
        }

        #endregion

        #region DeleteMuscleGroupCommand Tests

        [Fact]
        public async Task Handle_DeleteMuscleGroup_WhenMuscleGroupExists_ShouldDeleteAndSave()
        {
            // Arrange
            int id = 1;
            var existingMuscleGroup = AIService.Domain.Entities.MuscleGroup.Create(id, "Biceps", true, "Cơ nhị đầu");
            _muscleRepository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(existingMuscleGroup);

            var handler = new DeleteMuscleGroupCommandHandler(_unitOfWork);
            var command = new DeleteMuscleGroupCommand { Id = id };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.IsSuccess.Should().BeTrue();
            result.Value.Should().BeTrue();

            _muscleRepository.Received(1).Delete(existingMuscleGroup);
            await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Handle_DeleteMuscleGroup_WhenMuscleGroupDoesNotExist_ShouldReturnFailureResult()
        {
            // Arrange
            int id = 99;
            _muscleRepository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns((AIService.Domain.Entities.MuscleGroup)null!);

            var handler = new DeleteMuscleGroupCommandHandler(_unitOfWork);
            var command = new DeleteMuscleGroupCommand { Id = id };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.IsSuccess.Should().BeFalse();
            result.Error.Code.Should().Be("MuscleGroup.NotFound");
            result.Error.Message.Should().Be($"Không tìm thấy nhóm cơ với Id: {id}");

            _muscleRepository.DidNotReceiveWithAnyArgs().Delete(default!);
            await _unitOfWork.DidNotReceiveWithAnyArgs().SaveChangesAsync(Arg.Any<CancellationToken>());
        }

        #endregion
    }
}
