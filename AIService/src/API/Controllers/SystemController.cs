using AIService.Application.DTOs.System;
using AIService.Application.Features.System.Queries.GetTokenChartStatistics;
using AIService.Application.Features.System.Queries.GetToolUsage;
using AIService.Domain.Common;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Nexus.BuildingBlocks.Model;

namespace AIService.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SystemController : ControllerBase
    {
        private readonly IMediator _mediator;

        public SystemController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Lấy dữ liệu thống kê Token theo khoảng thời gian (1: 24h qua, 2: 7 ngày qua, 3: 12 tháng qua)
        /// </summary>
        /// <param name="timeFrame">Chọn mốc thời gian muốn lấy (Mặc định là 7 ngày)</param>
        [HttpGet("token-chart")]
        [Authorize(Roles = $"{AppRoles.SysAdmin}")] 
        public async Task<ActionResult<ApiResponse<List<ChartDataPointDto>>>> GetTokenChartData(
            [FromQuery] ChartTimeFrame timeFrame = ChartTimeFrame.Last7Days)
        {
            var query = new GetTokenChartStatisticsQuery(timeFrame);
            var result = await _mediator.Send(query);

            return Ok(ApiResponse<List<ChartDataPointDto>>.SuccessResponse(result.Value!));
        }

        /// <summary>
        /// Thống kê tỷ lệ sử dụng các Tool AI (Pie Chart) theo khoảng thời gian
        /// </summary>
        /// <param name="timeFrame">1: 7 Ngày, 2: Tháng này, 3: Năm nay, 4: Toàn thời gian</param>
        [HttpGet("tool-usage-chart")]
        [Authorize(Roles = $"{AppRoles.SysAdmin}")]
        public async Task<ActionResult<ApiResponse<List<ToolUsagePieChartDto>>>> GetToolUsageChart(
            [FromQuery] ToolUsageTimeFrame timeFrame = ToolUsageTimeFrame.Last7Days)
        {
            var query = new GetToolUsageQuery(timeFrame);
            var result = await _mediator.Send(query);

            return Ok(ApiResponse<List<ToolUsagePieChartDto>>.SuccessResponse(result.Value!));
        }
    }
}
