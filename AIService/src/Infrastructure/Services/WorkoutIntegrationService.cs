using AIService.Application.Common.Contexts;
using AIService.Application.Common.Interfaces;
using AIService.Application.DTOs.Workout;
using Microsoft.Extensions.Logging;
using Nexus.BuildingBlocks.Model;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;

namespace AIService.Infrastructure.Services
{
    public class WorkoutIntegrationService : IWorkoutIntegrationService
    {
        private readonly HttpClient _httpClient;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<WorkoutIntegrationService> _logger;
        private readonly IUnitOfWork _unitOfWork;

        public WorkoutIntegrationService(IHttpClientFactory httpFactory, ILogger<WorkoutIntegrationService> logger, IUnitOfWork unitOfWork)
        {
            _httpClientFactory = httpFactory;
            _logger = logger;
            _unitOfWork = unitOfWork;
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

        public async Task<string> GetActivePlanIdAsync(CancellationToken ct)
        {
            try
            {
                using var client = CreateClientWithToken();
                var response = await client.GetAsync("/api/v1/workout-plans?status=active&page=1&limit=1", ct);

                if (!response.IsSuccessStatusCode)
                {
                    var error = await response.Content.ReadAsStringAsync(ct);
                    _logger.LogError("[WorkoutService] Node Error (GetActivePlan): {Status} - {Body}", response.StatusCode, error);
                    return null;
                }

                var result = await response.Content.ReadFromJsonAsync<ApiResponse<List<ActivePlanResponse>>>(
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true },
                    cancellationToken: ct);

                if (result != null && result.Success && result.Data != null && result.Data.Any())
                {
                    return result.Data.First().PlanId;
                }

                _logger.LogWarning("[WorkoutService] Lấy Active Plan thành công nhưng data rỗng. Message: {Message}", result?.Message);
                return null;
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "[WorkoutService] Không thể kết nối tới Node service (GetActivePlan)");
                return null;
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "[WorkoutService] Lỗi parse JSON từ Node service (GetActivePlan)");
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

        public async Task<List<CalendarDayDto>> GetPlanCalendarAsync(string planId, CancellationToken ct)
        {
            try
            {
                using var client = CreateClientWithToken();
                var response = await client.GetAsync($"/api/v1/workout-plans/{planId}/calendar", ct);

                if (!response.IsSuccessStatusCode)
                {
                    var error = await response.Content.ReadAsStringAsync(ct);
                    _logger.LogError("[WorkoutService] Node Error (GetCalendar): {Status} - {Body}", response.StatusCode, error);
                    return new List<CalendarDayDto>();
                }

                var result = await response.Content.ReadFromJsonAsync<ApiResponse<List<CalendarDayDto>>>(
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true },
                    cancellationToken: ct);

                if (result != null && result.Success && result.Data != null)
                {
                    return result.Data;
                }

                _logger.LogWarning("[WorkoutService] Lấy Calendar thành công nhưng data rỗng. Message: {Message}", result?.Message);
                return new List<CalendarDayDto>();
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "[WorkoutService] Không thể kết nối tới Node service (GetCalendar)");
                return new List<CalendarDayDto>();
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "[WorkoutService] Lỗi parse JSON từ Node service (GetCalendar)");
                return new List<CalendarDayDto>();
            }
        }

        public async Task<string> GetPlanScheduleAsync(string planId, CancellationToken ct = default)
        {
            using var client = CreateClientWithToken();
            var response = await client.GetAsync($"/api/v1/workout-plans/{planId}/days", ct);

            if (!response.IsSuccessStatusCode)
                return "Error: Failed to retrieve plan schedule details.";

            var result = await response.Content.ReadFromJsonAsync<ApiResponse<List<WorkoutPlanDayDto>>>(cancellationToken: ct);

            if (result?.Data == null)
                return "Error: No workout days data available.";

            var planDays = result.Data;

            var exerciseIds = planDays
                .Where(d => d.Exercises != null)
                .SelectMany(d => d.Exercises.Select(e => e.ExerciseId))
                .Where(id => !string.IsNullOrWhiteSpace(id))
                .Distinct()
                .ToList();

            var exerciseDict = await _unitOfWork.ExerciseRepository.GetExerciseNamesByIdsAsync(exerciseIds, ct);

            var sb = new StringBuilder();
            foreach (var day in planDays.OrderBy(d => d.ScheduledDate))
            {
                sb.AppendLine($"- Date: {day.ScheduledDate:yyyy-MM-dd} ({day.DayOfWeek}) | Muscle Focus: {day.MuscleFocus} | Day ID: `{day.Id}`");

                if (day.Exercises != null && day.Exercises.Any())
                {
                    foreach (var ex in day.Exercises.OrderBy(e => e.OrderIndex))
                    {
                        string exName = exerciseDict.TryGetValue(ex.ExerciseId, out var name)
                                        ? name
                                        : $"Unknown (ID: {ex.ExerciseId})";

                        sb.AppendLine($"  + Exercise {ex.OrderIndex}: {exName}");
                        sb.AppendLine($"    - Volume: {ex.Sets} sets x {ex.Reps} | Rest: {ex.RestSeconds}s");
                        sb.AppendLine($"    - Notes: {ex.Notes}");
                    }
                }
                else
                {
                    sb.AppendLine("  + (No exercises scheduled)");
                }
                sb.AppendLine();
            }

            return sb.ToString();
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

        public async Task<List<CompletedDayLogDto>> GetRecentCompletedLogsAsync(string planId, CancellationToken ct)
        {
            try
            {
                using var client = CreateClientWithToken();

                var response = await client.GetAsync($"/api/v1/workout-logs?planId={planId}", ct);

                if (!response.IsSuccessStatusCode)
                {
                    var errorDetail = await response.Content.ReadAsStringAsync(ct);
                    _logger.LogWarning("[IntegrationService] Lấy log thất bại cho PlanId: {PlanId}. Status: {Status}. Detail: {Detail}",
                        planId, response.StatusCode, errorDetail);

                    return new List<CompletedDayLogDto>();
                }

                var result = await response.Content.ReadFromJsonAsync<ApiResponse<List<CompletedDayLogDto>>>(
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true },
                    ct);

                return result?.Data ?? new List<CompletedDayLogDto>();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[IntegrationService] Lỗi Exception khi lấy log cho PlanId: {PlanId}", planId);
                return new List<CompletedDayLogDto>();
            }
        }

        public async Task<List<string>> GetRecentCompletedPlanIdsAsync(int limit = 3, CancellationToken ct = default)
        {
            try
            {
                using var client = CreateClientWithToken();

                var response = await client.GetAsync($"/api/v1/workout-plans?status=completed&page=1&limit={limit}", ct);

                if (!response.IsSuccessStatusCode)
                {
                    var error = await response.Content.ReadAsStringAsync(ct);
                    _logger.LogError("[WorkoutService] Node Error (GetCompletedPlans): {Status} - {Body}", response.StatusCode, error);
                    return new List<string>();
                }

                var result = await response.Content.ReadFromJsonAsync<ApiResponse<List<WorkoutPlanSummaryDto>>>(
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true },
                    cancellationToken: ct);

                if (result?.Data == null || !result.Data.Any())
                    return new List<string>();

                return result.Data.Select(p => p._Id).ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[WorkoutService] Lỗi khi lấy danh sách completed plans");
                return new List<string>();
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

        public async Task<bool> ReplaceEntireDayAsync(string planId, string dayId, ReplaceDayRequestDto payload, CancellationToken ct)
        {
            try
            {
                using var client = CreateClientWithToken();
                var response = await client.PutAsJsonAsync($"/api/v1/workout-plans/{planId}/days/{dayId}/replace", payload, ct);

                if (!response.IsSuccessStatusCode)
                {
                    var error = await response.Content.ReadAsStringAsync(ct);
                    _logger.LogError("[WorkoutService] Node Error (ReplaceDay): {Status} - {Body}", response.StatusCode, error);
                    return false;
                }

                return true;
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "[WorkoutService] Không thể kết nối tới Node service (ReplaceDay)");
                return false;
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "[WorkoutService] Lỗi parse JSON từ Node service (ReplaceDay)");
                return false;
            }
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
