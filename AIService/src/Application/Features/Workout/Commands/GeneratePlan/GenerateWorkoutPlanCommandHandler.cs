using AIService.Application.Common.Interfaces;
using AIService.Application.DTOs.Workout;
using AIService.Application.Features.Workout.Commands.GeneratePlan.Helpers;
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
        private readonly IHistoricalContextBuilder _historicalContextBuilder;
        private readonly ICurrentUserService _currentUserService;
        private readonly ILogger<GenerateWorkoutPlanCommandHandler> _logger;

        public GenerateWorkoutPlanCommandHandler(
            IWorkoutIntegrationService integrationService, 
            IWorkoutPlanOrchestrator orchestrator,
            IWeekPlanExecutor executor,
            IHistoricalContextBuilder historicalContextBuilder,
            ICurrentUserService currentUserService,
            ILogger<GenerateWorkoutPlanCommandHandler> logger)
        {
            _integrationService = integrationService;
            _orchestrator = orchestrator;
            _executor = executor;
            _historicalContextBuilder = historicalContextBuilder;
            _currentUserService = currentUserService;
            _logger = logger;
        }

        public async Task<GenerateWorkoutPlanResult> Handle(GenerateWorkoutPlanCommand request, CancellationToken cancellationToken)
        {
            var profileTask = _integrationService.GetProfileAsync(cancellationToken);
            var historyTask = _historicalContextBuilder.BuildAsync(_currentUserService.UserId!, cancellationToken);

            await Task.WhenAll(profileTask, historyTask);

            var profile = await profileTask
                ?? throw new UnauthorizedAccessException("Không thể lấy hồ sơ người dùng hoặc token không hợp lệ.");
            var historicalContext = await historyTask;

            if (request.TotalWeeks is < 1 or > 4)
                throw new ArgumentException("Chỉ được tạo kế hoạch từ 1 đến 4 tuần.");

            if (!profile.AvailableDays.Any())
                throw new ArgumentException("Hồ sơ cần cập nhật ít nhất 1 ngày rảnh để tập.");

            _logger.LogInformation(
                "[GeneratePlan] Start. Weeks: {W}, Goal: {G}",
                request.TotalWeeks, profile.FitnessGoal);

            var blueprint = await _orchestrator.CreateBlueprintAsync(profile, request.TotalWeeks, historicalContext, cancellationToken);

            _logger.LogInformation(
                "[GeneratePlan] Blueprint done. Processing {W} weeks in parallel",
                blueprint.Weeks.Count);

            var weekPayloads = new List<WorkoutPlanPayloadDto>();

            async Task<WorkoutPlanPayloadDto> ExecuteWeekWithRetryAsync(WeekBlueprint week)
            {
                int maxRetries = 15;
                int delayMs = 1000;

                for (int attempt = 1; attempt <= maxRetries; attempt++)
                {
                    try
                    {
                        return await _executor.ExecuteWeekAsync(week, profile, request.StartsAt, cancellationToken);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "[GeneratePlan] Lỗi Tuần {W} (Thử {A}/{M}). Chờ {D}ms...",
                            week.WeekNumber, attempt, maxRetries, delayMs);

                        if (attempt == maxRetries) throw; 

                        await Task.Delay(delayMs, cancellationToken);
                        delayMs *= 1; 
                    }
                }

                throw new InvalidOperationException($"Không thể tạo lịch cho tuần {week.WeekNumber} sau {maxRetries} lần thử.");
            }

            // ── CHẾ ĐỘ 1: TỪ 1 ĐẾN 2 TUẦN (CHẠY FULL SONG SONG CÓ RETRY ĐỘC LẬP) ──
            if (request.TotalWeeks <= 2)
            {
                _logger.LogInformation("[GeneratePlan] Processing {W} weeks in PARALLEL (Fast Mode - Safe)", blueprint.Weeks.Count);

                var allTasks = blueprint.Weeks.Select(week => ExecuteWeekWithRetryAsync(week));

                var allResults = await Task.WhenAll(allTasks);
                weekPayloads.AddRange(allResults);
            }
            // ── CHẾ ĐỘ 2: 3-4 TUẦN (HYBRID: 2 TUẦN ĐẦU SONG SONG, PHẦN CÒN LẠI TUẦN TỰ) ──
            else
            {
                _logger.LogInformation("[GeneratePlan] Processing 3-4 weeks (Hybrid Mode: 2 Parallel, rest Sequential)");

                var firstTwoWeeks = blueprint.Weeks.Take(2).ToList();
                var parallelTasks = firstTwoWeeks.Select(week => ExecuteWeekWithRetryAsync(week));

                var parallelResults = await Task.WhenAll(parallelTasks);
                weekPayloads.AddRange(parallelResults);

                _logger.LogInformation("[GeneratePlan] Đã xong 2 tuần đầu. Delay 2s để xả nhiệt Gemini API...");
                await Task.Delay(2000, cancellationToken);

                // Giai đoạn 2: Tuần 3 và Tuần 4 chạy tuần tự
                var remainingWeeks = blueprint.Weeks.Skip(2).ToList();

                for (int i = 0; i < remainingWeeks.Count; i++)
                {
                    var week = remainingWeeks[i];
                    _logger.LogInformation("[GeneratePlan] Bắt đầu xử lý Tuần {W} (Sequential)...", week.WeekNumber);

                    var weekResult = await ExecuteWeekWithRetryAsync(week);
                    weekPayloads.Add(weekResult);

                    if (i < remainingWeeks.Count - 1)
                    {
                        _logger.LogInformation("[GeneratePlan] Hoàn thành Tuần {W}. Delay 1.5s...", week.WeekNumber);
                        await Task.Delay(1500, cancellationToken);
                    }
                }
            }

            var planIds = request.TotalWeeks == 1
                ? await SaveWeeklyAsync(weekPayloads.ToArray(), request, cancellationToken)
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
            GenerateWorkoutPlanCommand request,
            CancellationToken cancellationToken)
        {
            var payload = weekPayloads[0];
            payload.PlanType = "weekly";
            payload.StartsAt = request.StartsAt;

            var weekStart = DateTime.ParseExact(
                request.StartsAt, "yyyy-MM-dd",
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
                    day.ScheduledDate = WorkoutDateHelper.ResolveDayDate(weekStart, day.DayOfWeek)
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

    }
}
