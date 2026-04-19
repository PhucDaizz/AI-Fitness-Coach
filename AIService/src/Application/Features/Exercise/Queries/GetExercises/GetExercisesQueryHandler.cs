using AIService.Application.Common.Interfaces;
using AIService.Application.DTOs.Category;
using AIService.Application.DTOs.Equipment;
using AIService.Application.DTOs.Exercise;
using AIService.Application.DTOs.MuscleGroup;
using AIService.Domain.Common;
using AIService.Domain.Common.Models;
using AIService.Domain.Enum;
using AIService.Domain.Repositories;
using Domain.Common.Response;
using MediatR;

namespace AIService.Application.Features.Exercise.Queries.GetExercises
{
    public class GetExercisesQueryHandler : IRequestHandler<GetExercisesQuery, Result<PagedResult<ExerciseListItemDto>>>
    {
        private readonly IExerciseRepository _exerciseRepository;
        private readonly ICurrentUserService _currentUserService;

        public GetExercisesQueryHandler(IExerciseRepository exerciseRepository, ICurrentUserService currentUserService)
        {
            _exerciseRepository = exerciseRepository;
            _currentUserService = currentUserService;
        }

        public async Task<Result<PagedResult<ExerciseListItemDto>>> Handle(GetExercisesQuery request, CancellationToken cancellationToken)
        {
            var isAdmin = _currentUserService.Role == AppRoles.SysAdmin;

            var (items, totalCount) = await _exerciseRepository.GetExercisesAsync(
                request.SearchTerm,
                request.MuscleGroupIds,
                request.EquipmentIds,
                request.CategoryIds,
                request.LocationTypes,
                request.EmbedStatus,
                isAdmin,
                request.SortBy,
                request.SortDescending,
                request.PageNumber,
                request.PageSize,
                cancellationToken);

            var dtos = items.Select(x => new ExerciseListItemDto
            {
                Id = x.Id,
                UUId = x.UUId,
                Name = x.Name,
                ImageThumbnailUrl = x.ImageThumbnailUrl,
                PrimaryMuscles = x.ExerciseMuscles
                    .Where(em => em.IsPrimary)
                    .Select(em => new MuscleDto(
                        em.MuscleGroup.Id,
                        em.MuscleGroup.NameEN,
                        em.MuscleGroup.NameVN,
                        em.MuscleGroup.IsFront
                    )).ToList(),
                SecondaryMuscles = x.ExerciseMuscles
                    .Where(em => !em.IsPrimary)
                    .Select(em => new MuscleDto(
                        em.MuscleGroup.Id,
                        em.MuscleGroup.NameEN,
                        em.MuscleGroup.NameVN,
                        em.MuscleGroup.IsFront
                    )).ToList(),
                Equipments = x.Equipments.Select(e => new EquipmentDto(
                    e.Id,
                    e.Name,
                    e.NameVN
                )).ToList(),
                LocationTypes = x.LocationType,
                Category = x.Category != null ? new CategoryDto(
                    x.Category.Id,
                    x.Category.Name,
                    x.Category.NameVN
                ) : null,
                EmbedStatus = isAdmin ? x.EmbedStatus : EmbedStatus.embedded
            }).ToList();

            var pagedResult = PagedResult<ExerciseListItemDto>.Create(dtos, totalCount, request.PageNumber, request.PageSize);
            return Result.Success(pagedResult);
        }
    }
}
