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
            _llm = kernel.GetRequiredService<IChatCompletionService>("pt_plant");
            _logger = logger;
        }

        public async Task<WorkoutBlueprint> CreateBlueprintAsync(
            UserProfileDto profile,
            int totalWeeks,
            string historicalContext,
            CancellationToken cancellationToken = default)
        {
            _logger.LogInformation(
                "[Orchestrator] Creating blueprint. User, Weeks: {W}", totalWeeks);

            var history = new ChatHistory("""
                You are a workout planning expert.
                Your ONLY job is to create a weekly workout blueprint in JSON format.
                Do NOT explain. Output ONLY valid JSON.
                """);

            var equipmentInfo = BuildEquipmentInfo(profile);

            var injuryInfo = !string.IsNullOrWhiteSpace(profile.Injuries)
                ? $"INJURIES (must avoid stress on these): {profile.Injuries}"
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

                === HISTORICAL TRAINING DATA ===
                {{historicalContext}}
        
                === RULES ===
                - Only schedule on available days: {{string.Join(", ", profile.AvailableDays)}}
                - Environment and equipment rules:
                    - If Location is outdoor and Equipment is empty, do NOT assume pull-up bars, parallel bars, gym machines, dumbbells, barbells, benches or mats.
                    - If Location is outdoor and Goal is weight_loss or endurance, prioritize walking, jogging, running intervals, cardio conditioning and simple standing bodyweight exercises.
                    - If Location is home and Equipment is empty, use bodyweight exercises only.
                    - If Location is gym, full gym equipment is available.
                - Progressive overload across weeks: each week harder than previous
                - Week 1: foundation — learn movement patterns, moderate volume
                - Week 2: build — increase volume or weight slightly  
                - Week 3: peak — highest intensity
                - Week 4: deload — reduce volume to recover (if totalWeeks = 4)
                - exerciseKeywords must be in English (used for database search)
                - Include injury context in exerciseKeywords to avoid wrong exercises
                - Each day must have muscleFocus in Vietnamese
                - dayOfWeek MUST use exact casing: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
        
                 === OUTPUT FORMAT ===
                {
                    "totalWeeks": {{totalWeeks}},
                    "weeks": [
                    {
                        "weekNumber": 1,
                        "focus": "Nền tảng - Làm quen động tác",
                        "days": [
                        {
                            "dayOfWeek": "Monday",
                            "muscleFocus": "Ngực - Tay trước",
                            "exerciseKeywords": "chest push beginner gym",
                            "orderIndex": 1
                        }
                        ]
                    },
                    {
                        "weekNumber": 2,
                        "focus": "Tăng khối lượng",
                        "days": [...]
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

        private static string BuildEquipmentInfo(UserProfileDto profile)
        {
            var environment = profile.Environment?.Trim().ToLowerInvariant();

            return environment switch
            {
                "gym" =>
                    "Full gym access. User can use machines, cable, dumbbells, barbells, benches, cardio machines and common gym equipment.",

                "home" when profile.Equipment.Any() =>
                    $"Home workout. Available equipment: {string.Join(", ", profile.Equipment)}. Do not use equipment outside this list.",

                "home" =>
                    "Home workout. No equipment available. Use bodyweight exercises only.",

                "outdoor" when profile.Equipment.Any() =>
                    $"Outdoor workout. Available equipment: {string.Join(", ", profile.Equipment)}. Do not assume gym machines or fixed bars unless listed.",

                "outdoor" =>
                    "Outdoor workout. No equipment available. Prioritize walking, jogging, running intervals, mobility and simple bodyweight exercises. Do not assume pull-up bars, parallel bars, machines, dumbbells, barbells, benches or mats.",

                _ =>
                    "No equipment specified. Use safe bodyweight exercises only."
            };
        }
    }
}
