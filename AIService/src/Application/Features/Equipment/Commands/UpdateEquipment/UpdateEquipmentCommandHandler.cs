using AIService.Application.Common.Interfaces;
using Domain.Common.Response;
using MediatR;

namespace AIService.Application.Features.Equipment.Commands.UpdateEquipment
{
    public class UpdateEquipmentCommandHandler : IRequestHandler<UpdateEquipmentCommand, Result<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public UpdateEquipmentCommandHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<bool>> Handle(UpdateEquipmentCommand request, CancellationToken cancellationToken)
        {
            var equipment = await _unitOfWork.EquipmentRepository.GetByIdAsync(request.Id, cancellationToken);
            
            if (equipment == null)
            {
                return Result.Failure<bool>(new Error("Equipment.NotFound", $"Không tìm thấy thiết bị với Id: {request.Id}"));
            }

            equipment.Update(request.Name, request.NameVN);
            
            _unitOfWork.EquipmentRepository.Update(equipment);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success(true);
        }
    }
}
