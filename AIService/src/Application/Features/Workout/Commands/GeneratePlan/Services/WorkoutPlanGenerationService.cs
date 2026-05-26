using AIService.Application.Common.Interfaces;
using AIService.Application.DTOs.Workout;
using AIService.Application.Features.Workout.Commands.GeneratePlan.Helpers;
using AIService.Application.Features.Workout.Commands.GeneratePlan.Models;
using Microsoft.Extensions.Logging;
using System.Globalization;

namespace AIService.Application.Features.Workout.Commands.GeneratePlan.Services
{
    public sealed class WorkoutPlanGenerationService : IWorkoutPlanGenerationService
    {
        private readonly IWorkoutIntegrationService _integrationService;
        private readonly IWorkoutPlanOrchestrator _orchestrator;
        private readonly IWeekPlanExecutor _executor;
        private readonly IHistoricalContextBuilder _historicalContextBuilder;
        private readonly ILogger<WorkoutPlanGenerationService> _logger;

        public WorkoutPlanGenerationService(
            IWorkoutIntegrationService integrationService,
            IWorkoutPlanOrchestrator orchestrator,
            IWeekPlanExecutor executor,
            IHistoricalContextBuilder historicalContextBuilder,
            ILogger<WorkoutPlanGenerationService> logger)
        {
            _integrationService = integrationService;
            _orchestrator = orchestrator;
            _executor = executor;
            _historicalContextBuilder = historicalContextBuilder;
            _logger = logger;
        }

        public async Task<GenerateWorkoutPlanResult> GenerateAsync(
            UserProfileDto profile,
            string userId,
            int totalWeeks,
            string startsAt,
            CancellationToken cancellationToken)
        {
            var historicalContext = await _historicalContextBuilder.BuildAsync(userId, cancellationToken);

            _logger.LogInformation(
                "[GeneratePlan] Start. Weeks: {W}, Goal: {G}",
                totalWeeks, profile.FitnessGoal);

            var blueprint = await CreateBlueprintWithRetryAsync(profile, totalWeeks, historicalContext, cancellationToken);

            _logger.LogInformation(
                "[GeneratePlan] Blueprint done. Processing {W} weeks in parallel",
                blueprint.Weeks.Count);

            async Task<WorkoutPlanPayloadDto> ExecuteWeekWithRetryAsync(WeekBlueprint week)
            {
                int maxRetries = 40;
                int delayMs = 1000;

                for (int attempt = 1; attempt <= maxRetries; attempt++)
                {
                    try
                    {
                        return await _executor.ExecuteWeekAsync(week, profile, startsAt, cancellationToken);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "[GeneratePlan] Lỗi Tuần {W} (Thử {A}/{M}). Chờ {D}ms...",
                            week.WeekNumber, attempt, maxRetries, delayMs);

                        if (attempt == maxRetries) throw;

                        await Task.Delay(delayMs, cancellationToken);
                    }
                }

                throw new InvalidOperationException($"Không thể tạo lịch cho tuần {week.WeekNumber} sau {maxRetries} lần thử.");
            }

            _logger.LogInformation("[GeneratePlan] Processing {W} weeks in PARALLEL", blueprint.Weeks.Count);

            var results = await Task.WhenAll(blueprint.Weeks.Select(ExecuteWeekWithRetryAsync));
            var weekPayloads = results.ToList();

            var planIds = totalWeeks == 1
                ? await SaveWeeklyAsync(weekPayloads.ToArray(), startsAt, cancellationToken)
                : await SaveMonthlyAsync(weekPayloads.ToArray(), totalWeeks, startsAt, profile, cancellationToken);

            var summary = $"Đã tạo {blueprint.Weeks.Count} tuần tập luyện " +
                          $"cho mục tiêu '{profile.FitnessGoal}'. " +
                          $"Tổng {weekPayloads.Sum(w => w.Days.Count)} buổi tập.";

            _logger.LogInformation("[GeneratePlan] Done. PlanIds: {Ids}",
                string.Join(", ", planIds));

            return new GenerateWorkoutPlanResult(planIds, summary);
        }

        private async Task<WorkoutBlueprint> CreateBlueprintWithRetryAsync(
            UserProfileDto profile,
            int totalWeeks,
            string historicalContext,
            CancellationToken cancellationToken)
        {
            int maxRetries = 40;
            int delayMs = 1000;

            for (int attempt = 1; attempt <= maxRetries; attempt++)
            {
                try
                {
                    return await _orchestrator.CreateBlueprintAsync(profile, totalWeeks, historicalContext, cancellationToken);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "[GeneratePlan] Blueprint failed (Attempt {A}/{M}). Waiting {D}ms...",
                        attempt, maxRetries, delayMs);

                    if (attempt == maxRetries) throw;

                    await Task.Delay(delayMs, cancellationToken);
                }
            }

            throw new InvalidOperationException($"Cannot create workout blueprint after {maxRetries} attempts.");
        }

        private async Task<List<string>> SaveWeeklyAsync(
            WorkoutPlanPayloadDto[] weekPayloads,
            string startsAt,
            CancellationToken cancellationToken)
        {
            var payload = weekPayloads[0];
            payload.PlanType = "weekly";
            payload.StartsAt = startsAt;

            var weekStart = DateTime.ParseExact(
                startsAt, "yyyy-MM-dd",
                CultureInfo.InvariantCulture);

            int globalOrder = 1;

            foreach (var day in payload.Days.OrderBy(d => d.OrderIndex))
            {
                day.DayOfWeek = DayOfWeekConstants.Normalize(day.DayOfWeek);
                day.OrderIndex = globalOrder++;

                day.ScheduledDate = WorkoutDateHelper.ResolveDayDate(weekStart, day.DayOfWeek).ToString("yyyy-MM-dd");

                for (int i = 0; i < day.Exercises.Count; i++)
                {
                    day.Exercises[i].OrderIndex = i + 1;
                }
            }

            var planId = await _integrationService.CreatePlanToNodeAsync(
                payload, cancellationToken);

            if (string.IsNullOrWhiteSpace(planId))
                throw new InvalidOperationException("Khong the luu workout plan sang Node service.");

            return new List<string> { planId };
        }

        private async Task<List<string>> SaveMonthlyAsync(
            WorkoutPlanPayloadDto[] weekPayloads,
            int totalWeeks,
            string startsAt,
            UserProfileDto profile,
            CancellationToken cancellationToken)
        {
            var allDays = new List<WorkoutDayDto>();
            int globalOrder = 1;

            foreach (var week in weekPayloads.OrderBy(w => w.WeekNumber))
            {
                var weekStart = DateTime.ParseExact(
                    startsAt, "yyyy-MM-dd",
                    CultureInfo.InvariantCulture)
                    .AddDays((week.WeekNumber - 1) * 7);

                foreach (var day in week.Days.OrderBy(d => d.OrderIndex))
                {
                    day.DayOfWeek = DayOfWeekConstants.Normalize(day.DayOfWeek);
                    day.OrderIndex = globalOrder++;
                    day.ScheduledDate = WorkoutDateHelper.ResolveDayDate(weekStart, day.DayOfWeek)
                        .ToString("yyyy-MM-dd");

                    for (int i = 0; i < day.Exercises.Count; i++)
                        day.Exercises[i].OrderIndex = i + 1;

                    allDays.Add(day);
                }
            }

            var monthlyPayload = new WorkoutPlanPayloadDto
            {
                Title = $"Kế hoạch {totalWeeks} tuần - {profile.FitnessGoal}",
                PlanType = "monthly",
                WeekNumber = totalWeeks,
                AiModelUsed = weekPayloads[0].AiModelUsed,
                StartsAt = startsAt,
                Days = allDays
            };

            var planId = await _integrationService.CreatePlanToNodeAsync(
                monthlyPayload, cancellationToken);

            if (string.IsNullOrWhiteSpace(planId))
                throw new InvalidOperationException("Khong the luu workout plan sang Node service.");

            return new List<string> { planId };
        }
    }
}
