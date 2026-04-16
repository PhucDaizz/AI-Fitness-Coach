using AIService.Application.Common.Interfaces;
using AIService.Application.DTOs.Category;
using AIService.Application.DTOs.Equipment;
using AIService.Application.DTOs.Exercise;
using AIService.Application.DTOs.MuscleGroup;
using Domain.Common.Response;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AIService.Application.Features.Exercise.Queries.GetExerciseById
{
    public class GetExerciseByIdQueryHandler : IRequestHandler<GetExerciseByIdQuery, Result<ExerciseDetailDto>>
    {
        private readonly IApplicationDbContext _context;

        public GetExerciseByIdQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Result<ExerciseDetailDto>> Handle(GetExerciseByIdQuery request, CancellationToken cancellationToken)
        {
            var rawData = await _context.Exercises
                .AsNoTracking()
                .Where(x => x.Id == request.Id)
                .Select(e => new
                {
                    e.Id,
                    e.UUId,
                    e.Name,
                    e.Description,
                    Category = e.Category != null
                        ? new CategoryDto(e.Category.Id, e.Category.Name, e.Category.NameVN)
                        : null,
                    PrimaryMuscles = e.ExerciseMuscles
                        .Where(em => em.IsPrimary)
                        .Select(em => new MuscleDto(em.MuscleGroup.Id, em.MuscleGroup.NameEN, em.MuscleGroup.NameVN, em.MuscleGroup.IsFront)),

                    SecondaryMuscles = e.ExerciseMuscles
                        .Where(em => !em.IsPrimary)
                        .Select(em => new MuscleDto(em.MuscleGroup.Id, em.MuscleGroup.NameEN, em.MuscleGroup.NameVN, em.MuscleGroup.IsFront)),

                    Equipments = e.Equipments
                        .Select(eq => new EquipmentDto(eq.Id, eq.Name, eq.NameVN)),

                    LocationTypes = e.LocationType,

                    e.ImageUrl,
                    e.ImageThumbnailUrl,
                    e.IsFrontImage
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (rawData == null)
            {
                return Result.Failure<ExerciseDetailDto>(new Error("Exercise.NotFound", $"Không tìm thấy bài tập với Id: {request.Id}"));
            }

            var dto = new ExerciseDetailDto
            {
                Id = rawData.Id,
                UUId = rawData.UUId,
                Name = rawData.Name,
                Description = rawData.Description,
                Category = rawData.Category,
                PrimaryMuscles = rawData.PrimaryMuscles.ToList(),   
                SecondaryMuscles = rawData.SecondaryMuscles.ToList(), 
                Equipments = rawData.Equipments.ToList(),      
                LocationTypes = rawData.LocationTypes ?? new List<string>(),
                ImageUrl = rawData.ImageUrl,
                ImageThumbnailUrl = rawData.ImageThumbnailUrl,
                IsFrontImage = rawData.IsFrontImage
            };

            return Result.Success(dto);
        }
    }
}
