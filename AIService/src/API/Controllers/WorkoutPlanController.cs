using AIService.Application.Common.Interfaces;
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
        private readonly ICacheService _cacheService;
        private readonly ICurrentUserService _currentUserService;

        public WorkoutPlanController(
            IMediator mediator,
            ICacheService cacheService,
            ICurrentUserService currentUserService)
        {
            _mediator = mediator;
            _cacheService = cacheService;
            _currentUserService = currentUserService;
        }

        [HttpPost("generate")]
        [Authorize]
        public async Task<IActionResult> Generate(
            [FromBody] GeneratePlanRequest req,
            CancellationToken cancellationToken)
        {
            var accessToken = ExtractAccessToken();
            var command = new GenerateWorkoutPlanCommand(req.TotalWeeks, req.StartsAt, accessToken);
            var result = await _mediator.Send(command, cancellationToken);

            var response = new ApiResponse<WorkoutPlanGenerationJobDto>
            {
                Success = !result.IsExisting,
                Message = result.IsExisting
                    ? "Ban dang co mot yeu cau tao plan dang chay."
                    : "Yeu cau tao ke hoach tap luyen da duoc dua vao hang doi.",
                Data = result
            };

            return result.IsExisting ? Conflict(response) : Accepted(response);
        }

        [HttpGet("generate-jobs/latest")]
        [Authorize]
        public async Task<IActionResult> GetLatestGenerateJobStatus()
        {
            var userId = GetCurrentUserId();
            var latestJobId = await _cacheService.GetStringAsync(GetLatestJobKey(userId));
            if (string.IsNullOrWhiteSpace(latestJobId))
            {
                return NotFound(CreateNotFoundResponse());
            }

            return await GetGenerateJobStatus(latestJobId);
        }

        [HttpGet("generate-jobs/{jobId}")]
        [Authorize]
        public async Task<IActionResult> GetGenerateJobStatus(string jobId)
        {
            var userId = GetCurrentUserId();
            var result = await _cacheService.GetAsync<WorkoutPlanGenerationJobDto>(GetJobKey(jobId));
            if (result is null || !result.UserId.Equals(userId, StringComparison.Ordinal))
            {
                return NotFound(CreateNotFoundResponse());
            }

            return Ok(new ApiResponse<WorkoutPlanGenerationJobDto>
            {
                Success = true,
                Message = "Lay trang thai job tao ke hoach thanh cong.",
                Data = result
            });
        }

        private string ExtractAccessToken()
        {
            var authHeader = Request.Headers.Authorization.FirstOrDefault();
            if (!string.IsNullOrWhiteSpace(authHeader) && authHeader.StartsWith("Bearer "))
            {
                return authHeader.Substring("Bearer ".Length).Trim();
            }

            if (Request.Query.TryGetValue("access_token", out var queryToken))
            {
                return queryToken.ToString();
            }

            return string.Empty;
        }

        private string GetCurrentUserId()
        {
            return _currentUserService.UserId
                ?? throw new UnauthorizedAccessException("Khong the xac dinh nguoi dung hien tai.");
        }

        private static ApiResponse<WorkoutPlanGenerationJobDto> CreateNotFoundResponse()
        {
            return new ApiResponse<WorkoutPlanGenerationJobDto>
            {
                Success = false,
                Message = "Khong tim thay job tao ke hoach hoac job da het han.",
                Data = null
            };
        }

        private static string GetJobKey(string jobId) => $"workout_plan_generation:{jobId}";
        private static string GetLatestJobKey(string userId) => $"workout_plan_generation:user:{userId}:latest";
    }
}
