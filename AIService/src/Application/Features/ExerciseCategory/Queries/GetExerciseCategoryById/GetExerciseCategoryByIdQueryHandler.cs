using AIService.Application.Common.Interfaces;
using AIService.Application.DTOs.ExerciseCategory;
using Domain.Common.Response;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AIService.Application.Features.ExerciseCategory.Queries.GetExerciseCategoryById
{
    public class GetExerciseCategoryByIdQueryHandler : IRequestHandler<GetExerciseCategoryByIdQuery, Result<ExerciseCategoryDetailDto>>
    {
        private readonly IApplicationDbContext _context;

        public GetExerciseCategoryByIdQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Result<ExerciseCategoryDetailDto>> Handle(GetExerciseCategoryByIdQuery request, CancellationToken cancellationToken)
        {
            var category = await _context.ExerciseCategories
                .Select(x => new ExerciseCategoryDetailDto(x.Id, x.Name, x.NameVN, x.CreatedAt, x.UpdatedAt))
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

            if (category == null)
            {
                return Result.Failure<ExerciseCategoryDetailDto>(new Error("ExerciseCategory.NotFound", $"Không tìm thấy danh mục với Id: {request.Id}"));
            }

            return Result.Success(category);
        }
    }
}
