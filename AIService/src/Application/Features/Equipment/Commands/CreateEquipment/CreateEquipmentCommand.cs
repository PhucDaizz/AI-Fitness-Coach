using Domain.Common.Response;
using MediatR;
using System.ComponentModel.DataAnnotations;

namespace AIService.Application.Features.Equipment.Commands.CreateEquipment
{
    public class CreateEquipmentCommand : IRequest<Result<bool>>
    {
        [Required]
        public int Id { get; set; } 
        public string Name { get; set; } = default!;
        public string? NameVN { get; set; }
    }
}
