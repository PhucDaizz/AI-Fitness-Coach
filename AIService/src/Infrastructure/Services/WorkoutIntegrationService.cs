using AIService.Application.Common.Interfaces;
using AIService.Application.DTOs.Workout;
using Microsoft.Extensions.Logging;
using Nexus.BuildingBlocks.Model;
using System.Net.Http.Json;
using System.Text.Json;

namespace AIService.Infrastructure.Services
{
    public class WorkoutIntegrationService : IWorkoutIntegrationService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<WorkoutIntegrationService> _logger;

        public WorkoutIntegrationService(IHttpClientFactory httpFactory, ILogger<WorkoutIntegrationService> logger)
        {
            _httpClient = httpFactory.CreateClient("WorkoutService");
            _logger = logger;
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

        public async Task<UserProfileDto?> GetProfileAsync(CancellationToken ct = default)
        {
            try
            {
                _logger.LogInformation("[Node Integration] Fetching user profile...");

                var response = await _httpClient.GetAsync("/api/v1/profile", ct);

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

        internal record PlanDataResponse(string PlanId);
    }
}
