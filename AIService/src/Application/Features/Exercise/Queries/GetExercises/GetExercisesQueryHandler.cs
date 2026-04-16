using AIService.Application.Common.Interfaces;
using AIService.Application.DTOs.Category;
using AIService.Application.DTOs.Equipment;
using AIService.Application.DTOs.Exercise;
using AIService.Application.DTOs.MuscleGroup;
using AIService.Domain.Common;
using AIService.Domain.Common.Models;
using AIService.Domain.Enum;
using Domain.Common.Response;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AIService.Application.Features.Exercise.Queries.GetExercises
{
    public class GetExercisesQueryHandler : IRequestHandler<GetExercisesQuery, Result<PagedResult<ExerciseListItemDto>>>
    {
        private readonly IApplicationDbContext _context;
        private readonly ICurrentUserService _currentUserService;

        public GetExercisesQueryHandler(IApplicationDbContext context, ICurrentUserService currentUserService)
        {
            _context = context;
            _currentUserService = currentUserService;
        }

        public async Task<Result<PagedResult<ExerciseListItemDto>>> Handle(GetExercisesQuery request, CancellationToken cancellationToken)
        {
            var query = _context.Exercises
                .Include(x => x.ExerciseMuscles)
                    .ThenInclude(em => em.MuscleGroup)
                .Include(x => x.Equipments)
                .Include(x => x.Category)
                .AsNoTracking();

            var isAdmin = _currentUserService.Role == AppRoles.SysAdmin;


            if (!isAdmin)
            {
                query = query.Where(x => x.EmbedStatus == EmbedStatus.embedded);
            }

            if (!string.IsNullOrWhiteSpace(request.SearchTerm))
            {
                query = query.Where(x => x.Name.Contains(request.SearchTerm));
            }

            if (request.MuscleGroupIds != null && request.MuscleGroupIds.Any())
            {
                query = query.Where(x => x.ExerciseMuscles
                    .Any(em => request.MuscleGroupIds.Contains(em.MuscleId)));
            }

            if (request.EquipmentIds != null && request.EquipmentIds.Any())
            {
                query = query.Where(x => x.Equipments
                    .Any(e => request.EquipmentIds.Contains(e.Id)));
            }

            if (request.CategoryIds != null && request.CategoryIds.Any())
            {
                query = query.Where(x => x.CategoryId.HasValue &&
                                         request.CategoryIds.Contains(x.CategoryId.Value));
            }

            if (request.LocationTypes != null && request.LocationTypes.Any())
            {
                query = query.Where(x => x.LocationType
                    .Any(lt => request.LocationTypes.Contains(lt)));
            }

            if (isAdmin && request.EmbedStatus.HasValue)
            {
                query = query.Where(x => x.EmbedStatus == request.EmbedStatus.Value);
            }


            query = ApplySorting(query, request.SortBy, request.SortDescending);

            var totalCount = await query.CountAsync(cancellationToken);

            var items = await query
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .Select(x => new ExerciseListItemDto
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
                })
                .ToListAsync(cancellationToken);

            var pagedResult = PagedResult<ExerciseListItemDto>.Create(
                items,
                totalCount,
                request.PageNumber,
                request.PageSize
            );

            return Result.Success(pagedResult);
        }

        private IQueryable<Domain.Entities.Exercise> ApplySorting(
            IQueryable<Domain.Entities.Exercise> query,
            string? sortBy,
            bool sortDescending)
        {
            return (sortBy?.ToLower()) switch
            {
                "name" => sortDescending
                    ? query.OrderByDescending(x => x.Name)
                    : query.OrderBy(x => x.Name),

                
                _ => query.OrderByDescending(x => x.CreatedAt) 
            };
        }
    }
}
