using FluentValidation;

namespace AIService.Application.Features.Sessions.Commands.ChangeTitle
{
    public class ChangeTitleCommandValidator : AbstractValidator<ChangeTitleCommand>
    {
        public ChangeTitleCommandValidator()
        {
            RuleFor(x => x.SestionId)
                .NotEmpty().WithMessage("SessionId is required.");
            RuleFor(x => x.UserId)
                .NotEmpty().WithMessage("UserId is required.");
            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("Title is required.")
                .MaximumLength(100).WithMessage("Title must not exceed 100 characters.");
        }
    }
}
