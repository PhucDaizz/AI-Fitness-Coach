using AIService.Application.Common.Interfaces;
using AIService.Application.DTOs.System;
using Domain.Common.Response;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AIService.Application.Features.System.Queries.GetTokenChartStatistics
{
    public class GetTokenChartStatisticsQueryHandler : IRequestHandler<GetTokenChartStatisticsQuery, Result<List<ChartDataPointDto>>>
    {
        private readonly IApplicationDbContext _context;

        public GetTokenChartStatisticsQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Result<List<ChartDataPointDto>>> Handle(GetTokenChartStatisticsQuery request, CancellationToken cancellationToken)
        {
            var result = new List<ChartDataPointDto>();
            var now = DateTimeOffset.UtcNow;
            var today = DateOnly.FromDateTime(now.DateTime);

            switch (request.TimeFrame)
            {
                case ChartTimeFrame.Last24Hours:
                    var last24h = now.AddHours(-23);
                    var hourlyStatsDb = await _context.Messages
                        .Where(m => m.CreatedAt >= last24h)
                        .GroupBy(m => new { m.CreatedAt.Year, m.CreatedAt.Month, m.CreatedAt.Day, m.CreatedAt.Hour })
                        .Select(g => new { g.Key.Year, g.Key.Month, g.Key.Day, g.Key.Hour, TotalTokens = g.Sum(m => m.TotalTokens ?? 0) })
                        .ToListAsync(cancellationToken);

                    for (int i = 23; i >= 0; i--)
                    {
                        var targetHour = now.AddHours(-i);
                        var stat = hourlyStatsDb.FirstOrDefault(x => x.Year == targetHour.Year && x.Month == targetHour.Month && x.Day == targetHour.Day && x.Hour == targetHour.Hour);
                        result.Add(new ChartDataPointDto { Label = targetHour.ToString("HH:00"), Value = stat?.TotalTokens ?? 0 });
                    }
                    break;

                case ChartTimeFrame.Last7Days:
                    var last7Days = today.AddDays(-6);
                    var dailyStatsDb = await _context.TokenDailyStats
                        .Where(s => s.Date >= last7Days)
                        .ToListAsync(cancellationToken);

                    for (int i = 6; i >= 0; i--)
                    {
                        var targetDay = today.AddDays(-i);
                        var stat = dailyStatsDb.FirstOrDefault(s => s.Date == targetDay);
                        result.Add(new ChartDataPointDto { Label = targetDay.ToString("dd/MM"), Value = stat?.TotalTokens ?? 0 });
                    }
                    break;

                case ChartTimeFrame.Last12Months:
                    var startMonth = today.AddMonths(-11);
                    var firstDayOfStartMonth = new DateOnly(startMonth.Year, startMonth.Month, 1);
                    var monthlyStatsDb = await _context.TokenDailyStats
                        .Where(s => s.Date >= firstDayOfStartMonth)
                        .GroupBy(s => new { s.Date.Year, s.Date.Month })
                        .Select(g => new { g.Key.Year, g.Key.Month, TotalTokens = g.Sum(x => x.TotalTokens) })
                        .ToListAsync(cancellationToken);

                    for (int i = 11; i >= 0; i--)
                    {
                        var targetMonth = today.AddMonths(-i);
                        var stat = monthlyStatsDb.FirstOrDefault(s => s.Year == targetMonth.Year && s.Month == targetMonth.Month);
                        result.Add(new ChartDataPointDto { Label = targetMonth.ToString("MM/yyyy"), Value = stat?.TotalTokens ?? 0 });
                    }
                    break;
            }

            return Result.Success(result);
        }
    }
}
