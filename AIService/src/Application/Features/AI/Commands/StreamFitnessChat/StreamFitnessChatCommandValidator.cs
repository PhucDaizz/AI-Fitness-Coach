using FluentValidation;

namespace AIService.Application.Features.AI.Commands.StreamFitnessChat
{
    public class StreamFitnessChatCommandValidator: AbstractValidator<StreamFitnessChatCommand>
    {
        public StreamFitnessChatCommandValidator()
        {
            RuleFor(x => x.UserId).NotEmpty().WithMessage("UserId is required.");
            RuleFor(x => x.MessageId).NotEmpty().WithMessage("MessageId is required.");
            RuleFor(x => x.SessionId).NotEmpty().WithMessage("SessionId is required.");
            RuleFor(x => x.Question)
                .NotEmpty().WithMessage("Question is required.")
                .MaximumLength(500).WithMessage("The question is too long, could you summarize it to under 500 characters for PT please!");
        }
    }
}
