using AIService.Application.Common.Contexts;
using AIService.Application.Common.Interfaces;
using AIService.Application.DTOs.Workout;
using AIService.Application.Features.Workout.Commands.GeneratePlan.Events;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Nexus.BuildingBlocks.Interfaces;

namespace AIService.Infrastructure.BackgroundJobs.Consumer
{
    public class WorkoutPlanGenerationConsumer : BackgroundService
    {
        private const string Exchange = "fitness-catalog.events";
        private const string ExchangeType = "topic";
        private const string RoutingKey = "workout.plan.generate.requested";
        private const string QueueName = "ai-service-workout-plan-generation-queue";
        private static readonly TimeSpan JobExpiry = TimeSpan.FromHours(6);

        private readonly IMessageConsumer _consumer;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<WorkoutPlanGenerationConsumer> _logger;

        public WorkoutPlanGenerationConsumer(
            IMessageConsumer consumer,
            IServiceScopeFactory scopeFactory,
            ILogger<WorkoutPlanGenerationConsumer> logger)
        {
            _consumer = consumer;
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            await _consumer.Subscribe<WorkoutPlanGenerationRequestedEvent>(
                exchange: Exchange,
                exchangeType: ExchangeType,
                routingKey: RoutingKey,
                queueName: QueueName,
                handler: msg => ProcessMessage(msg, stoppingToken));
        }

        private async Task ProcessMessage(WorkoutPlanGenerationRequestedEvent message, CancellationToken token)
        {
            using var scope = _scopeFactory.CreateScope();
            var cacheService = scope.ServiceProvider.GetRequiredService<ICacheService>();
            var generationService = scope.ServiceProvider.GetRequiredService<IWorkoutPlanGenerationService>();
            var notifier = scope.ServiceProvider.GetRequiredService<IChatNotifier>();

            var jobKey = GetJobKey(message.JobId);
            var tokenKey = GetTokenKey(message.JobId);

            try
            {
                var accessToken = await cacheService.GetStringAsync(tokenKey);
                if (string.IsNullOrWhiteSpace(accessToken))
                {
                    await SetStatusAsync(
                        cacheService,
                        notifier,
                        new WorkoutPlanGenerationJobDto(
                            message.JobId,
                            message.UserId,
                            "Failed",
                            "Khong the tao ke hoach vi access token cua job da het han.",
                            Error: "Missing or expired job access token."));
                    return;
                }

                await SetStatusAsync(
                    cacheService,
                    notifier,
                    new WorkoutPlanGenerationJobDto(
                        message.JobId,
                        message.UserId,
                        "InProgress",
                        "AI dang tao ke hoach tap luyen."));

                AccessTokenHolder.Current = accessToken;

                var result = await generationService.GenerateAsync(
                    message.Profile,
                    message.UserId,
                    message.TotalWeeks,
                    message.StartsAt,
                    token);

                await SetStatusAsync(
                    cacheService,
                    notifier,
                    new WorkoutPlanGenerationJobDto(
                        message.JobId,
                        message.UserId,
                        "Completed",
                        "Tao ke hoach tap luyen thanh cong.",
                        result.PlanIds,
                        result.Summary));

                _logger.LogInformation("[GeneratePlanJob] Completed job {JobId}", message.JobId);
            }
            catch (Exception ex)
            {
                await SetStatusAsync(
                    cacheService,
                    notifier,
                    new WorkoutPlanGenerationJobDto(
                        message.JobId,
                        message.UserId,
                        "Failed",
                        "Tao ke hoach tap luyen that bai.",
                        Error: ex.Message));

                _logger.LogError(ex, "[GeneratePlanJob] Failed job {JobId}", message.JobId);
            }
            finally
            {
                AccessTokenHolder.Current = null;
                await cacheService.DeleteAsync(tokenKey);
            }

            async Task SetStatusAsync(
                ICacheService cache,
                IChatNotifier chatNotifier,
                WorkoutPlanGenerationJobDto status)
            {
                await cache.SetAsync(jobKey, status, JobExpiry);
                await chatNotifier.SendWorkoutPlanGenerationUpdatedAsync(status.UserId, status);
            }
        }

        private static string GetJobKey(string jobId) => $"workout_plan_generation:{jobId}";
        private static string GetTokenKey(string jobId) => $"workout_plan_generation_token:{jobId}";
    }
}
