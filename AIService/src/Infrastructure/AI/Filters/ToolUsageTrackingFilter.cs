using AIService.Application.Common.Interfaces;
using AIService.Domain.Entities;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.SemanticKernel;

namespace AIService.Infrastructure.AI.Filters
{
    public class ToolUsageTrackingFilter : IFunctionInvocationFilter
    {
        private readonly IServiceProvider _sp;

        public ToolUsageTrackingFilter(IServiceProvider sp)
        {
            _sp = sp;
        }

        public async Task OnFunctionInvocationAsync(FunctionInvocationContext context, Func<FunctionInvocationContext, Task> next)
        {
            await next(context);

            _ = TrackAsync(context.Function.Name);
        }

        private async Task TrackAsync(string functionName)
        {
            try
            {
                await using var scope = _sp.CreateAsyncScope();
                var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

                var today = DateOnly.FromDateTime(DateTime.UtcNow);
                var stat = await unitOfWork.ToolDailyStatRepository
                    .GetStatAsync(today, functionName, CancellationToken.None);

                if (stat == null)
                {
                    stat = new ToolDailyStat(today, functionName);
                    stat.IncrementUsage();
                    await unitOfWork.ToolDailyStatRepository.AddAsync(stat, CancellationToken.None);
                }
                else
                {
                    stat.IncrementUsage();
                    unitOfWork.ToolDailyStatRepository.Update(stat);
                }

                await unitOfWork.SaveChangesAsync(CancellationToken.None);
            }
            catch (Exception ex)
            {
                var logger = _sp.GetService<ILogger<ToolUsageTrackingFilter>>();
                logger?.LogError(ex, "[ToolTracking] Failed: {FunctionName}", functionName);
            }
        }
    }
}
