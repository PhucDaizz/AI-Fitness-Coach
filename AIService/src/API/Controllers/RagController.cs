using AIService.Application.Features.Search.Queries;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AIService.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RagController : ControllerBase
    {
        private readonly IMediator _mediator;

        public RagController(IMediator mediator) => _mediator = mediator;

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
    }
}
