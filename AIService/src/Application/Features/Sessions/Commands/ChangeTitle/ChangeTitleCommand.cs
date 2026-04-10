using Domain.Common.Response;
using MediatR;

namespace AIService.Application.Features.Sessions.Commands.ChangeTitle
{
    public class ChangeTitleCommand: IRequest<Result>
    {
        public Guid SestionId { get; set; }
        public string UserId { get; set; }
        public string Title { get; set; }
    }
}
