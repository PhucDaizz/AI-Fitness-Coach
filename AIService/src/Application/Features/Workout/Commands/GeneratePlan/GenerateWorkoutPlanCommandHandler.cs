using AIService.Application.Common.Interfaces;
using AIService.Application.DTOs.Workout;
using MediatR;
using Microsoft.Extensions.Logging;

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
            var profile = await _integrationService.GetProfileAsync(cancellationToken);
            if (profile == null)
            {
                throw new UnauthorizedAccessException("Không thể lấy hồ sơ người dùng hoặc token không hợp lệ.");
            }

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

            var weekTasks = blueprint.Weeks.Select(week =>
                _executor.ExecuteWeekAsync(week, profile, request.StartsAt, cancellationToken));

            var weekPayloads = await Task.WhenAll(weekTasks);

            _logger.LogInformation("[GeneratePlan] Saving {W} weeks to Node service", weekPayloads.Length);

            var saveTasks = weekPayloads.Select(payload =>
                _integrationService.CreatePlanToNodeAsync(payload, cancellationToken));

            var results = await Task.WhenAll(saveTasks);

            var planIds = results.Where(id => id != null).ToList(); 
            var summary = $"Đã tạo {blueprint.Weeks.Count} tuần tập luyện " +
                           $"cho mục tiêu '{profile.FitnessGoal}'. " +
                           $"Tổng {weekPayloads.Sum(w => w.Days.Count)} buổi tập.";

            _logger.LogInformation("[GeneratePlan] Done. PlanIds: {Ids}", string.Join(", ", planIds));

            return new GenerateWorkoutPlanResult(planIds, summary);
        }
    }
}
