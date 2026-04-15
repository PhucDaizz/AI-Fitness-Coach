using AIService.Application.Common.Interfaces;
using AIService.Application.DTOs.ChatMessage;
using AIService.Application.DTOs.Session;
using AIService.Application.Features.Sessions.Commands.ChangeTitle;
using AIService.Application.Features.Sessions.Queries.GetAllSession;
using AIService.Application.Features.Sessions.Queries.GetSessionMessages;
using AIService.Domain.Common.Models;
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

        /// <summary>
        /// Lấy danh sách tất cả các session của người dùng hiện tại
        /// </summary>
        /// <returns></returns>
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

        /// <summary>
        /// Changes the title of an existing session identified by the specified session ID.    
        /// </summary>
        /// <remarks>This method requires the user to be authenticated. The operation will fail and return
        /// a bad request response if the input is invalid or if the session cannot be updated.</remarks>
        /// <param name="sessionId">The unique identifier of the session whose title is to be updated.</param>
        /// <param name="newTitle">The new title to assign to the session. This value cannot be null or empty.</param>
        /// <returns>An IActionResult that indicates the result of the operation. Returns a success response if the title is
        /// changed successfully; otherwise, returns a bad request response with an error message.</returns>
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

        [HttpGet("messages")]
        [Authorize]
        public async Task<IActionResult> GetSessionMessages(Guid sessionId, DateTime? before, int pageSize = 20)
        {
            var userId = _currentUser.UserId;
            var query = new GetSessionMessagesQuery
            (
                sessionId,
                userId!,
                before,
                pageSize
            );
            var result = await _mediator.Send(query);
            if (result.IsFailure)
            {
                return BadRequest(ApiResponse<string>.ErrorResponse(result.Error.Message));
            }
            return Ok(ApiResponse<CursorPagedResult<ChatMessageDto>>.SuccessResponse(result.Value));
        }
    }
}
