using Application.Common.Interfaces;
using Domain.Common.Response;
using MediatR;

namespace Application.Features.User.Commands.ChangeUserStatus
{
    public class ChangeUserStatusCommandHandler : IRequestHandler<ChangeUserStatusCommand, Result<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;

        public ChangeUserStatusCommandHandler(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<bool>> Handle(ChangeUserStatusCommand request, CancellationToken cancellationToken)
        {
            var isSuccess = await _unitOfWork.Auth.ChangeUserStatusAsync(
                request.UserId,
                request.IsActive,
                cancellationToken);

            if (!isSuccess)
            {
                return Result.Failure<bool>(new Error("NOTFOUND","Không tìm thấy người dùng này trong hệ thống."));
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Result.Success(true);
        }
    }
}
