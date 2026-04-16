using AIService.Application.Common.Interfaces;
using Domain.Common.Response;
using MediatR;

namespace AIService.Application.Features.Sessions.Commands.ChangeTitle
{
    public class ChangeTitleCommandHandler : IRequestHandler<ChangeTitleCommand, Result>
    {
        private readonly IUnitOfWork _unitOfWork;

        public ChangeTitleCommandHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result> Handle(ChangeTitleCommand request, CancellationToken cancellationToken)
        {
            var session = await _unitOfWork.SessionRepository.GetByIdAsync(request.SestionId, cancellationToken);

            if (session == null)
            {
                return Result.Failure(new Error("NOT_FOUND", "Can not fount this sestion"));
            }

            session.UpdateTitle(request.Title);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Result.Success();
        }
    }
}
