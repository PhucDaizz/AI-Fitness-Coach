using AIService.Application.Common.Interfaces;
using Domain.Common.Response;
using MediatR;

namespace AIService.Application.Features.MuscleGroup.Commands.DeleteMuscleGroup
{
    public class DeleteMuscleGroupCommandHandler : IRequestHandler<DeleteMuscleGroupCommand, Result<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public DeleteMuscleGroupCommandHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<bool>> Handle(DeleteMuscleGroupCommand request, CancellationToken cancellationToken)
        {
            var muscleGroup = await _unitOfWork.MuscleGroupRepository.GetByIdAsync(request.Id, cancellationToken);
            
            if (muscleGroup == null)
            {
                return Result.Failure<bool>(new Error("MuscleGroup.NotFound", $"Không tìm thấy nhóm cơ với Id: {request.Id}"));
            }

            _unitOfWork.MuscleGroupRepository.Delete(muscleGroup);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success(true);
        }
    }
}
