using AIService.Application.Features.Exercise.Commands.CreateExercise;
using AIService.Application.Features.Exercise.Commands.DeleteExercise;
using AIService.Application.Features.Exercise.Commands.UpdateExercise;
using AIService.Application.Features.Exercise.Queries.GetExerciseById;
using AIService.Application.Features.Exercise.Queries.GetExercises;
using AIService.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Nexus.BuildingBlocks.Model;

namespace AIService.API.Controllers
{
    [ApiController]
    [Route("api/exercises")]
    public class ExerciseController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ExerciseController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Lấy danh sách bài tập có phân trang
        /// </summary>
        /// <param name="pageNumber">Số trang (mặc định 1)</param>
        /// <param name="pageSize">Kích thước trang (mặc định 20)</param>
        /// <param name="searchTerm">Từ khóa tìm kiếm theo tên hoặc mô tả (tùy chọn)</param>
        /// <returns>Danh sách bài tập phân trang</returns>
        [HttpGet]
        public async Task<ActionResult<ApiResponse<Domain.Common.Models.PagedResult<Exercise>>>> GetExercises(
            [FromQuery] int pageNumber = 1, 
            [FromQuery] int pageSize = 20,
            [FromQuery] string? searchTerm = null)
        {
            var query = new GetExercisesQuery 
            { 
                PageNumber = pageNumber, 
                PageSize = pageSize, 
                SearchTerm = searchTerm 
            };
            
            var result = await _mediator.Send(query);
            return Ok(ApiResponse<Domain.Common.Models.PagedResult<Exercise>>.SuccessResponse(result.Value!));
        }

        /// <summary>
        /// Lấy thông tin chi tiết bài tập theo Id
        /// </summary>
        /// <param name="id">Id của bài tập</param>
        /// <returns>Thông tin bài tập</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<Exercise>>> GetExercise(int id)
        {
            var result = await _mediator.Send(new GetExerciseByIdQuery(id));

            if (result.IsFailure)
            {
                return NotFound(ApiResponse<Exercise>.ErrorResponse(result.Error.Message));
            }

            return Ok(ApiResponse<Exercise>.SuccessResponse(result.Value!));
        }

        /// <summary>
        /// Thêm mới một bài tập
        /// </summary>
        /// <param name="command">Dữ liệu bài tập cần thêm</param>
        /// <returns>Thông báo kết quả tạo</returns>
        [HttpPost]
        public async Task<ActionResult<ApiResponse<string>>> CreateExercise([FromBody] CreateExerciseCommand command)
        {
            var result = await _mediator.Send(command);
            
            if (result.IsFailure)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse(result.Error.Message));
            }
            
            return Ok(ApiResponse<string>.SuccessResponse("Thêm bài tập thành công"));
        }

        /// <summary>
        /// Cập nhật thông tin bài tập
        /// </summary>
        /// <param name="id">Id của bài tập cần cập nhật</param>
        /// <param name="command">Dữ liệu bài tập cập nhật</param>
        /// <returns>Thông báo kết quả cập nhật</returns>
        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<string>>> UpdateExercise(int id, [FromBody] UpdateExerciseCommand command)
        {
            if (id != command.Id)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse("Id trong đường dẫn không khớp với Id trong dữ liệu"));
            }

            var result = await _mediator.Send(command);
            
            if (result.IsFailure)
            {
                return NotFound(ApiResponse<string>.ErrorResponse(result.Error.Message));
            }
            
            return Ok(ApiResponse<string>.SuccessResponse("Cập nhật bài tập thành công"));
        }

        /// <summary>
        /// Xóa bài tập
        /// </summary>
        /// <param name="id">Id của bài tập cần xóa</param>
        /// <returns>Thông báo kết quả xóa</returns>
        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<string>>> DeleteExercise(int id)
        {
            var result = await _mediator.Send(new DeleteExerciseCommand { Id = id });
            
            if (result.IsFailure)
            {
                return NotFound(ApiResponse<string>.ErrorResponse(result.Error.Message));
            }
            
            return Ok(ApiResponse<string>.SuccessResponse("Xoá bài tập thành công"));
        }
    }
}
