using AIService.Application.DTOs.Workout;
using AIService.Application.Features.Workout.Commands.GeneratePlan.Models;
using System.Text;

namespace AIService.Infrastructure.Services.Helpers
{
    public static class ExecutorPromptBuilder
    {
        /// <summary>
        /// Tạo ra đoạn prompt cảnh báo an toàn về chấn thương
        /// </summary>
        /// <param name="profile"></param>
        /// <returns></returns>
        public static string BuildSafetyBlock(UserProfileDto profile)
        {
            if (string.IsNullOrWhiteSpace(profile.Injuries))
                return "=== INJURIES: None ===";

            return $"""
                === 🚨 INJURY SAFETY (HIGHEST PRIORITY) ===
                User has the following injury/limitation: {profile.Injuries}
                RULES:
                - ABSOLUTELY DO NOT select exercises that directly load or stress the injured area.
                - Prefer exercises that allow pain-free range of motion.
                - Add a note warning the user to stop if they feel pain.
                ============================================
                """;
        }

        /// <summary>
        ///  Tạo ra đoạn prompt giới hạn hoặc liệt kê thiết bị tập luyện mà AI được phép sử dụng.
        /// </summary>
        /// <param name="profile"></param>
        /// <returns></returns>
        public static string BuildEquipmentBlock(UserProfileDto profile)
        {
            var env = profile.Environment?.ToLower() ?? "gym";

            if (env == "gym")
            {
                return """
                    === EQUIPMENT: Full Gym ===
                    All gym equipment is available: barbells, dumbbells, cables,
                    machines, pull-up bars, benches, kettlebells, etc.
                    ==========================
                    """;
            }

            var equipmentMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                ["Barbell"] = "barbell",
                ["Dumbbell"] = "dumbbell",
                ["SZ-Bar"] = "EZ bar / SZ bar",
                ["Kettlebell"] = "kettlebell",
                ["Cable"] = "cable machine",
                ["Machine"] = "gym machine",
                ["Bench"] = "workout bench",
                ["Pull-up bar"] = "pull-up bar",
                ["Resistance band"] = "resistance band",
                ["Swiss ball"] = "swiss ball",
                ["Gym mat"] = "exercise mat",
                ["Bodyweight"] = "bodyweight only",
                ["Other"] = "other"
            };

            var availableEn = profile.Equipment
                .Select(e => equipmentMap.TryGetValue(e, out var en) ? en : e)
                .Where(e => e != "bodyweight only" && e != "exercise mat" && e != "other")
                .Distinct()
                .ToList();

            // ── 2. MÔI TRƯỜNG HOME / OUTDOOR KHÔNG CÓ DỤNG CỤ ──
            if (!availableEn.Any())
            {
                return $"""
                === EQUIPMENT: Bodyweight Only ({env.ToUpper()}) ===
                NO equipment available. Environment is {env.ToUpper()}.
                ONLY select bodyweight and calisthenics exercises.
                DO NOT suggest dumbbells, barbells, bands, or machines.
                =================================================
                """;
            }

            // ── 3. MÔI TRƯỜNG HOME / OUTDOOR CÓ TRANG BỊ VÀI MÓN ──
            var coreEquipment = new HashSet<string>
            {
                "barbell", "dumbbell", "EZ bar / SZ bar", "kettlebell",
                "cable machine", "gym machine", "workout bench",
                "pull-up bar", "resistance band", "swiss ball"
            };

            var hasEquipment = new HashSet<string>(availableEn);
            var missingEquipment = coreEquipment.Except(hasEquipment).ToList();

            return $"""
                === EQUIPMENT: Limited ({env.ToUpper()}) ===
                AVAILABLE (can use): {string.Join(", ", availableEn)}
                NOT AVAILABLE (do NOT suggest): {string.Join(", ", missingEquipment)}
                RULE: If an exercise requires equipment not in the AVAILABLE list, skip it.
                ========================================
            """;
        }


        /// <summary>
        /// Cung cấp chỉ số cường độ tập luyện (Sets, Reps, thời gian nghỉ) dựa trên tuần tập và trình độ của người dùng.
        /// </summary>
        /// <param name="week"></param>
        /// <param name="profile"></param>
        /// <returns></returns>
        public static string BuildIntensityBlock(WeekBlueprint week, UserProfileDto profile)
        {
            var weekIntensity = week.WeekNumber switch
            {
                1 => (Sets: "3", Reps: "12-15", RestSec: "60-75", Label: "Foundation — learn form, moderate load"),
                2 => (Sets: "3-4", Reps: "10-12", RestSec: "75-90", Label: "Build — increase volume"),
                3 => (Sets: "4-5", Reps: "6-10", RestSec: "90-120", Label: "Peak — maximum intensity"),
                4 => (Sets: "2-3", Reps: "15-20", RestSec: "45-60", Label: "Deload — recovery week"),
                _ => (Sets: "3", Reps: "10-12", RestSec: "75", Label: "Standard")
            };

            // Điều chỉnh theo FitnessLevel
            var levelNote = profile.FitnessLevel?.ToLower() switch
            {
                "beginner" or "người mới" =>
                    "User is a BEGINNER: Prioritize form over weight. " +
                    "Use lower end of rep ranges. Avoid high-skill movements.",

                "intermediate" or "trung cấp" =>
                    "User is INTERMEDIATE: Can handle compound movements. " +
                    "Use middle of rep ranges.",

                "advanced" or "nâng cao" =>
                    "User is ADVANCED: Can handle heavy compounds and complex movements. " +
                    "Use higher end of intensity ranges.",

                _ => "Adjust intensity to moderate level."
            };

            return $"""
                === INTENSITY FOR WEEK {week.WeekNumber} ===
                Theme: {weekIntensity.Label}
                Target Sets: {weekIntensity.Sets}
                Target Reps: {weekIntensity.Reps}
                Rest Seconds: {weekIntensity.RestSec}s between sets
                ---
                Fitness Level Note: {levelNote}
                =====================================
                """;
        }

        /// <summary>
        /// Quy định chính xác số lượng bài tập mà phải tạo ra cho một buổi tập, dựa trên thời gian người dùng có.
        /// </summary>
        /// <param name="sessionMinutes"></param>
        /// <returns></returns>
        public static string GetExerciseCount(int sessionMinutes) =>
            sessionMinutes switch
            {
                <= 30 => "EXACTLY 3 exercises (keep rest to 45s)",
                <= 45 => "EXACTLY 4 exercises",
                <= 60 => "EXACTLY 5 exercises",
                <= 75 => "5 to 6 exercises",
                _ => "6 to 8 exercises"
            };

        /// <summary>
        /// Đóng gói và trình bày lại danh sách các bài tập đã được AI chọn cho các ngày trong tuần dưới dạng văn bản có cấu trúc.
        /// </summary>
        /// <param name="days"></param>
        /// <param name="dayExercises"></param>
        /// <returns></returns>
        public static string BuildExerciseContext(
            List<DayBlueprint> days,
            string[] dayExercises)
        {
            var sb = new StringBuilder();
            for (int i = 0; i < days.Count; i++)
            {
                sb.AppendLine(
                    $"--- {days[i].DayOfWeek.ToUpper()} ({days[i].MuscleFocus}) ---");
                sb.AppendLine(dayExercises[i]);
                sb.AppendLine();
            }
            return sb.ToString();
        }
    }
}
