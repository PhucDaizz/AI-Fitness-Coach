using AIService.Application.Common.Interfaces;
using Domain.Common.Response;
using MediatR;

namespace AIService.Application.Features.Exercise.Commands.UpdateExercise
{
    public class UpdateExerciseCommandHandler : IRequestHandler<UpdateExerciseCommand, Result<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public UpdateExerciseCommandHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<bool>> Handle(UpdateExerciseCommand request, CancellationToken cancellationToken)
        {
            var exercise = await _unitOfWork.ExerciseRepository.GetByIdAsync(request.Id, cancellationToken);
            
            if (exercise == null)
            {
                return Result.Failure<bool>(new Error("Exercise.NotFound", $"Không tìm thấy bài tập với Id: {request.Id}"));
            }

            exercise.Update(request.Name, request.Description, request.DescriptionSource);
            exercise.SetCategory(request.CategoryId);
            exercise.SetLocationTypes(request.LocationType);
            exercise.SetImages(request.ImageUrl, request.ImageThumbnailUrl, request.IsFrontImage);
            
            _unitOfWork.ExerciseRepository.Update(exercise);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success(true);
        }
    }
}
