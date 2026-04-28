using AIService.Application.DTOs.ChatMessage;
using AIService.Application.Features.AI.Commands.StreamFitnessChat;
using AIService.Application.Features.AI.Queries;
using AIService.Application.Features.Search.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AIService.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RagController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IServiceScopeFactory _scopeFactory;

        public RagController(IMediator mediator, IServiceScopeFactory scopeFactory)
        {
            _mediator = mediator;
            _scopeFactory = scopeFactory;
        }

        [HttpGet("ask-exercise")]
        public async Task<IActionResult> AskExercise([FromQuery] string question)
        {
            if (string.IsNullOrWhiteSpace(question)) return BadRequest("Vui lòng nhập câu hỏi.");

            var answer = await _mediator.Send(new AskExerciseQuery(question));

            return Ok(new
            {
                Question = question,
                Answer = answer
            });
        }

        [HttpPost("ask")]
        public async Task<IActionResult> AskAnyThing([FromBody] AskFitnessQuery question)
        {
            if (string.IsNullOrWhiteSpace(question.Question)) return BadRequest("Vui lòng nhập câu hỏi.");

            var answer = await _mediator.Send(question);

            return Ok(new
            {
                Question = question,
                Answer = answer
            });
        }

        [Authorize]
        [HttpPost("stream-chat")]
        public IActionResult StreamAskFitness([FromBody] StreamChatRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Question))
            {
                return BadRequest("Question are required.");
            }

            var messageId = Guid.NewGuid();
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var accessToken = HttpContext.Request.Headers["Authorization"].FirstOrDefault()
                       ?.Replace("Bearer ", "", StringComparison.OrdinalIgnoreCase);

            var command = new StreamFitnessChatCommand(
                Question: request.Question,
                SessionId: request.SessionId,
                UserId: userId,
                MessageId: messageId,
                AccessToken: accessToken
            );

            _ = Task.Run(async () =>
            {
                try
                {
                    await using var scope = _scopeFactory.CreateAsyncScope();

                    var scopedMediator = scope.ServiceProvider.GetRequiredService<IMediator>();

                    await scopedMediator.Send(command, CancellationToken.None);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[StreamChat Background Error] {ex.Message}");
                }
            });

            
            return Accepted(new { MessageId = messageId, Status = "Processing..." });
        }
    }
}
