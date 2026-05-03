using AIService.Application.DTOs.Exercise;
using AIService.Application.Features.Embeddings.Commands.SyncExerciseEmbedding;
using AIService.Application.Features.Exercise.Commands.CreateExercise;
using AIService.Application.Features.Exercise.Commands.DeleteExercise;
using AIService.Application.Features.Exercise.Commands.UpdateExercise;
using AIService.Application.Features.Exercise.Queries.GetExerciseById;
using AIService.Application.Features.Exercise.Queries.GetExercises;
using AIService.Domain.Common;
using AIService.Domain.Enum;
using MediatR;
using Microsoft.AspNetCore.Authorization;
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
        /// Lấy danh sách bài tập có phân trang và hỗ trợ lọc nâng cao.
        /// <br/>## Quyền truy cập
        /// <br/>- **Customer**: Chỉ thấy bài tập có `EmbedStatus = embedded`
        /// <br/>- **Admin**: Thấy tất cả bài tập, có thể lọc theo `embedStatus`
        /// <br/>## Kết quả trả về
        /// <br/>- Thành công: Mã 200 kèm danh sách bài tập
        /// <br/>- Thất bại: Mã 400 kèm thông báo lỗi
        /// </summary>
        /// <param name="pageNumber">Số trang hiện tại, bắt đầu từ 1 (mặc định: 1)</param>
        /// <param name="pageSize">Số lượng bản ghi trên mỗi trang, tối đa 100 (mặc định: 20)</param>
        /// <param name="searchTerm">Từ khóa tìm kiếm trong tên bài tập (tùy chọn)</param>
        /// <param name="muscleGroupIds">Danh sách ID nhóm cơ, phân cách bằng dấu phẩy. Ví dụ: "1,2,3" (tùy chọn)</param>
        /// <param name="equipmentIds">Danh sách ID thiết bị, phân cách bằng dấu phẩy. Ví dụ: "5,6,7" (tùy chọn)</param>
        /// <param name="categoryIds">Danh sách ID danh mục, phân cách bằng dấu phẩy. Ví dụ: "10,11,12" (tùy chọn)</param>
        /// <param name="locationTypes">Loại địa điểm tập, phân cách bằng dấu phẩy. Giá trị hợp lệ: "Gym", "Home", "Outdoor" (tùy chọn)</param>
        /// <param name="embedStatus">Trạng thái nhúng của bài tập (Admin only). Giá trị: `embedded`, `pending`, `skip` (mặc định: embedded)</param>
        /// <param name="sortBy">Trường dùng để sắp xếp. Giá trị hợp lệ: "Name", "CreatedAt"(mặc định: "CreatedAt")</param>
        /// <param name="sortDescending">Sắp xếp giảm dần nếu true, tăng dần nếu false (mặc định: true)</param>
        /// <returns>Danh sách bài tập phân trang với các thông tin chi tiết</returns>
        /// <response code="200">Thành công - Trả về danh sách bài tập</response>
        /// <response code="400">Thất bại - Tham số không hợp lệ hoặc có lỗi xảy ra</response>
        /// <response code="401">Chưa xác thực - Cần đăng nhập</response>
        /// <response code="403">Không có quyền - Admin mới được dùng filter embedStatus</response>
        [HttpGet]
        public async Task<ActionResult<ApiResponse<Domain.Common.Models.PagedResult<ExerciseListItemDto>>>> GetExercises(
            [FromQuery] int pageNumber = 1, 
            [FromQuery] int pageSize = 20,
            [FromQuery] string? searchTerm = null,
            [FromQuery] string? muscleGroupIds = null,  // "1,2,3"
            [FromQuery] string? equipmentIds = null,    // "5,6,7"
            [FromQuery] string? categoryIds = null,
            [FromQuery] string? locationTypes = null,   // "Gym,Home"
            [FromQuery] EmbedStatus? embedStatus = EmbedStatus.embedded,
            [FromQuery] string? sortBy = "CreatedAt",
            [FromQuery] bool sortDescending = true)
        {
            var query = new GetExercisesQuery 
            {
                PageNumber = pageNumber,
                PageSize = pageSize,
                SearchTerm = searchTerm,
                MuscleGroupIds = muscleGroupIds?.Split(',').Select(int.Parse).ToList() ?? new List<int>(),
                EquipmentIds = equipmentIds?.Split(',').Select(int.Parse).ToList() ?? new List<int>(),
                CategoryIds = categoryIds?.Split(',').Select(int.Parse).ToList() ?? new List<int>(),
                LocationTypes = locationTypes?.Split(',').ToList() ?? new List<string>(),
                EmbedStatus = embedStatus,  
                SortBy = sortBy,
                SortDescending = sortDescending
            };
            
            var result = await _mediator.Send(query);
            return Ok(ApiResponse<Domain.Common.Models.PagedResult<ExerciseListItemDto>>.SuccessResponse(result.Value!));
        }

        /// <summary>
        /// Lấy thông tin chi tiết bài tập theo Id
        /// </summary>
        /// <param name="id">Id của bài tập</param>
        /// <returns>Thông tin bài tập</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<ExerciseDetailDto>>> GetExercise(int id)
        {
            var result = await _mediator.Send(new GetExerciseByIdQuery(id));

            if (result.IsFailure)
            {
                return NotFound(ApiResponse<ExerciseDetailDto>.ErrorResponse(result.Error.Message));
            }

            return Ok(ApiResponse<ExerciseDetailDto>.SuccessResponse(result.Value!));
        }

        /// <summary>
        /// Thêm mới một bài tập
        /// </summary>
        /// <param name="command">Dữ liệu bài tập cần thêm</param>
        /// <returns>Thông báo kết quả tạo</returns>
        [HttpPost]
        [Authorize(Roles = $"{AppRoles.SysAdmin}")]
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
        [Authorize(Roles = $"{AppRoles.SysAdmin}")]
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
        [Authorize(Roles = $"{AppRoles.SysAdmin}")]
        public async Task<ActionResult<ApiResponse<string>>> DeleteExercise(int id)
        {
            var result = await _mediator.Send(new DeleteExerciseCommand { Id = id });
            
            if (result.IsFailure)
            {
                return NotFound(ApiResponse<string>.ErrorResponse(result.Error.Message));
            }
            
            return Ok(ApiResponse<string>.SuccessResponse("Xoá bài tập thành công"));
        }

        /// <summary>
        /// Đồng bộ lại dữ liệu Vector cho một bài tập cụ thể
        /// </summary>
        /// <param name="id">ID của bài tập</param>
        [HttpPost("{id}/sync-embedding")]
        [Authorize] // Nên giới hạn role Admin nếu có: [Authorize(Roles = "Admin")]
        public async Task<IActionResult> SyncExerciseEmbedding(int id, CancellationToken cancellationToken)
        {
            var result = await _mediator.Send(new SyncExerciseEmbeddingCommand(id), cancellationToken);

            if (!result)
            {
                return BadRequest(new { success = false, message = "Không tìm thấy bài tập hoặc có lỗi khi nhúng dữ liệu." });
            }

            return Ok(new { success = true, message = "Đã đồng bộ Vector thành công." });
        }
    }
}
