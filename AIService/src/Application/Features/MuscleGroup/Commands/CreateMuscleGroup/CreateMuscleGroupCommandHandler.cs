using AIService.Application.Common.Interfaces;
using Domain.Common.Response;
using MediatR;

namespace AIService.Application.Features.MuscleGroup.Commands.CreateMuscleGroup
{
    public class CreateMuscleGroupCommandHandler : IRequestHandler<CreateMuscleGroupCommand, Result<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public CreateMuscleGroupCommandHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<bool>> Handle(CreateMuscleGroupCommand request, CancellationToken cancellationToken)
        {
            var muscleGroup = Domain.Entities.MuscleGroup.CreateManual(request.NameEN, request.IsFront, request.NameVN);
            
            await _unitOfWork.MuscleGroupRepository.AddAsync(muscleGroup, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success(true);
        }
    }
}
