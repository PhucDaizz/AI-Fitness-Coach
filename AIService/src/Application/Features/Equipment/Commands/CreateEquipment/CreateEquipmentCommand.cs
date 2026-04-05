using Domain.Common.Response;
using MediatR;

namespace AIService.Application.Features.Equipment.Commands.CreateEquipment
{
    public class CreateEquipmentCommand : IRequest<Result<bool>>
    {
        public string Name { get; set; } = default!;
        public string? NameVN { get; set; }
    }
}
