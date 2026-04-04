using AIService.Application.Common.Interfaces;
using Domain.Common.Response;
using MediatR;

namespace AIService.Application.Features.MuscleGroup.Commands.UpdateMuscleGroup
{
    public class UpdateMuscleGroupCommandHandler : IRequestHandler<UpdateMuscleGroupCommand, Result<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public UpdateMuscleGroupCommandHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<bool>> Handle(UpdateMuscleGroupCommand request, CancellationToken cancellationToken)
        {
            var muscleGroup = await _unitOfWork.MuscleGroupRepository.GetByIdAsync(request.Id, cancellationToken);
            
            if (muscleGroup == null)
            {
                return Result.Failure<bool>(new Error("MuscleGroup.NotFound", $"Không tìm thấy nhóm cơ với Id: {request.Id}"));
            }

            muscleGroup.Update(request.NameEN, request.IsFront, request.NameVN);
            
            _unitOfWork.MuscleGroupRepository.Update(muscleGroup);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success(true);
        }
    }
}
