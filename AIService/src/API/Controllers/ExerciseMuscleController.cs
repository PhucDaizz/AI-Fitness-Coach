using AIService.Application.Features.ExerciseMuscle.Commands.CreateExerciseMuscle;
using AIService.Application.Features.ExerciseMuscle.Commands.DeleteExerciseMuscle;
using AIService.Application.Features.ExerciseMuscle.Commands.UpdateExerciseMuscle;
using AIService.Application.Features.ExerciseMuscle.Queries.GetExerciseMuscleByIds;
using AIService.Application.Features.ExerciseMuscle.Queries.GetExerciseMuscles;
using AIService.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Nexus.BuildingBlocks.Model;

namespace AIService.API.Controllers
{
    [ApiController]
    [Route("api/exercise-muscles")]
    public class ExerciseMuscleController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ExerciseMuscleController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Lấy danh sách ExerciseMuscle có phân trang
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<ApiResponse<Domain.Common.Models.PagedResult<ExerciseMuscle>>>> GetExerciseMuscles(
            [FromQuery] int pageNumber = 1, 
            [FromQuery] int pageSize = 20,
            [FromQuery] int? exerciseId = null,
            [FromQuery] int? muscleId = null)
        {
            var query = new GetExerciseMusclesQuery 
            { 
                PageNumber = pageNumber, 
                PageSize = pageSize, 
                ExerciseId = exerciseId,
                MuscleId = muscleId
            };
            
            var result = await _mediator.Send(query);
            return Ok(ApiResponse<Domain.Common.Models.PagedResult<ExerciseMuscle>>.SuccessResponse(result.Value!));
        }

        /// <summary>
        /// Lấy thông tin chi tiết ExerciseMuscle theo Id
        /// </summary>
        [HttpGet("{exerciseId}/{muscleId}")]
        public async Task<ActionResult<ApiResponse<ExerciseMuscle>>> GetExerciseMuscle(int exerciseId, int muscleId)
        {
            var result = await _mediator.Send(new GetExerciseMuscleByIdsQuery(exerciseId, muscleId));

            if (result.IsFailure)
            {
                return NotFound(ApiResponse<ExerciseMuscle>.ErrorResponse(result.Error.Message));
            }

            return Ok(ApiResponse<ExerciseMuscle>.SuccessResponse(result.Value!));
        }

        /// <summary>
        /// Thêm mới một ExerciseMuscle
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<ApiResponse<string>>> CreateExerciseMuscle([FromBody] CreateExerciseMuscleCommand command)
        {
            var result = await _mediator.Send(command);
            
            if (result.IsFailure)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse(result.Error.Message));
            }
            
            return Ok(ApiResponse<string>.SuccessResponse("Thêm ExerciseMuscle thành công"));
        }

        /// <summary>
        /// Cập nhật thông tin ExerciseMuscle
        /// </summary>
        [HttpPut("{exerciseId}/{muscleId}")]
        public async Task<ActionResult<ApiResponse<string>>> UpdateExerciseMuscle(int exerciseId, int muscleId, [FromBody] UpdateExerciseMuscleCommand command)
        {
            if (exerciseId != command.ExerciseId || muscleId != command.MuscleId)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse("Id trong đường dẫn không khớp với Id trong dữ liệu"));
            }

            var result = await _mediator.Send(command);
            
            if (result.IsFailure)
            {
                return NotFound(ApiResponse<string>.ErrorResponse(result.Error.Message));
            }
            
            return Ok(ApiResponse<string>.SuccessResponse("Cập nhật ExerciseMuscle thành công"));
        }

        /// <summary>
        /// Xóa ExerciseMuscle
        /// </summary>
        [HttpDelete("{exerciseId}/{muscleId}")]
        public async Task<ActionResult<ApiResponse<string>>> DeleteExerciseMuscle(int exerciseId, int muscleId)
        {
            var result = await _mediator.Send(new DeleteExerciseMuscleCommand { ExerciseId = exerciseId, MuscleId = muscleId });
            
            if (result.IsFailure)
            {
                return NotFound(ApiResponse<string>.ErrorResponse(result.Error.Message));
            }
            
            return Ok(ApiResponse<string>.SuccessResponse("Xoá ExerciseMuscle thành công"));
        }
    }
}
