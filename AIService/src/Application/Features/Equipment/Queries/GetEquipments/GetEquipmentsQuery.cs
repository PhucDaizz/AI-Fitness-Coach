using AIService.Application.DTOs.Equipment;
using AIService.Domain.Common.Models;
using Domain.Common.Response;
using MediatR;

namespace AIService.Application.Features.Equipment.Queries.GetEquipments
{
    public class GetEquipmentsQuery : IRequest<Result<PagedResult<EquipmentDto>>>
    {
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;
        public string? SearchTerm { get; set; }
    }
}
