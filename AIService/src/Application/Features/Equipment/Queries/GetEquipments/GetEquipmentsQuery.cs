using AIService.Domain.Common.Models;
using Domain.Common.Response;
using MediatR;

namespace AIService.Application.Features.Equipment.Queries.GetEquipments
{
    public class GetEquipmentsQuery : IRequest<Result<PagedResult<Domain.Entities.Equipment>>>
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;
        public string? SearchTerm { get; set; }
    }
}
