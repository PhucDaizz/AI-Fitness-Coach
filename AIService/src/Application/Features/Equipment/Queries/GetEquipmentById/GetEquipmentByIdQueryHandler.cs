using AIService.Application.Common.Interfaces;
using AIService.Application.DTOs.Equipment;
using Domain.Common.Response;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AIService.Application.Features.Equipment.Queries.GetEquipmentById
{
    public class GetEquipmentByIdQueryHandler : IRequestHandler<GetEquipmentByIdQuery, Result<EquipmentDetailDto>>
    {
        private readonly IApplicationDbContext _context;

        public GetEquipmentByIdQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Result<EquipmentDetailDto>> Handle(GetEquipmentByIdQuery request, CancellationToken cancellationToken)
        {
            var equipment = await _context.Equipments
                .AsNoTracking()
                .Select(x => new EquipmentDetailDto(x.Id, x.Name, x.NameVN, x.CreatedAt, x.UpdatedAt ?? DateTime.MinValue))
                .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

            if (equipment == null)
            {
                return Result.Failure<EquipmentDetailDto>(new Error("Equipment.NotFound", $"Không tìm thấy thiết bị với Id: {request.Id}"));
            }

            return Result.Success(equipment);
        }
    }
}
