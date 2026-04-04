using AIService.Application.Common.Interfaces;
using Domain.Common.Response;
using MediatR;

namespace AIService.Application.Features.ExerciseCategory.Commands.CreateExerciseCategory
{
    public class CreateExerciseCategoryCommandHandler : IRequestHandler<CreateExerciseCategoryCommand, Result<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public CreateExerciseCategoryCommandHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<bool>> Handle(CreateExerciseCategoryCommand request, CancellationToken cancellationToken)
        {
            var category = Domain.Entities.ExerciseCategory.Create(request.Id, request.Name, request.NameVN);
            
            await _unitOfWork.ExerciseCategoryRepository.AddAsync(category, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Success(true);
        }
    }
}
