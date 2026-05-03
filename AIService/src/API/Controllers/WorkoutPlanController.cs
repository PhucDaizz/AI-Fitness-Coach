using AIService.Application.DTOs.Workout;
using AIService.Application.Features.Workout.Commands.GeneratePlan;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Nexus.BuildingBlocks.Model;

namespace AIService.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WorkoutPlanController : ControllerBase
    {
        private readonly IMediator _mediator;

        public WorkoutPlanController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("generate")]
        [Authorize]
        public async Task<IActionResult> Generate(
            [FromBody] GeneratePlanRequest req,
            CancellationToken cancellationToken)
        {
            var command = new GenerateWorkoutPlanCommand(req.TotalWeeks, req.StartsAt);
            var result = await _mediator.Send(command, cancellationToken);

            var response = new ApiResponse<GenerateWorkoutPlanResult>
            {
                Success = true,
                Message = "Tạo kế hoạch tập luyện tự động thành công!",
                Data = result
            };

            return Ok(response);
        }
    }
}
