using AIService.Application.Common.Interfaces;
using Domain.Common.Response;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AIService.Application.Features.Equipment.Queries.GetEquipmentById
{
    public class GetEquipmentByIdQueryHandler : IRequestHandler<GetEquipmentByIdQuery, Result<Domain.Entities.Equipment>>
    {
        private readonly IApplicationDbContext _context;

        public GetEquipmentByIdQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Result<Domain.Entities.Equipment>> Handle(GetEquipmentByIdQuery request, CancellationToken cancellationToken)
        {
            var equipment = await _context.Equipments
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

            if (equipment == null)
            {
                return Result.Failure<Domain.Entities.Equipment>(new Error("Equipment.NotFound", $"Không tìm thấy thiết bị với Id: {request.Id}"));
            }

            return Result.Success(equipment);
        }
    }
}
