using AIService.Application.Features.Maintenance.Commands;
using AIService.Application.Features.Maintenance.Commands.ExerciseEmbedding;
using AIService.Application.Features.Maintenance.Commands.MealEmbedding;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AIService.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MaintenanceController : ControllerBase
    {
        private readonly IMediator _mediator;

        public MaintenanceController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("requeue-exercises")]
        public async Task<IActionResult> RequeueExercises()
        {
            var count = await _mediator.Send(new RequeueExerciseEmbeddingCommand());
            return Ok(new { Message = $"Đã đẩy {count} bài tập vào hàng đợi RabbitMQ." });
        }

        [HttpPost("requeue-meals")]
        public async Task<IActionResult> RequeueMeals()
        {
            var count = await _mediator.Send(new RequeueMealEmbeddingCommand());
            return Ok(new { Message = $"Đã đẩy {count} món ăn vào hàng đợi RabbitMQ." });
        }
    }
}
