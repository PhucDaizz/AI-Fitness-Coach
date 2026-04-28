using Application.Features.System.Queries.GetTotalUsersCount;
using Domain.Common;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Nexus.BuildingBlocks.Model;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SystemController : ControllerBase
    {
        private readonly IMediator _mediator;

        public SystemController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Lấy tổng số lượng người dùng ĐÃ ĐĂNG KÝ trên hệ thống 
        /// </summary>
        /// <returns>Tổng số tài khoản user</returns>
        [HttpGet("total-users")]
        [Authorize(Roles = $"{AppRoles.SysAdmin}")] 
        public async Task<ActionResult<ApiResponse<long>>> GetTotalUsers()
        {
            var query = new GetTotalUsersCountQuery();
            var result = await _mediator.Send(query);

            return Ok(ApiResponse<long>.SuccessResponse(result.Value));
        }
    }
}
