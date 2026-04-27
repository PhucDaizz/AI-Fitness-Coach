using AIService.Application.Common.Interfaces;
using AIService.Application.DTOs.Workout;
using AIService.Application.Features.Workout.Commands.GeneratePlan.Models;
using MediatR;
using Microsoft.Extensions.Logging;
using System.Globalization;

namespace AIService.Application.Features.Workout.Commands.GeneratePlan
{
    public sealed class GenerateWorkoutPlanCommandHandler
        : IRequestHandler<GenerateWorkoutPlanCommand, GenerateWorkoutPlanResult>
    {
        private readonly IWorkoutIntegrationService _integrationService;
        private readonly IWorkoutPlanOrchestrator _orchestrator;
        private readonly IWeekPlanExecutor _executor;
        private readonly ILogger<GenerateWorkoutPlanCommandHandler> _logger;

        public GenerateWorkoutPlanCommandHandler(
            IWorkoutIntegrationService integrationService, 
            IWorkoutPlanOrchestrator orchestrator,
            IWeekPlanExecutor executor,
            ILogger<GenerateWorkoutPlanCommandHandler> logger)
        {
            _integrationService = integrationService;
            _orchestrator = orchestrator;
            _executor = executor;
            _logger = logger;
        }

        public async Task<GenerateWorkoutPlanResult> Handle(GenerateWorkoutPlanCommand request, CancellationToken cancellationToken)
        {
            var profile = await _integrationService.GetProfileAsync(cancellationToken)
                ?? throw new UnauthorizedAccessException(
                    "Không thể lấy hồ sơ người dùng hoặc token không hợp lệ.");

            if (request.TotalWeeks is < 1 or > 4)
                throw new ArgumentException("Chỉ được tạo kế hoạch từ 1 đến 4 tuần.");

            if (!profile.AvailableDays.Any())
                throw new ArgumentException("Hồ sơ cần cập nhật ít nhất 1 ngày rảnh để tập.");

            _logger.LogInformation(
                "[GeneratePlan] Start. Weeks: {W}, Goal: {G}",
                request.TotalWeeks, profile.FitnessGoal);

            var blueprint = await _orchestrator.CreateBlueprintAsync(profile, request.TotalWeeks, cancellationToken);

            _logger.LogInformation(
                "[GeneratePlan] Blueprint done. Processing {W} weeks in parallel",
                blueprint.Weeks.Count);

            var weekPayloads = new List<WorkoutPlanPayloadDto>();

            if (request.TotalWeeks >= 3)
            {
                var firstBatchWeeks = blueprint.Weeks.Take(2).ToList();
                var firstBatchTasks = firstBatchWeeks.Select(week =>
                    _executor.ExecuteWeekAsync(week, profile, request.StartsAt, cancellationToken));

                var firstBatchResults = await Task.WhenAll(firstBatchTasks);
                weekPayloads.AddRange(firstBatchResults);

                var remainingWeeks = blueprint.Weeks.Skip(2).ToList();
                if (remainingWeeks.Any())
                {
                    var remainingTasks = remainingWeeks.Select(week =>
                        _executor.ExecuteWeekAsync(week, profile, request.StartsAt, cancellationToken));

                    var remainingResults = await Task.WhenAll(remainingTasks);
                    weekPayloads.AddRange(remainingResults);
                }
            }
            else
            {
                var allTasks = blueprint.Weeks.Select(week =>
                    _executor.ExecuteWeekAsync(week, profile, request.StartsAt, cancellationToken));

                var allResults = await Task.WhenAll(allTasks);
                weekPayloads.AddRange(allResults);
            }

            var planIds = request.TotalWeeks == 1
                ? await SaveWeeklyAsync(weekPayloads.ToArray(), cancellationToken)
                : await SaveMonthlyAsync(weekPayloads.ToArray(), request, profile, cancellationToken);

            var summary = $"Đã tạo {blueprint.Weeks.Count} tuần tập luyện " +
                          $"cho mục tiêu '{profile.FitnessGoal}'. " +
                          $"Tổng {weekPayloads.Sum(w => w.Days.Count)} buổi tập.";

            _logger.LogInformation("[GeneratePlan] Done. PlanIds: {Ids}",
                string.Join(", ", planIds));

            return new GenerateWorkoutPlanResult(planIds, summary);
        }

        private async Task<List<string>> SaveWeeklyAsync(
            WorkoutPlanPayloadDto[] weekPayloads,
            CancellationToken cancellationToken)
        {
            var payload = weekPayloads[0];
            payload.PlanType = "weekly";

            NormalizeDays(payload);

            var planId = await _integrationService.CreatePlanToNodeAsync(
                payload, cancellationToken);

            return new List<string> { planId ?? "" };
        }

        private async Task<List<string>> SaveMonthlyAsync(
            WorkoutPlanPayloadDto[] weekPayloads,
            GenerateWorkoutPlanCommand request,
            UserProfileDto profile,
            CancellationToken cancellationToken)
        {
            var allDays = new List<WorkoutDayDto>();
            int globalOrder = 1;

            foreach (var week in weekPayloads.OrderBy(w => w.WeekNumber))
            {
                var weekStart = DateTime.ParseExact(
                request.StartsAt, "yyyy-MM-dd",
                CultureInfo.InvariantCulture)
                    .AddDays((week.WeekNumber - 1) * 7);

                foreach (var day in week.Days.OrderBy(d => d.OrderIndex))
                {
                    day.DayOfWeek = DayOfWeekConstants.Normalize(day.DayOfWeek);
                    day.OrderIndex = globalOrder++;
                    day.ScheduledDate = ResolveDayDate(weekStart, day.DayOfWeek)
                        .ToString("yyyy-MM-dd");

                    for (int i = 0; i < day.Exercises.Count; i++)
                        day.Exercises[i].OrderIndex = i + 1;

                    allDays.Add(day);
                }
            }

            var monthlyPayload = new WorkoutPlanPayloadDto
            {
                Title = $"Kế hoạch {request.TotalWeeks} tuần - {profile.FitnessGoal}",
                PlanType = "monthly",   
                WeekNumber = request.TotalWeeks,           
                AiModelUsed = weekPayloads[0].AiModelUsed,
                StartsAt = request.StartsAt,
                Days = allDays
            };

            var planId = await _integrationService.CreatePlanToNodeAsync(
                monthlyPayload, cancellationToken);

            return new List<string> { planId ?? "" };
        }

        private static void NormalizeDays(WorkoutPlanPayloadDto payload)
        {
            int order = 1;
            foreach (var day in payload.Days.OrderBy(d => d.OrderIndex))
            {
                day.DayOfWeek = DayOfWeekConstants.Normalize(day.DayOfWeek);
                day.OrderIndex = order++;
                for (int i = 0; i < day.Exercises.Count; i++)
                    day.Exercises[i].OrderIndex = i + 1;
            }
        }

        private static DateTime ResolveDayDate(DateTime weekStart, string dayOfWeek)
        {
            var dayIndex = new Dictionary<string, int>
            {
                ["Monday"] = 1,
                ["Tuesday"] = 2,
                ["Wednesday"] = 3,
                ["Thursday"] = 4,
                ["Friday"] = 5,
                ["Saturday"] = 6,
                ["Sunday"] = 0
            };

            var startDay = (int)weekStart.DayOfWeek; 
            var targetDay = dayIndex[dayOfWeek];

            var diff = targetDay - startDay;
            if (diff < 0) diff += 7;

            return weekStart.AddDays(diff).Date;
        }
    }
}
