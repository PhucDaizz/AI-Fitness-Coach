using AIService.Application.Common.Interfaces;
using AIService.Application.Features.AI.Utils;
using MediatR;
using Microsoft.Extensions.Logging;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;

namespace AIService.Application.Features.AI.Queries
{
    public sealed class AskFitnessQueryHandler : IRequestHandler<AskFitnessQuery, string>
    {
        private readonly Kernel _kernel;
        private readonly IAITranslationService _translator;
        private readonly IChatCompletionService _ptAi;
        private readonly ILogger<AskFitnessQueryHandler> _logger;

        public AskFitnessQueryHandler(
            Kernel kernel,
            IAITranslationService translator,
            ILogger<AskFitnessQueryHandler> logger)
        {
            _kernel = kernel;
            _translator = translator;
            _logger = logger;
            _ptAi = kernel.GetRequiredService<IChatCompletionService>("pt_brain");
        }

        public async Task<string> Handle(AskFitnessQuery request, CancellationToken cancellationToken)
        {
            // Dịch câu hỏi sang tiếng Anh
            var englishQuestion = await _translator.TranslateVietnameseToEnglishAsync(
                request.Question, cancellationToken);

            _logger.LogInformation(
                "[AskFitness] VI: {Original} → EN: {Translated}",
                request.Question, englishQuestion);

            // PT Brain tự quyết tool hay không 
            var chatHistory = FitnessPromptFactory.CreatePTContext(request.Question, englishQuestion);

            var settings = new PromptExecutionSettings
            {
                FunctionChoiceBehavior = FunctionChoiceBehavior.Auto(autoInvoke: true)
            };

            var response = await _ptAi.GetChatMessageContentAsync(
                chatHistory,
                settings,
                _kernel,        
                cancellationToken);

            _logger.LogInformation("[AskFitness] Done. Length: {Len}", response.Content?.Length);

            return response.Content ?? "Có lỗi xảy ra, vui lòng thử lại.";
        }
    }
}
