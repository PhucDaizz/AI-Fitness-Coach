using AIService.Application.Features.Equipment.Commands.CreateEquipment;
using AIService.Application.Features.Equipment.Commands.DeleteEquipment;
using AIService.Application.Features.Equipment.Commands.UpdateEquipment;
using AIService.Application.Features.Equipment.Queries.GetEquipmentById;
using AIService.Application.Features.Equipment.Queries.GetEquipments;
using AIService.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Nexus.BuildingBlocks.Model;

namespace AIService.API.Controllers
{
    [ApiController]
    [Route("api/equipments")]
    public class EquipmentController : ControllerBase
    {
        private readonly IMediator _mediator;

        public EquipmentController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Lấy danh sách thiết bị có phân trang
        /// </summary>
        /// <param name="pageNumber">Số trang (mặc định 1)</param>
        /// <param name="pageSize">Kích thước trang (mặc định 20)</param>
        /// <param name="searchTerm">Từ khóa tìm kiếm theo tên thiết bị (tùy chọn)</param>
        /// <returns>Danh sách thiết bị phân trang</returns>
        [HttpGet]
        public async Task<ActionResult<ApiResponse<Domain.Common.Models.PagedResult<Equipment>>>> GetEquipments(
            [FromQuery] int pageNumber = 1, 
            [FromQuery] int pageSize = 20,
            [FromQuery] string? searchTerm = null)
        {
            var query = new GetEquipmentsQuery 
            { 
                PageNumber = pageNumber, 
                PageSize = pageSize, 
                SearchTerm = searchTerm 
            };
            
            var result = await _mediator.Send(query);
            return Ok(ApiResponse<Domain.Common.Models.PagedResult<Equipment>>.SuccessResponse(result.Value!));
        }

        /// <summary>
        /// Lấy thông tin chi tiết thiết bị theo Id
        /// </summary>
        /// <param name="id">Id của thiết bị</param>
        /// <returns>Thông tin thiết bị</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<Domain.Entities.Equipment>>> GetEquipment(int id)
        {
            var result = await _mediator.Send(new GetEquipmentByIdQuery(id));

            if (result.IsFailure)
            {
                return NotFound(ApiResponse<Domain.Entities.Equipment>.ErrorResponse(result.Error.Message));
            }

            return Ok(ApiResponse<Domain.Entities.Equipment>.SuccessResponse(result.Value!));
        }

        /// <summary>
        /// Thêm mới một thiết bị
        /// </summary>
        /// <param name="command">Dữ liệu thiết bị cần thêm</param>
        /// <returns>Thông báo kết quả tạo</returns>
        [HttpPost]
        public async Task<ActionResult<ApiResponse<string>>> CreateEquipment([FromBody] CreateEquipmentCommand command)
        {
            var result = await _mediator.Send(command);
            
            if (result.IsFailure)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse(result.Error.Message));
            }
            
            return Ok(ApiResponse<string>.SuccessResponse("Thêm thiết bị thành công"));
        }

        /// <summary>
        /// Cập nhật thông tin thiết bị
        /// </summary>
        /// <param name="id">Id của thiết bị cần cập nhật</param>
        /// <param name="command">Dữ liệu thiết bị cập nhật</param>
        /// <returns>Thông báo kết quả cập nhật</returns>
        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<string>>> UpdateEquipment(int id, [FromBody] UpdateEquipmentCommand command)
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
            
            return Ok(ApiResponse<string>.SuccessResponse("Cập nhật thiết bị thành công"));
        }

        /// <summary>
        /// Xóa thiết bị
        /// </summary>
        /// <param name="id">Id của thiết bị cần xóa</param>
        /// <returns>Thông báo kết quả xóa</returns>
        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<string>>> DeleteEquipment(int id)
        {
            var result = await _mediator.Send(new DeleteEquipmentCommand { Id = id });
            
            if (result.IsFailure)
            {
                return NotFound(ApiResponse<string>.ErrorResponse(result.Error.Message));
            }
            
            return Ok(ApiResponse<string>.SuccessResponse("Xoá thiết bị thành công"));
        }
    }
}
