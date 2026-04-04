using AIService.Domain.Enum;
using Domain.Common.Response;
using MediatR;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace AIService.Application.Features.Exercise.Commands.CreateExercise
{
    public class CreateExerciseCommand : IRequest<Result<bool>>
    {
        [Required]
        public int Id { get; set; }
        public Guid? UUId { get; set; }
        public string Name { get; set; } = default!;
        public string? Description { get; set; }
        public DescriptionSource DescriptionSource { get; set; }
        public int? CategoryId { get; set; }
        public List<string> LocationType { get; set; } = new();
        public string? ImageUrl { get; set; }
        public string? ImageThumbnailUrl { get; set; }
        public bool IsFrontImage { get; set; } = true;
    }
}
