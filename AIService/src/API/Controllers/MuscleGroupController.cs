using AIService.Application.DTOs.MuscleGroup;
using AIService.Application.Features.MuscleGroup.Commands.CreateMuscleGroup;
using AIService.Application.Features.MuscleGroup.Commands.DeleteMuscleGroup;
using AIService.Application.Features.MuscleGroup.Commands.UpdateMuscleGroup;
using AIService.Application.Features.MuscleGroup.Queries.GetMuscleGroupById;
using AIService.Application.Features.MuscleGroup.Queries.GetMuscleGroups;
using AIService.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Nexus.BuildingBlocks.Model;

namespace AIService.API.Controllers
{
    [ApiController]
    [Route("api/muscle-groups")]
    public class MuscleGroupController : ControllerBase
    {
        private readonly IMediator _mediator;

        public MuscleGroupController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Lấy danh sách nhóm cơ có phân trang
        /// </summary>
        /// <param name="pageNumber">Số trang (mặc định 1)</param>
        /// <param name="pageSize">Kích thước trang (mặc định 20)</param>
        /// <param name="searchTerm">Từ khóa tìm kiếm theo tên nhóm cơ (tùy chọn)</param>
        /// <returns>Danh sách nhóm cơ phân trang</returns>
        [HttpGet]
        public async Task<ActionResult<ApiResponse<Domain.Common.Models.PagedResult<MuscleGroup>>>> GetMuscleGroups(
            [FromQuery] int pageNumber = 1, 
            [FromQuery] int pageSize = 20,
            [FromQuery] string? searchTerm = null)
        {
            var query = new GetMuscleGroupsQuery 
            { 
                PageNumber = pageNumber, 
                PageSize = pageSize, 
                SearchTerm = searchTerm 
            };
            
            var result = await _mediator.Send(query);
            return Ok(ApiResponse<Domain.Common.Models.PagedResult<MuscleGroup>>.SuccessResponse(result.Value!));
        }

        /// <summary>
        /// Lấy thông tin chi tiết nhóm cơ theo Id
        /// </summary>
        /// <param name="id">Id của nhóm cơ</param>
        /// <returns>Thông tin nhóm cơ</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<MuscleGroup>>> GetMuscleGroup(int id)
        {
            var result = await _mediator.Send(new GetMuscleGroupByIdQuery(id));

            if (result.IsFailure)
            {
                return NotFound(ApiResponse<MuscleGroup>.ErrorResponse(result.Error.Message));
            }

            return Ok(ApiResponse<MuscleGroup>.SuccessResponse(result.Value!));
        }

        /// <summary>
        /// Thêm mới một nhóm cơ
        /// </summary>
        /// <param name="command">Dữ liệu nhóm cơ cần thêm</param>
        /// <returns>Thông báo kết quả tạo</returns>
        [HttpPost]
        public async Task<ActionResult<ApiResponse<string>>> CreateMuscleGroup([FromBody] CreateMuscleGroupCommand command)
        {
            var result = await _mediator.Send(command);
            
            if (result.IsFailure)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse(result.Error.Message));
            }
            
            return Ok(ApiResponse<string>.SuccessResponse("Thêm nhóm cơ thành công"));
        }

        /// <summary>
        /// Cập nhật thông tin nhóm cơ
        /// </summary>
        /// <param name="id">Id của nhóm cơ cần cập nhật</param>
        /// <param name="command">Dữ liệu nhóm cơ cập nhật</param>
        /// <returns>Thông báo kết quả cập nhật</returns>
        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<string>>> UpdateMuscleGroup(int id, [FromBody] UpdateMuscleGroupDto command)
        {
            var updateCommand = new UpdateMuscleGroupCommand
            {
                Id = id,
                NameEN = command.NameEN,
                NameVN = command.NameVN,
                IsFront = command.IsFront
            };

            var result = await _mediator.Send(updateCommand);
            
            if (result.IsFailure)
            {
                return NotFound(ApiResponse<string>.ErrorResponse(result.Error.Message));
            }
            
            return Ok(ApiResponse<string>.SuccessResponse("Cập nhật nhóm cơ thành công"));
        }

        /// <summary>
        /// Xóa nhóm cơ
        /// </summary>
        /// <param name="id">Id của nhóm cơ cần xóa</param>
        /// <returns>Thông báo kết quả xóa</returns>
        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<string>>> DeleteMuscleGroup(int id)
        {
            var result = await _mediator.Send(new DeleteMuscleGroupCommand { Id = id });
            
            if (result.IsFailure)
            {
                return NotFound(ApiResponse<string>.ErrorResponse(result.Error.Message));
            }
            
            return Ok(ApiResponse<string>.SuccessResponse("Xoá nhóm cơ thành công"));
        }
    }
}
