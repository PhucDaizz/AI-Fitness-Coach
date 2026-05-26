using AIService.Application.Common.Interfaces;
using AIService.Application.DTOs.Workout;
using AIService.Application.Features.Workout.Commands.GeneratePlan.Events;
using MediatR;
using Microsoft.Extensions.Logging;

namespace AIService.Application.Features.Workout.Commands.GeneratePlan
{
    public sealed class GenerateWorkoutPlanCommandHandler
        : IRequestHandler<GenerateWorkoutPlanCommand, WorkoutPlanGenerationJobDto>
    {
        private const string Exchange = "fitness-catalog.events";
        private const string ExchangeType = "topic";
        private const string RoutingKey = "workout.plan.generate.requested";
        private static readonly TimeSpan JobExpiry = TimeSpan.FromHours(6);
        private static readonly TimeSpan TokenExpiry = TimeSpan.FromMinutes(20);

        private readonly IWorkoutIntegrationService _integrationService;
        private readonly ICurrentUserService _currentUserService;
        private readonly IIntegrationEventService _integrationEventService;
        private readonly ICacheService _cacheService;
        private readonly ILogger<GenerateWorkoutPlanCommandHandler> _logger;

        public GenerateWorkoutPlanCommandHandler(
            IWorkoutIntegrationService integrationService,
            ICurrentUserService currentUserService,
            IIntegrationEventService integrationEventService,
            ICacheService cacheService,
            ILogger<GenerateWorkoutPlanCommandHandler> logger)
        {
            _integrationService = integrationService;
            _currentUserService = currentUserService;
            _integrationEventService = integrationEventService;
            _cacheService = cacheService;
            _logger = logger;
        }

        public async Task<WorkoutPlanGenerationJobDto> Handle(GenerateWorkoutPlanCommand request, CancellationToken cancellationToken)
        {
            if (request.TotalWeeks is < 1 or > 4)
                throw new ArgumentException("Chi duoc tao ke hoach tu 1 den 4 tuan.");

            if (string.IsNullOrWhiteSpace(request.AccessToken))
                throw new UnauthorizedAccessException("Khong tim thay access token de tao ke hoach nen.");

            var userId = _currentUserService.UserId
                ?? throw new UnauthorizedAccessException("Khong the xac dinh nguoi dung hien tai.");

            var latestJobId = await _cacheService.GetStringAsync(GetLatestJobKey(userId));
            if (!string.IsNullOrWhiteSpace(latestJobId))
            {
                var latestJob = await _cacheService.GetAsync<WorkoutPlanGenerationJobDto>(GetJobKey(latestJobId));
                if (latestJob is not null && IsRunning(latestJob.Status))
                {
                    return latestJob with { IsExisting = true };
                }
            }

            var profile = await _integrationService.GetProfileAsync(cancellationToken)
                ?? throw new UnauthorizedAccessException("Khong the lay ho so nguoi dung hoac token khong hop le.");

            if (!profile.AvailableDays.Any())
                throw new ArgumentException("Ho so can cap nhat it nhat 1 ngay ranh de tap.");

            var jobId = Guid.NewGuid().ToString("N");
            var pendingStatus = new WorkoutPlanGenerationJobDto(
                jobId,
                userId,
                "Pending",
                "Yeu cau tao ke hoach tap luyen da duoc dua vao hang doi.");

            await _cacheService.SetAsync(GetJobKey(jobId), pendingStatus, JobExpiry);
            await _cacheService.SetStringAsync(GetTokenKey(jobId), request.AccessToken, TokenExpiry);
            await _cacheService.SetStringAsync(GetLatestJobKey(userId), jobId, JobExpiry);

            var integrationEvent = new WorkoutPlanGenerationRequestedEvent
            {
                JobId = jobId,
                UserId = userId,
                Profile = profile,
                TotalWeeks = request.TotalWeeks,
                StartsAt = request.StartsAt
            };

            await _integrationEventService.PublishAsync(
                integrationEvent,
                Exchange,
                ExchangeType,
                RoutingKey,
                cancellationToken);

            _logger.LogInformation("[GeneratePlanJob] Queued job {JobId} for user {UserId}", jobId, userId);

            return pendingStatus;
        }

        private static string GetJobKey(string jobId) => $"workout_plan_generation:{jobId}";
        private static string GetTokenKey(string jobId) => $"workout_plan_generation_token:{jobId}";
        private static string GetLatestJobKey(string userId) => $"workout_plan_generation:user:{userId}:latest";
        private static bool IsRunning(string status) =>
            status.Equals("Pending", StringComparison.OrdinalIgnoreCase) ||
            status.Equals("InProgress", StringComparison.OrdinalIgnoreCase);
    }
}
