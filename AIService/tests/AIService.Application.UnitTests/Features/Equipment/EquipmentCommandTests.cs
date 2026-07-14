using System.Threading;
using System.Threading.Tasks;
using AIService.Application.Common.Interfaces;
using AIService.Application.Features.Equipment.Commands.CreateEquipment;
using AIService.Application.Features.Equipment.Commands.DeleteEquipment;
using AIService.Application.Features.Equipment.Commands.UpdateEquipment;
using AIService.Domain.Entities;
using AIService.Domain.Repositories;
using Domain.Common.Response;
using FluentAssertions;
using NSubstitute;
using Xunit;

namespace AIService.Application.UnitTests.Features.Equipment
{
    public class EquipmentCommandTests
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEquipmentRepository _equipmentRepository;

        public EquipmentCommandTests()
        {
            _unitOfWork = Substitute.For<IUnitOfWork>();
            _equipmentRepository = Substitute.For<IEquipmentRepository>();
            _unitOfWork.EquipmentRepository.Returns(_equipmentRepository);
        }

        #region CreateEquipmentCommand Tests

        [Fact]
        public async Task Handle_CreateEquipment_ShouldAddEquipmentAndSave()
        {
            // Arrange
            var handler = new CreateEquipmentCommandHandler(_unitOfWork);
            var command = new CreateEquipmentCommand 
            { 
                Name = "Dumbbell", 
                NameVN = "Tạ đơn" 
            };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.IsSuccess.Should().BeTrue();
            result.Value.Should().BeTrue();

            await _equipmentRepository.Received(1).AddAsync(
                Arg.Is<AIService.Domain.Entities.Equipment>(e => e != null && e.Name == "Dumbbell" && e.NameVN == "Tạ đơn"), 
                Arg.Any<CancellationToken>());
            
            await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
        }

        #endregion

        #region UpdateEquipmentCommand Tests

        [Fact]
        public async Task Handle_UpdateEquipment_WhenEquipmentExists_ShouldUpdateAndSave()
        {
            // Arrange
            int id = 1;
            var existingEquipment = AIService.Domain.Entities.Equipment.Create(id, "Old Name", "Tên cũ");
            _equipmentRepository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(existingEquipment);

            var handler = new UpdateEquipmentCommandHandler(_unitOfWork);
            var command = new UpdateEquipmentCommand
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

            existingEquipment.Name.Should().Be("New Name");
            existingEquipment.NameVN.Should().Be("Tên mới");

            _equipmentRepository.Received(1).Update(existingEquipment);
            await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Handle_UpdateEquipment_WhenEquipmentDoesNotExist_ShouldReturnFailureResult()
        {
            // Arrange
            int id = 99;
            _equipmentRepository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns((AIService.Domain.Entities.Equipment)null!);

            var handler = new UpdateEquipmentCommandHandler(_unitOfWork);
            var command = new UpdateEquipmentCommand
            {
                Id = id,
                Name = "New Name",
                NameVN = "Tên mới"
            };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.IsSuccess.Should().BeFalse();
            result.Error.Code.Should().Be("Equipment.NotFound");
            result.Error.Message.Should().Be($"Không tìm thấy thiết bị với Id: {id}");

            _equipmentRepository.DidNotReceiveWithAnyArgs().Update(default!);
            await _unitOfWork.DidNotReceiveWithAnyArgs().SaveChangesAsync(Arg.Any<CancellationToken>());
        }

        #endregion

        #region DeleteEquipmentCommand Tests

        [Fact]
        public async Task Handle_DeleteEquipment_WhenEquipmentExists_ShouldDeleteAndSave()
        {
            // Arrange
            int id = 1;
            var existingEquipment = AIService.Domain.Entities.Equipment.Create(id, "Dumbbell", "Tạ đơn");
            _equipmentRepository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns(existingEquipment);

            var handler = new DeleteEquipmentCommandHandler(_unitOfWork);
            var command = new DeleteEquipmentCommand { Id = id };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.IsSuccess.Should().BeTrue();
            result.Value.Should().BeTrue();

            _equipmentRepository.Received(1).Delete(existingEquipment);
            await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
        }

        [Fact]
        public async Task Handle_DeleteEquipment_WhenEquipmentDoesNotExist_ShouldReturnFailureResult()
        {
            // Arrange
            int id = 99;
            _equipmentRepository.GetByIdAsync(id, Arg.Any<CancellationToken>()).Returns((AIService.Domain.Entities.Equipment)null!);

            var handler = new DeleteEquipmentCommandHandler(_unitOfWork);
            var command = new DeleteEquipmentCommand { Id = id };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.IsSuccess.Should().BeFalse();
            result.Error.Code.Should().Be("Equipment.NotFound");
            result.Error.Message.Should().Be($"Không tìm thấy thiết bị với Id: {id}");

            _equipmentRepository.DidNotReceiveWithAnyArgs().Delete(default!);
            await _unitOfWork.DidNotReceiveWithAnyArgs().SaveChangesAsync(Arg.Any<CancellationToken>());
        }

        #endregion
    }
}
