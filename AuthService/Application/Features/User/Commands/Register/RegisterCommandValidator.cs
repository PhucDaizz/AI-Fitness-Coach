using FluentValidation;

namespace Application.Features.User.Commands.Register
{
    public class RegisterCommandValidator : AbstractValidator<RegisterCommand>
    {
        public RegisterCommandValidator()
        {
            RuleFor(x => x.FullName)
                .NotEmpty().WithMessage("Full name is required.")
                .MaximumLength(50).WithMessage("Full name must not exceed 50 characters.")
                .Matches(@"^[\p{L}\s.'-]+$").WithMessage("Full name contains invalid characters. Only letters, spaces, dots, and hyphens are allowed.");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email is required.")
                .EmailAddress().WithMessage("A valid email address is required.")
                .MaximumLength(150).WithMessage("Email must not exceed 150 characters.");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password is required.")
                .MinimumLength(8).WithMessage("Password must be at least 8 characters long.") 
                .MaximumLength(100).WithMessage("Password must not exceed 100 characters.")
                .Matches(@"[A-Z]").WithMessage("Password must contain at least one uppercase letter.")
                .Matches(@"[a-z]").WithMessage("Password must contain at least one lowercase letter.")
                .Matches(@"[0-9]").WithMessage("Password must contain at least one number.")
                .Matches(@"[\!\?\*\.\@\#\$\%\^\&\+\=]").WithMessage("Password must contain at least one special character (!?*.@#$%^&+=).");

            RuleFor(x => x.PhoneNumber)
                .NotEmpty().WithMessage("Phone number is required.")
                .MaximumLength(15).WithMessage("Phone number must not exceed 15 digits.")
                .Matches(@"^\d+$").WithMessage("Phone number must only contain digits.")
                .MinimumLength(10).WithMessage("Phone number must be at least 10 digits.");
        }
    }
}