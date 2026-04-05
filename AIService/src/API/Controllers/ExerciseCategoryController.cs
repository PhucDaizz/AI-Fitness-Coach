using AIService.Application.DTOs.ExerciseCategory;
using AIService.Application.Features.ExerciseCategory.Commands.CreateExerciseCategory;
using AIService.Application.Features.ExerciseCategory.Commands.DeleteExerciseCategory;
using AIService.Application.Features.ExerciseCategory.Commands.UpdateExerciseCategory;
using AIService.Application.Features.ExerciseCategory.Queries.GetExerciseCategories;
using AIService.Application.Features.ExerciseCategory.Queries.GetExerciseCategoryById;
using AIService.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Nexus.BuildingBlocks.Model;

namespace AIService.API.Controllers
{
    [ApiController]
    [Route("api/exercise-categories")]
    public class ExerciseCategoryController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ExerciseCategoryController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Lấy danh sách danh mục có phân trang
        /// </summary>
        /// <param name="pageNumber">Số trang (mặc định 1)</param>
        /// <param name="pageSize">Kích thước trang (mặc định 20)</param>
        /// <param name="searchTerm">Từ khóa tìm kiếm theo tên danh mục (tùy chọn)</param>
        /// <returns>Danh sách danh mục phân trang</returns>
        [HttpGet]
        public async Task<ActionResult<ApiResponse<Domain.Common.Models.PagedResult<ExerciseCategory>>>> GetExerciseCategories(
            [FromQuery] int pageNumber = 1, 
            [FromQuery] int pageSize = 20,
            [FromQuery] string? searchTerm = null)
        {
            var query = new GetExerciseCategoriesQuery 
            { 
                PageNumber = pageNumber, 
                PageSize = pageSize, 
                SearchTerm = searchTerm 
            };
            
            var result = await _mediator.Send(query);
            return Ok(ApiResponse<Domain.Common.Models.PagedResult<ExerciseCategory>>.SuccessResponse(result.Value!));
        }

        /// <summary>
        /// Lấy thông tin chi tiết danh mục theo Id
        /// </summary>
        /// <param name="id">Id của danh mục</param>
        /// <returns>Thông tin danh mục</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<ExerciseCategory>>> GetExerciseCategory(int id)
        {
            var result = await _mediator.Send(new GetExerciseCategoryByIdQuery(id));

            if (result.IsFailure)
            {
                return NotFound(ApiResponse<ExerciseCategory>.ErrorResponse(result.Error.Message));
            }

            return Ok(ApiResponse<ExerciseCategory>.SuccessResponse(result.Value!));
        }

        /// <summary>
        /// Thêm mới một danh mục
        /// </summary>
        /// <param name="command">Dữ liệu danh mục cần thêm</param>
        /// <returns>Thông báo kết quả tạo</returns>
        [HttpPost]
        public async Task<ActionResult<ApiResponse<string>>> CreateExerciseCategory([FromBody] CreateExerciseCategoryCommand command)
        {
            var result = await _mediator.Send(command);
            
            if (result.IsFailure)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse(result.Error.Message));
            }
            
            return Ok(ApiResponse<string>.SuccessResponse("Thêm danh mục thành công"));
        }

        /// <summary>
        /// Cập nhật thông tin danh mục
        /// </summary>
        /// <param name="id">Id của danh mục cần cập nhật</param>
        /// <param name="command">Dữ liệu danh mục cập nhật</param>
        /// <returns>Thông báo kết quả cập nhật</returns>
        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<string>>> UpdateExerciseCategory(int id, [FromBody] UpdateExerciseCategoryDto command)
        {
            
            var updateCommand = new UpdateExerciseCategoryCommand
            {
                Id = id,
                Name = command.Name,
                NameVN = command.NameVN
            };

            var result = await _mediator.Send(updateCommand);
            
            if (result.IsFailure)
            {
                return NotFound(ApiResponse<string>.ErrorResponse(result.Error.Message));
            }
            
            return Ok(ApiResponse<string>.SuccessResponse("Cập nhật danh mục thành công"));
        }

        /// <summary>
        /// Xóa danh mục
        /// </summary>
        /// <param name="id">Id của danh mục cần xóa</param>
        /// <returns>Thông báo kết quả xóa</returns>
        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<string>>> DeleteExerciseCategory(int id)
        {
            var result = await _mediator.Send(new DeleteExerciseCategoryCommand { Id = id });
            
            if (result.IsFailure)
            {
                return NotFound(ApiResponse<string>.ErrorResponse(result.Error.Message));
            }
            
            return Ok(ApiResponse<string>.SuccessResponse("Xoá danh mục thành công"));
        }
    }
}
