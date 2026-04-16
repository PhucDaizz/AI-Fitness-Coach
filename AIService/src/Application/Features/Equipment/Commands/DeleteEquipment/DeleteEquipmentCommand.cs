using MediatR;

using Domain.Common.Response;

namespace AIService.Application.Features.Equipment.Commands.DeleteEquipment
{
    public class DeleteEquipmentCommand : IRequest<Result<bool>>
    {
        public int Id { get; set; }
    }
}
