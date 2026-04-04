using AIService.Application.Common.Interfaces;
using Domain.Common.Response;
using MediatR;

namespace AIService.Application.Features.Equipment.Commands.CreateEquipment
{
    public class CreateEquipmentCommandHandler : IRequestHandler<CreateEquipmentCommand, Result<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public CreateEquipmentCommandHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<bool>> Handle(CreateEquipmentCommand request, CancellationToken cancellationToken)
        {
            var equipment = Domain.Entities.Equipment.Create(request.Id, request.Name, request.NameVN);
            
            await _unitOfWork.EquipmentRepository.AddAsync(equipment, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success(true);
        }
    }
}
