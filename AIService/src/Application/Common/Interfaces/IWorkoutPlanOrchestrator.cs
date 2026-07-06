using AIService.Application.DTOs.Workout;
using AIService.Application.Features.Workout.Commands.GeneratePlan.Models;

namespace AIService.Application.Common.Interfaces
{
    public interface IWorkoutPlanOrchestrator
    {
        /// <summary>
        /// Tạo khung kế hoạch tập luyện dựa trên hồ sơ người dùng, tổng số tuần và bối cảnh lịch sử.
        /// </summary>
        /// <param name="profile"></param>
        /// <param name="totalWeeks"></param>
        /// <param name="historicalContext"></param>
        /// <param name="ct"></param>
        /// <returns></returns>
        Task<WorkoutBlueprint> CreateBlueprintAsync(UserProfileDto profile, int totalWeeks, string historicalContext, CancellationToken ct = default);
    }
}
