using AIService.Application.DTOs.Meal;
using AIService.Application.Features.Meal.Commands.CreateMeal;
using AIService.Application.Features.Meal.Commands.DeleteMeal;
using AIService.Application.Features.Meal.Commands.UpdateMeal;
using AIService.Application.Features.Meal.Queries.GetMealById;
using AIService.Application.Features.Meal.Queries.GetMeals;
using AIService.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Nexus.BuildingBlocks.Model;

namespace AIService.API.Controllers
{
    [ApiController]
    [Route("api/meals")]
    public class MealController : ControllerBase
    {
        private readonly IMediator _mediator;

        public MealController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Lấy danh sách món ăn có phân trang
        /// </summary>
        /// <param name="pageNumber">Số trang (mặc định 1)</param>
        /// <param name="pageSize">Kích thước trang (mặc định 20)</param>
        /// <param name="searchTerm">Từ khóa tìm kiếm theo tên hoặc mô tả món ăn (tùy chọn)</param>
        /// <returns>Danh sách món ăn phân trang</returns>
        [HttpGet]
        public async Task<ActionResult<ApiResponse<Domain.Common.Models.PagedResult<Meal>>>> GetMeals(
            [FromQuery] int pageNumber = 1, 
            [FromQuery] int pageSize = 20,
            [FromQuery] string? searchTerm = null)
        {
            var query = new GetMealsQuery 
            { 
                PageNumber = pageNumber, 
                PageSize = pageSize, 
                SearchTerm = searchTerm 
            };
            
            var result = await _mediator.Send(query);
            return Ok(ApiResponse<Domain.Common.Models.PagedResult<Meal>>.SuccessResponse(result.Value!));
        }

        /// <summary>
        /// Lấy thông tin chi tiết món ăn theo Id
        /// </summary>
        /// <param name="id">Id của món ăn</param>
        /// <returns>Thông tin món ăn</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<Meal>>> GetMeal(int id)
        {
            var result = await _mediator.Send(new GetMealByIdQuery(id));

            if (result.IsFailure)
            {
                return NotFound(ApiResponse<Meal>.ErrorResponse(result.Error.Message));
            }

            return Ok(ApiResponse<Meal>.SuccessResponse(result.Value!));
        }

        /// <summary>
        /// Thêm mới một món ăn
        /// </summary>
        /// <param name="command">Dữ liệu món ăn cần thêm</param>
        /// <returns>Thông báo kết quả tạo</returns>
        [HttpPost]
        public async Task<ActionResult<ApiResponse<string>>> CreateMeal([FromBody] CreateMealCommand command)
        {
            var result = await _mediator.Send(command);
            
            if (result.IsFailure)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse(result.Error.Message));
            }
            
            return Ok(ApiResponse<string>.SuccessResponse("Thêm món ăn thành công"));
        }

        /// <summary>
        /// Cập nhật thông tin món ăn
        /// </summary>
        /// <param name="id">Id của món ăn cần cập nhật</param>
        /// <param name="command">Dữ liệu món ăn cập nhật</param>
        /// <returns>Thông báo kết quả cập nhật</returns>
        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<string>>> UpdateMeal(int id, [FromBody] UpdateMealDto command)
        {
            var updateCommand = new UpdateMealCommand
            {
                Id = id,
                Name = command.Name,
                Description = command.Description,
                Calories = command.Calories,
                Protein = command.Protein,
                Carbs = command.Carbs,
                Fat = command.Fat,
                CuisineType = command.CuisineType,
                DietTags = command.DietTags,
                ImageUrl = command.ImageUrl
            };

            var result = await _mediator.Send(updateCommand);
            
            if (result.IsFailure)
            {
                return NotFound(ApiResponse<string>.ErrorResponse(result.Error.Message));
            }
            
            return Ok(ApiResponse<string>.SuccessResponse("Cập nhật món ăn thành công"));
        }

        /// <summary>
        /// Xóa món ăn
        /// </summary>
        /// <param name="id">Id của món ăn cần xóa</param>
        /// <returns>Thông báo kết quả xóa</returns>
        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<string>>> DeleteMeal(int id)
        {
            var result = await _mediator.Send(new DeleteMealCommand { Id = id });
            
            if (result.IsFailure)
            {
                return NotFound(ApiResponse<string>.ErrorResponse(result.Error.Message));
            }
            
            return Ok(ApiResponse<string>.SuccessResponse("Xoá món ăn thành công"));
        }
    }
}
