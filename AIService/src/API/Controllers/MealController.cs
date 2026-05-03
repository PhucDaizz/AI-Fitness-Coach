using AIService.Application.DTOs.Meal;
using AIService.Application.Features.Embeddings.Commands.SyncMealEmbedding;
using AIService.Application.Features.Meal.Commands.CreateMeal;
using AIService.Application.Features.Meal.Commands.DeleteMeal;
using AIService.Application.Features.Meal.Commands.UpdateMeal;
using AIService.Application.Features.Meal.Queries.GetAdminMeals;
using AIService.Application.Features.Meal.Queries.GetMealById;
using AIService.Application.Features.Meal.Queries.GetMeals;
using AIService.Domain.Common;
using AIService.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Authorization;
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
        /// Lấy danh sách món ăn có phân trang và hỗ trợ lọc nâng cao
        /// </summary>
        /// <param name="pageNumber">Số trang (mặc định: 1)</param>
        /// <param name="pageSize">Kích thước trang, tối đa 100 (mặc định: 20)</param>
        /// <param name="searchTerm">Từ khóa tìm kiếm theo tên hoặc mô tả</param>
        /// <param name="dietTags">Tags chế độ ăn, cách nhau bằng dấu phẩy. Ví dụ: "Vegetarian,Vegan"</param>
        /// <param name="cuisineType">Loại ẩm thực. Ví dụ: "Italian", "Vietnamese"</param>
        /// <param name="caloriesFrom">Lượng calories tối thiểu (kcal)</param>
        /// <param name="caloriesTo">Lượng calories tối đa (kcal)</param>
        /// <param name="proteinFrom">Protein tối thiểu (g)</param>
        /// <param name="proteinTo">Protein tối đa (g)</param>
        /// <param name="carbsFrom">Carbs tối thiểu (g)</param>
        /// <param name="carbsTo">Carbs tối đa (g)</param>
        /// <param name="fatFrom">Fat tối thiểu (g)</param>
        /// <param name="fatTo">Fat tối đa (g)</param>
        /// <param name="embedStatus">Trạng thái nhúng (Admin only)</param>
        /// <param name="sortBy">Sắp xếp theo: "Name", "Calories", "Protein", "Carbs", "Fat", "CreatedAt"</param>
        /// <param name="sortDescending">Sắp xếp giảm dần (true) hoặc tăng dần (false)</param>
        /// <returns>Danh sách món ăn phân trang</returns>
        [HttpGet]
        public async Task<ActionResult<ApiResponse<Domain.Common.Models.PagedResult<MealListItemDto>>>> GetMeals(
            [FromQuery] GetMealsQuery query)
        {
            var result = await _mediator.Send(query);

            return Ok(ApiResponse<Domain.Common.Models.PagedResult<MealListItemDto>>.SuccessResponse(result.Value!));
        }

        /// <summary>
        /// Lấy danh sách món ăn cho Admin (Hỗ trợ lọc và phân trang nâng cao)
        /// </summary>
        /// <param name="query">Object chứa các điều kiện lọc và phân trang</param>
        /// <returns>Danh sách món ăn phân trang cho Admin</returns>
        [HttpGet("admin")]
        [Authorize(Roles = $"{AppRoles.SysAdmin}")]
        public async Task<ActionResult<ApiResponse<PagedResult<AdminMealDto>>>> GetAdminMeals(
            [FromQuery] GetAdminMealsQuery query)
        {
            var result = await _mediator.Send(query);

            return Ok(ApiResponse<Domain.Common.Models.PagedResult<AdminMealDto>>.SuccessResponse(result.Value!));
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
        [Authorize(Roles = $"{AppRoles.SysAdmin}")]
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
        [Authorize(Roles = $"{AppRoles.SysAdmin}")]
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
        [Authorize(Roles = $"{AppRoles.SysAdmin}")]
        public async Task<ActionResult<ApiResponse<string>>> DeleteMeal(int id)
        {
            var result = await _mediator.Send(new DeleteMealCommand { Id = id });
            
            if (result.IsFailure)
            {
                return NotFound(ApiResponse<string>.ErrorResponse(result.Error.Message));
            }
            
            return Ok(ApiResponse<string>.SuccessResponse("Xoá món ăn thành công"));
        }

        /// <summary>
        /// Đồng bộ lại dữ liệu Vector cho một món ăn cụ thể
        /// </summary>
        /// <param name="id">ID của món ăn</param>
        [HttpPost("{id}/sync-embedding")]
        [Authorize] // Nên thêm [Authorize(Roles = "Admin")] sau này
        public async Task<IActionResult> SyncMealEmbedding(int id, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new SyncMealEmbeddingCommand(id), cancellationToken);

            if (!result)
            {
                return BadRequest(new { success = false, message = "Không tìm thấy món ăn hoặc có lỗi khi nhúng dữ liệu." });
            }

            return Ok(new { success = true, message = "Đã đồng bộ Vector Món ăn thành công." });
        }
    }
}
