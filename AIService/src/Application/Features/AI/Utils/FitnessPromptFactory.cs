using AIService.Application.DTOs.ChatMessage;
using Microsoft.SemanticKernel.ChatCompletion;

namespace AIService.Application.Features.AI.Utils
{
    public static class FitnessPromptFactory
    {
        public static ChatHistory CreatePTContext(
            string original, 
            string english,
            List<ChatMessageDto> shortTermHistory,
            List<string> longTermContext)
        {
            string memoryText = longTermContext.Any()
                ? string.Join("\n", longTermContext)
                : "No relevant past memory found.";

            var history = new ChatHistory("""
                You are a professional Personal Trainer and Nutrition Expert.

                TOOL USAGE RULES:
                - Exercises/workout/muscles  → call search_exercises (English query)
                - Food/diet/calories/meals   → call search_nutrition (English query)
                - Calorie needs/TDEE/BMR     → call calculate_tdee
                - BMI/healthy weight         → call calculate_bmi
                - Greetings/general          → answer directly, NO tools
                - May call MULTIPLE tools if needed

                RESPONSE RULES:
                - Always reply in Vietnamese
                - Use Markdown formatting
                - Embed image if URL exists: ![name](url)
                - NEVER invent data outside tool results
                - Pain/injury → advise seeing a doctor
                
                === RELEVANT PAST MEMORY (USER'S HISTORY) ===
                {memoryText}
                =============================================
                """);

            if (shortTermHistory != null)
            {
                foreach (var msg in shortTermHistory)
                {
                    if (msg.Role == "User")
                        history.AddUserMessage(msg.Content);
                    else if (msg.Role == "Assistant")
                        history.AddAssistantMessage(msg.Content);
                }
            }

            history.AddUserMessage($"[Vietnamese]: {original}\n[English for tools]: {english}");

            return history;
        }
    }
}
