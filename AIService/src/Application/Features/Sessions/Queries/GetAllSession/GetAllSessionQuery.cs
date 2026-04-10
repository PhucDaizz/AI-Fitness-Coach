using AIService.Application.DTOs.Session;
using Domain.Common.Response;
using MediatR;

namespace AIService.Application.Features.Sessions.Queries.GetAllSession
{
    public class GetAllSessionQuery : IRequest<Result<List<SessionDto>>>
    {
        public string UserId { get; set; }
    }
}
