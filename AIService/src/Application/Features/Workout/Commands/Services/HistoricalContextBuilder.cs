using AIService.Application.Common.Interfaces;
using System.Text;

namespace AIService.Application.Features.Workout.Commands.Services
{
    public class HistoricalContextBuilder : IHistoricalContextBuilder
    {
        private readonly IWorkoutIntegrationService _integrationService;
        private readonly IUnitOfWork _unitOfWork;

        public HistoricalContextBuilder(IWorkoutIntegrationService integrationService, IUnitOfWork unitOfWork)
        {
            _integrationService = integrationService;
            _unitOfWork = unitOfWork;
        }

        public async Task<string> BuildAsync(string userId, CancellationToken ct)
        {
            var recentPlanIds = await _integrationService
                .GetRecentCompletedPlanIdsAsync(3, ct);

            if (!recentPlanIds.Any())
                return "User is new. No historical workout data available.";

            var planDataTasks = recentPlanIds.Select(async planId =>
            {
                var calendarTask = _integrationService.GetPlanCalendarAsync(planId, ct);
                var logsTask = _integrationService.GetRecentCompletedLogsAsync(planId, ct);
                await Task.WhenAll(calendarTask, logsTask);
                return (
                    Calendar: calendarTask.Result,
                    Logs: logsTask.Result
                );
            });

            var allPlanData = await Task.WhenAll(planDataTasks);

            var allLogs = allPlanData.SelectMany(p => p.Logs).ToList();
            int totalLogs = allLogs.Count;
            int easyCount = allLogs.Count(l => l.DifficultyFeedback == "easy");
            int okCount = allLogs.Count(l => l.DifficultyFeedback == "ok");
            int hardCount = allLogs.Count(l => l.DifficultyFeedback == "hard");

            var muscleMap = new Dictionary<string, List<ExerciseHistoryEntry>>();
            var allExerciseIds = new HashSet<string>();

            foreach (var (calendar, logs) in allPlanData)
            {
                var dayFocusMap = calendar.ToDictionary(d => d.DayId, d => d.MuscleFocus);

                foreach (var log in logs)
                {
                    var focus = dayFocusMap.TryGetValue(log.DayId, out var f)
                        ? f : "Entire body";

                    if (string.IsNullOrEmpty(focus)) focus = "Entire body";

                    if (!muscleMap.ContainsKey(focus))
                        muscleMap[focus] = new List<ExerciseHistoryEntry>();

                    foreach (var ex in log.Exercises)
                    {
                        allExerciseIds.Add(ex.ExerciseId);
                        muscleMap[focus].Add(new ExerciseHistoryEntry(
                            ExerciseId: ex.ExerciseId,
                            Sets: ex.SetsDone,
                            Reps: ex.RepsDone,
                            WeightKg: ex.WeightKg,
                            Difficulty: log.DifficultyFeedback
                        ));
                    }
                }
            }

            var exerciseNameMap = await _unitOfWork.ExerciseRepository.GetExerciseNamesByIdsAsync(allExerciseIds, ct);

            var sb = new StringBuilder();
            sb.AppendLine("=== RECENT TRAINING HISTORY & STATISTICS ===");

            sb.AppendLine("\n## 1. PERFORMANCE ANALYSIS");
            sb.AppendLine($"- Total sessions logged: {totalLogs}");

            if (totalLogs > 0)
            {
                sb.AppendLine(
                    $"- Difficulty breakdown: {easyCount} Easy / {okCount} Ok / {hardCount} Hard");

                var signal = easyCount > totalLogs * 0.5
                    ? "INCREASE_INTENSITY"
                    : hardCount > totalLogs * 0.5
                        ? "DECREASE_INTENSITY"
                        : "STANDARD_PROGRESSION";

                sb.AppendLine(signal switch
                {
                    "INCREASE_INTENSITY" =>
                        "=> SIGNAL [INCREASE_INTENSITY]: User found most sessions too easy. " +
                        "Increase weight (+5-10%), add 1 set, or use harder variations. " +
                        "Respect equipment constraints.",

                    "DECREASE_INTENSITY" =>
                        "=> SIGNAL [DECREASE_INTENSITY]: User found most sessions hard. " +
                        "Keep same weight, reduce reps slightly, or use easier variations. " +
                        "Focus on building confidence and consistency.",

                    _ =>
                        "=> SIGNAL [STANDARD_PROGRESSION]: User is progressing well. " +
                        "Apply standard progressive overload: +2.5-5kg or +1 set on key exercises."
                });
            }

            sb.AppendLine("\n## 2. EXERCISE HISTORY BY MUSCLE GROUP");
            sb.AppendLine("Format: [exerciseId] Name — sets x reps @ weightKg [difficulty]");
            sb.AppendLine();

            foreach (var (focus, entries) in muscleMap)
            {
                var latestPerExercise = entries
                    .GroupBy(e => e.ExerciseId)
                    .Select(g => g.Last())
                    .Take(6)
                    .ToList();

                if (!latestPerExercise.Any()) continue;

                sb.AppendLine($"### {focus}");
                foreach (var ex in latestPerExercise)
                {
                    var exName = exerciseNameMap.TryGetValue(ex.ExerciseId, out var name) ? name : "Unknown Exercise";

                    var weightStr = ex.WeightKg > 0
                        ? $"@ {ex.WeightKg}kg"
                        : "(bodyweight)";

                    sb.AppendLine(
                        $"  [{ex.ExerciseId}] {exName}: " +
                        $"{ex.Sets}sets x {ex.Reps}reps {weightStr} [{ex.Difficulty}]");
                }
                sb.AppendLine();
            }

            sb.AppendLine("## 3. INSTRUCTIONS FOR EXERCISE SELECTION");
            sb.AppendLine("""
                1. RETAIN CORE MOVEMENTS: Reuse foundational compound exercises — repetition is normal in progressive overload.
                2. APPLY PROGRESSION based on SIGNAL above:
                   - [easy] exercises: increase weight +5-10% OR add 1 set
                   - [ok] exercises:   increase weight +2.5kg OR add 1 set  
                   - [hard] exercises: keep same weight, reduce reps, or use easier variation
                3. UPGRADE VARIATIONS based on equipment only:
                   - HOME/bodyweight: Push-up → Decline Push-up, Pike Push-up (NOT Bench Press)
                   - GYM: Push-up → Barbell Bench Press, Dumbbell Press
                4. ROTATE ACCESSORIES: Replace 30-40% of isolation exercises with new variations.
                5. NEVER suggest equipment the user does not have.
                """);

            return sb.ToString();
        }

        private record ExerciseHistoryEntry(
            string ExerciseId,
            int Sets,
            string Reps,
            float? WeightKg,
            string Difficulty);
    }
}
