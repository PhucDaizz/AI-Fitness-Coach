using AIService.Application.Common.Contexts;
using AIService.Application.DTOs.Workout;
using AIService.Application.Features.Workout.Commands.GeneratePlan;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.SemanticKernel;
using System.ComponentModel;
using System.Globalization;

namespace AIService.Infrastructure.AI.Plugins
{
    public class WorkoutPlanPlugin
    {
        private readonly IServiceProvider _sp;

        public WorkoutPlanPlugin(IServiceProvider sp)
        {
            _sp = sp;
        }

        [KernelFunction("generate_workout_plan")]
        [Description("""
            Start creating a personalized workout plan for the current user.
            Use this when the user asks to create, generate, build, or set up a workout plan,
            training schedule, weekly plan, monthly plan, gym routine, or home workout routine.
            This function queues the official workout-plan generation pipeline and returns a job status.
            """)]
        public async Task<string> GenerateWorkoutPlanAsync(
            [Description("Number of weeks to generate. Must be between 1 and 4. If the user does not specify, use 4.")]
            int totalWeeks = 4,

            [Description("Start date in yyyy-MM-dd format. If the user does not specify, leave empty and today will be used.")]
            string? startsAt = null,

            CancellationToken cancellationToken = default)
        {
            await using var scope = _sp.CreateAsyncScope();

            var logger = scope.ServiceProvider.GetRequiredService<ILogger<WorkoutPlanPlugin>>();
            var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();

            var normalizedWeeks = Math.Clamp(totalWeeks, 1, 4);
            var normalizedStartsAt = NormalizeStartDate(startsAt);
            var accessToken = AccessTokenHolder.Current ?? string.Empty;
            var userId = AccessTokenHolder.CurrentUserId;

            try
            {
                var job = await mediator.Send(
                    new GenerateWorkoutPlanCommand(normalizedWeeks, normalizedStartsAt, accessToken, userId),
                    cancellationToken);

                return BuildResponse(job, normalizedWeeks, normalizedStartsAt);
            }
            catch (Exception ex)
            {
                logger.LogError(ex,
                    "[WorkoutPlanPlugin] Failed to enqueue workout plan generation. Weeks: {Weeks}, StartsAt: {StartsAt}",
                    normalizedWeeks,
                    normalizedStartsAt);

                return "Không thể bắt đầu tạo kế hoạch tập luyện lúc này. Vui lòng kiểm tra hồ sơ tập luyện của bạn và thử lại.";
            }
        }

        private static string NormalizeStartDate(string? startsAt)
        {
            if (DateTime.TryParseExact(
                    startsAt,
                    "yyyy-MM-dd",
                    CultureInfo.InvariantCulture,
                    DateTimeStyles.None,
                    out var parsed))
            {
                return parsed.ToString("yyyy-MM-dd");
            }

            return DateTime.Today.ToString("yyyy-MM-dd");
        }

        private static string BuildResponse(
            WorkoutPlanGenerationJobDto job,
            int totalWeeks,
            string startsAt)
        {
            if (job.IsExisting)
            {
                return
                    $"Bạn đang có một yêu cầu tạo kế hoạch tập luyện đang chạy. " +
                    $"Mã theo dõi: {job.JobId}. Trạng thái hiện tại: {job.Status}.";
            }

            return
                $"Mình đã bắt đầu tạo kế hoạch tập luyện {totalWeeks} tuần cho bạn, bắt đầu từ {startsAt}. " +
                $"Mã theo dõi: {job.JobId}. Quá trình này có thể mất vài phút, hệ thống sẽ cập nhật khi hoàn tất.";
        }
    }
}
