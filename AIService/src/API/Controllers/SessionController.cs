using AIService.Application.Common.Interfaces;
using AIService.Application.DTOs.Session;
using AIService.Application.Features.Sessions.Commands.ChangeTitle;
using AIService.Application.Features.Sessions.Queries.GetAllSession;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Nexus.BuildingBlocks.Model;

namespace AIService.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SessionController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ICurrentUserService _currentUser;

        public SessionController(IMediator mediator, ICurrentUserService currentUser)
        {
            _mediator = mediator;
            _currentUser = currentUser;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAllSestions()
        {
            var userId = _currentUser.UserId;
            var query = new GetAllSessionQuery
            {
                UserId = userId
            };
            var result = await _mediator.Send(query);
            return Ok(ApiResponse<List<SessionDto>>.SuccessResponse(result.Value));
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> ChangeTitle(Guid sessionId, string newTitle)
        {
            var userId = _currentUser.UserId;

            var command = new ChangeTitleCommand
            {
                SestionId = sessionId,
                UserId = _currentUser.UserId!,
                Title = newTitle
            };

            var result = await _mediator.Send(command);
            if (result.IsFailure)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse(result.Error.Message));
            }
            return Ok(ApiResponse<string>.SuccessResponse("Title changed successfully"));
        }
    }
}
