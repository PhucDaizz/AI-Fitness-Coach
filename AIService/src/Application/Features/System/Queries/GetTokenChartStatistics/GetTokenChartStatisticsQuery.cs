using AIService.Application.DTOs.System;
using Domain.Common.Response;
using MediatR;

namespace AIService.Application.Features.System.Queries.GetTokenChartStatistics
{
    public record GetTokenChartStatisticsQuery(ChartTimeFrame TimeFrame) : IRequest<Result<List<ChartDataPointDto>>>;
}
