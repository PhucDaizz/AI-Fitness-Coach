using AIService.Application.Common.Interfaces;
using Domain.Common.Response;
using MediatR;

namespace AIService.Application.Features.Equipment.Commands.DeleteEquipment
{
    public class DeleteEquipmentCommandHandler : IRequestHandler<DeleteEquipmentCommand, Result<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public DeleteEquipmentCommandHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<bool>> Handle(DeleteEquipmentCommand request, CancellationToken cancellationToken)
        {
            var equipment = await _unitOfWork.EquipmentRepository.GetByIdAsync(request.Id, cancellationToken);
            
            if (equipment == null)
            {
                return Result.Failure<bool>(new Error("Equipment.NotFound", $"Không tìm thấy thiết bị với Id: {request.Id}"));
            }

            _unitOfWork.EquipmentRepository.Delete(equipment);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success(true);
        }
    }
}
