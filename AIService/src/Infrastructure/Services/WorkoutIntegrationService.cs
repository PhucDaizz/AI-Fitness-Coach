using AIService.Application.Common.Contexts;
using AIService.Application.Common.Interfaces;
using AIService.Application.DTOs.Workout;
using Microsoft.Extensions.Logging;
using Nexus.BuildingBlocks.Model;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;

namespace AIService.Infrastructure.Services
{
    public class WorkoutIntegrationService : IWorkoutIntegrationService
    {
        private readonly HttpClient _httpClient;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<WorkoutIntegrationService> _logger;

        public WorkoutIntegrationService(IHttpClientFactory httpFactory, ILogger<WorkoutIntegrationService> logger)
        {
            _httpClientFactory = httpFactory;
            _logger = logger;
            _httpClient = httpFactory.CreateClient("WorkoutService");
        }

        public async Task<string?> CreatePlanToNodeAsync(WorkoutPlanPayloadDto payload, CancellationToken ct)
        {
            try
            {
                var response = await _httpClient.PostAsJsonAsync("/api/v1/workout-plans", payload, ct);

                if (!response.IsSuccessStatusCode)
                {
                    var error = await response.Content.ReadAsStringAsync(ct);
                    _logger.LogError("[WorkoutService] Node Error: {Status} - {Body}", response.StatusCode, error);
                    return null;
                }

                var result = await response.Content.ReadFromJsonAsync<ApiResponse<PlanDataResponse>>(
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true }, 
                    cancellationToken: ct);

                if (result != null && result.Success && result.Data != null)
                {
                    return result.Data.PlanId;
                }

                _logger.LogWarning("[WorkoutService] Request succeeded but success flag is false or data is null. Message: {Message}", result?.Message);
                return null;
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "[WorkoutService] Cannot reach Node service");
                return null;
            }
            catch (JsonException ex) 
            {
                _logger.LogError(ex, "[WorkoutService] Invalid JSON format returned from Node service");
                return null;
            }
        }

        public async Task<string> GetActivePlansAsync(CancellationToken ct = default)
        {
            using var client = CreateClientWithToken();
            var response = await client.GetAsync("/api/v1/workout-plans?status=active&page=1&limit=5", ct);
            if (!response.IsSuccessStatusCode) return "Lỗi không lấy được danh sách plan.";

            var result = await response.Content.ReadFromJsonAsync<ApiResponse<List<WorkoutPlanSummaryDto>>>(cancellationToken: ct);
            if (result?.Data == null || !result.Data.Any()) return "Người dùng không có lịch tập nào đang Active.";

            return string.Join("\n", result.Data.Select(p => $"PlanId: {p._Id} | Tên: {p.Title} | Bắt đầu: {p.StartsAt:yyyy-MM-dd}"));
        }

        public async Task<AnalyticsSummaryDto> GetAnalyticsSummaryAsync(CancellationToken ct = default)
        {
            using var client = CreateClientWithToken();
            var response = await client.GetFromJsonAsync<ApiResponse<AnalyticsSummaryDto>>("/api/v1/analytics/summary", ct);
            return response?.Data;
        }

        public async Task<List<MuscleVolumeDto>> GetMuscleVolumeAsync(CancellationToken ct = default)
        {
            using var client = CreateClientWithToken();
            var response = await client.GetFromJsonAsync<ApiResponse<List<MuscleVolumeDto>>>("/api/v1/analytics/muscle-volume", ct);
            return response?.Data ?? new List<MuscleVolumeDto>();
        }

        public async Task<string> GetPlanScheduleAsync(string planId, CancellationToken ct = default)
        {
            using var client = CreateClientWithToken();
            var response = await client.GetAsync($"/api/v1/workout-plans/{planId}/days", ct);
            if (!response.IsSuccessStatusCode) return "Lỗi không lấy được chi tiết lịch tập.";

            var result = await response.Content.ReadFromJsonAsync<ApiResponse<List<WorkoutPlanDayDto>>>(cancellationToken: ct);
            if (result?.Data == null) return "Không có dữ liệu ngày tập.";

            var days = result.Data.OrderBy(d => d.ScheduledDate).Select(d =>
                $"- Ngày: {d.ScheduledDate:yyyy-MM-dd} ({d.DayOfWeek}) | Nhóm cơ: {d.MuscleFocus} | Day ID: `{d.Id}`");
            return string.Join("\n", days);
        }

        public async Task<UserProfileDto?> GetProfileAsync(CancellationToken ct = default)
        {
            try
            {
                _logger.LogInformation("[Node Integration] Fetching user profile...");

                using var client = CreateClientWithToken();
                var response = await client.GetAsync("/api/v1/profile", ct);

                if (!response.IsSuccessStatusCode)
                {
                    var errorBody = await response.Content.ReadAsStringAsync(ct);
                    _logger.LogError("[Node Integration] Lỗi lấy Profile: {StatusCode} - {Body}", response.StatusCode, errorBody);
                    return null;
                }

                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var result = await response.Content.ReadFromJsonAsync<ApiResponse<UserProfileDto>>(options, ct);

                if (result != null && result.Success && result.Data != null)
                {
                    return result.Data;
                }

                _logger.LogWarning("[Node Integration] Call API thành công nhưng Success = false. Lỗi: {Message}", result?.Message);
                return null;
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "[Node Integration] Mất kết nối tới Node.js Server.");
                return null;
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "[Node Integration] Dữ liệu Profile trả về sai định dạng JSON.");
                return null;
            }
        }

        public async Task<string> LogWorkoutDayCompleteAsync(string planId, string dayId, CompleteWorkoutDayPayload payload, CancellationToken ct = default)
        {
            using var client = CreateClientWithToken();
            var response = await client.PostAsJsonAsync($"/api/v1/workout-plans/{planId}/days/{dayId}/complete", payload, ct);

            var responseString = await response.Content.ReadAsStringAsync(ct);

            if (response.IsSuccessStatusCode)
            {
                return $"SUCCESS: {responseString}";
            }

            return $"FAILED: {responseString}";
        }

        public async Task<string> ReschedulePlanAsync(string planId, string currentDay, string targetDay, string strategy, CancellationToken ct = default)
        { 
            if (string.IsNullOrEmpty(planId))
            {
                return "Error: Bạn chưa có lịch tập nào đang hoạt động để dời.";
            }

            _logger.LogInformation("[Node Integration] Rescheduling plan {PlanId} - {Strategy} from {Current} to {Target}",
                    planId, strategy, currentDay, targetDay);

            var payload = new RescheduleRequestDto
            {
                CurrentDay = currentDay,
                TargetDay = targetDay,
                Strategy = strategy.ToUpper()
            };

            using var client = CreateClientWithToken();
            var response = await client.PostAsJsonAsync($"/api/v1/workout-plans/{planId}/reschedule", payload, ct);

            if (response.IsSuccessStatusCode) return "SUCCESS: Đã dời lịch thành công!";
            return $"ERROR: {await response.Content.ReadAsStringAsync(ct)}";
        }


        private HttpClient CreateClientWithToken()
        {
            var client = _httpClientFactory.CreateClient("WorkoutService");
            var token = AccessTokenHolder.Current; 
            if (!string.IsNullOrEmpty(token))
            {
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            }
            return client;
        }


        internal record PlanDataResponse(string PlanId);
    }
}
