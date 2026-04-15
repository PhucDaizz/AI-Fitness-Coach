using AIService.Application.DTOs.Equipment;
using Domain.Common.Response;
using MediatR;

namespace AIService.Application.Features.Equipment.Queries.GetEquipmentById
{
    public class GetEquipmentByIdQuery : IRequest<Result<EquipmentDetailDto>>
    {
        public int Id { get; set; }
        
        public GetEquipmentByIdQuery(int id)
        {
            Id = id;
        }
    }
}
