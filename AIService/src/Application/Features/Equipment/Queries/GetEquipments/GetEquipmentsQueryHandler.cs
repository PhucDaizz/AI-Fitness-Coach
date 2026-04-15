using AIService.Application.Common.Interfaces;
using AIService.Application.DTOs.Equipment;
using AIService.Domain.Common.Models;
using Domain.Common.Response;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AIService.Application.Features.Equipment.Queries.GetEquipments
{
    public class GetEquipmentsQueryHandler : IRequestHandler<GetEquipmentsQuery, Result<PagedResult<EquipmentDto>>>
    {
        private readonly IApplicationDbContext _context;

        public GetEquipmentsQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Result<PagedResult<EquipmentDto>>> Handle(GetEquipmentsQuery request, CancellationToken cancellationToken)
        {
            var query = _context.Equipments.AsNoTracking();

            if (!string.IsNullOrWhiteSpace(request.SearchTerm))
            {
                query = query.Where(x => x.Name.Contains(request.SearchTerm) || (x.NameVN != null && x.NameVN.Contains(request.SearchTerm)));
            }

            var totalCount = await query.CountAsync(cancellationToken);

            var items = await query
                .OrderByDescending(x => x.CreatedAt)
                .Select(x => new EquipmentDto
                ( x.Id, x.Name, x.NameVN))
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToListAsync(cancellationToken);

            var pagedResult = PagedResult<EquipmentDto>.Create(items, totalCount, request.PageNumber, request.PageSize);

            return Result.Success(pagedResult);
        }
    }
}
