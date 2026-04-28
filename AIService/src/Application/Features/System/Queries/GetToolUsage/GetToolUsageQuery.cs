using AIService.Application.DTOs.System;
using Domain.Common.Response;
using MediatR;

namespace AIService.Application.Features.System.Queries.GetToolUsage
{
    public record GetToolUsageQuery(ToolUsageTimeFrame TimeFrame) : IRequest<Result<List<ToolUsagePieChartDto>>>;
}
