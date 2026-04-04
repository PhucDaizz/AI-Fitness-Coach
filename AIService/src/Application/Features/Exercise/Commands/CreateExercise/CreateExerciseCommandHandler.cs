using AIService.Application.Common.Interfaces;
using Domain.Common.Response;
using MediatR;

namespace AIService.Application.Features.Exercise.Commands.CreateExercise
{
    public class CreateExerciseCommandHandler : IRequestHandler<CreateExerciseCommand, Result<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public CreateExerciseCommandHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<bool>> Handle(CreateExerciseCommand request, CancellationToken cancellationToken)
        {
            var exercise = Domain.Entities.Exercise.Create(request.Id, request.UUId, request.Name, request.Description, request.DescriptionSource);
            
            exercise.SetCategory(request.CategoryId);
            exercise.SetLocationTypes(request.LocationType);
            exercise.SetImages(request.ImageUrl, request.ImageThumbnailUrl, request.IsFrontImage);
            
            await _unitOfWork.ExerciseRepository.AddAsync(exercise, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success(true);
        }
    }
}
