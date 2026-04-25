using AIService.Application.Common.Interfaces;
using AIService.Application.DTOs.Workout;
using AIService.Application.Features.Workout.Commands.GeneratePlan.Models;
using Microsoft.Extensions.Logging;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using System.Text.Json;

namespace AIService.Infrastructure.AI.Orchestrators
{
    public sealed class WorkoutPlanOrchestrator : IWorkoutPlanOrchestrator
    {
        private readonly IChatCompletionService _llm;
        private readonly ILogger<WorkoutPlanOrchestrator> _logger;

        public WorkoutPlanOrchestrator(
            Kernel kernel,
            ILogger<WorkoutPlanOrchestrator> logger)
        {
            _llm = kernel.GetRequiredService<IChatCompletionService>("pt_brain");
            _logger = logger;
        }

        public async Task<WorkoutBlueprint> CreateBlueprintAsync(
            UserProfileDto profile,
            int totalWeeks,
            CancellationToken cancellationToken = default)
        {
            _logger.LogInformation(
                "[Orchestrator] Creating blueprint. User, Weeks: {W}", totalWeeks);

            var history = new ChatHistory("""
                You are a workout planning expert.
                Your ONLY job is to create a weekly workout blueprint in JSON format.
                Do NOT explain. Output ONLY valid JSON.
                """);

            var equipmentInfo = profile.Environment == "gym" ? "Full gym access"
                : profile.Equipment.Any() ? $"Home equipment available: {string.Join(", ", profile.Equipment)}"
                : "Home workout — bodyweight only";

            var injuryInfo = profile.Injuries.Any()
                ? $"INJURIES (must avoid stress on these): {string.Join(", ", profile.Injuries)}"
                : "No injuries";

            history.AddUserMessage($$"""
                Create a {{totalWeeks}}-week workout blueprint for this user:
        
                === USER PROFILE ===
                - Goal: {{profile.FitnessGoal}}
                - Fitness Level: {{profile.FitnessLevel}}
                - Location: {{profile.Environment}}
                - {{equipmentInfo}}
                - Available days: {{string.Join(", ", profile.AvailableDays)}}
                - {{injuryInfo}}
        
                === RULES ===
                - Only schedule on available days: {{string.Join(", ", profile.AvailableDays)}}
                - Week 1: lighter volume to adapt
                - Each week progressively harder
                - exerciseKeywords must be in English (used for database search)
                - Include injury context in exerciseKeywords to avoid wrong exercises
                - Each day must have muscleFocus in Vietnamese
        
                === OUTPUT FORMAT ===
                {
                  "totalWeeks": {{totalWeeks}},
                  "weeks": [
                    {
                      "weekNumber": 1,
                      "focus": "Mô tả trọng tâm tuần bằng tiếng Việt",
                      "days": [
                        {
                          "dayOfWeek": "Monday",
                          "muscleFocus": "Ngực - Tay trước",
                          "exerciseKeywords": "chest push beginner gym",
                          "orderIndex": 1
                        }
                      ]
                    }
                  ]
                }
                """);

            var settings = new PromptExecutionSettings
            {
                FunctionChoiceBehavior = FunctionChoiceBehavior.None()
            };

            var result = await _llm.GetChatMessageContentAsync(
                history, settings, cancellationToken: cancellationToken);

            return ParseBlueprint(result.Content!, totalWeeks);
        }

        private WorkoutBlueprint ParseBlueprint(string json, int expectedWeeks)
        {
            var cleaned = json
                .Replace("```json", "")
                .Replace("```", "")
                .Trim();

            _logger.LogInformation("[Orchestrator] RAW JSON Blueprint:\n{Json}", cleaned);

            var blueprint = JsonSerializer.Deserialize<WorkoutBlueprint>(cleaned,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true })
                ?? throw new InvalidOperationException("LLM1 trả về JSON không hợp lệ.");

            if (!blueprint.Weeks.Any())
                throw new InvalidOperationException("Blueprint không có tuần nào.");

            blueprint.Weeks = blueprint.Weeks.Take(expectedWeeks).ToList();

            _logger.LogInformation(
                "[Orchestrator] Blueprint OK. {W} weeks, {D} days total",
                blueprint.Weeks.Count,
                blueprint.Weeks.Sum(w => w.Days.Count));

            return blueprint;
        }
    }
}
