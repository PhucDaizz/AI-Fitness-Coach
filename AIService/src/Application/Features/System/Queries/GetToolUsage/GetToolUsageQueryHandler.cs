using AIService.Application.Common.Interfaces;
using AIService.Application.DTOs.System;
using Domain.Common.Response;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AIService.Application.Features.System.Queries.GetToolUsage
{
    public class GetToolUsageQueryHandler : IRequestHandler<GetToolUsageQuery, Result<List<ToolUsagePieChartDto>>>
    {
        private readonly IApplicationDbContext _context;

        public GetToolUsageQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Result<List<ToolUsagePieChartDto>>> Handle(GetToolUsageQuery request, CancellationToken cancellationToken)
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            var query = _context.ToolDailyStats.AsNoTracking();

            query = request.TimeFrame switch
            {
                ToolUsageTimeFrame.Last7Days =>
                    query.Where(x => x.Date >= today.AddDays(-6)),

                ToolUsageTimeFrame.ThisMonth =>
                    query.Where(x => x.Date >= new DateOnly(today.Year, today.Month, 1)),

                ToolUsageTimeFrame.ThisYear =>
                    query.Where(x => x.Date >= new DateOnly(today.Year, 1, 1)),

                _ => query
            };

            var stats = await query
                .GroupBy(x => x.ToolName)
                .Select(g => new ToolUsagePieChartDto
                {
                    ToolName = g.Key,
                    TotalUsage = g.Sum(x => x.UsageCount)
                })
                .OrderByDescending(x => x.TotalUsage)
                .ToListAsync(cancellationToken);

            return Result.Success(stats);
        }
    }
}
