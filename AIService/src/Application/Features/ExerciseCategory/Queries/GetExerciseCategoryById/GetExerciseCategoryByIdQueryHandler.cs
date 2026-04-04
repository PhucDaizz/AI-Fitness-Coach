using AIService.Application.Common.Interfaces;
using Domain.Common.Response;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AIService.Application.Features.ExerciseCategory.Queries.GetExerciseCategoryById
{
    public class GetExerciseCategoryByIdQueryHandler : IRequestHandler<GetExerciseCategoryByIdQuery, Result<Domain.Entities.ExerciseCategory>>
    {
        private readonly IApplicationDbContext _context;

        public GetExerciseCategoryByIdQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Result<Domain.Entities.ExerciseCategory>> Handle(GetExerciseCategoryByIdQuery request, CancellationToken cancellationToken)
        {
            var category = await _context.ExerciseCategories
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

            if (category == null)
            {
                return Result.Failure<Domain.Entities.ExerciseCategory>(new Error("ExerciseCategory.NotFound", $"Không tìm thấy danh mục với Id: {request.Id}"));
            }

            return Result.Success(category);
        }
    }
}
