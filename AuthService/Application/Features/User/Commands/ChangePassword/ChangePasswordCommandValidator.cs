using FluentValidation;

namespace Application.Features.User.Commands.ChangePassword
{
    public class ChangePasswordCommandValidator : AbstractValidator<ChangePasswordCommand>
    {
        private static readonly char[] SpecialCharacters = { '@', '#', '$', '%', '!', '?', '&', '*', '-', '_', '+', '=', '~' };

        public ChangePasswordCommandValidator()
        {
            RuleFor(x => x.CurrentPassword)
                .NotEmpty().WithMessage("Current password is required");

            RuleFor(x => x.NewPassword)
                .NotEmpty().WithMessage("New password is required")
                .MinimumLength(6).WithMessage("New password must be at least 6 characters")
                .MaximumLength(100).WithMessage("New password cannot exceed 100 characters")
                .Must(ContainDigit).WithMessage("New password must contain at least 1 digit (0-9)")
                .Must(ContainSpecialCharacter).WithMessage($"New password must contain at least 1 special character ({string.Join(", ", SpecialCharacters)})")
                .Must(NotContainWhitespace).WithMessage("New password cannot contain spaces");

            RuleFor(x => x.ConfirmNewPassword)
                .NotEmpty().WithMessage("Password confirmation is required")
                .Equal(x => x.NewPassword).WithMessage("Password confirmation does not match");
        }

        private bool ContainDigit(string password)
        {
            return password.Any(char.IsDigit);
        }

        private bool ContainSpecialCharacter(string password)
        {
            return password.Any(ch => SpecialCharacters.Contains(ch));
        }

        private bool NotContainWhitespace(string password)
        {
            return !password.Contains(' ');
        }
    }
}