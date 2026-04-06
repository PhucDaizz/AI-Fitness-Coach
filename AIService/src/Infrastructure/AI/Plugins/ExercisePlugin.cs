using AIService.Application.Common.Interfaces;
using AIService.Application.Features.Exercise.Utils;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.SemanticKernel;
using System.ComponentModel;

namespace AIService.Infrastructure.AI.Plugins
{
    public sealed class ExercisePlugin
    {
        private readonly IServiceProvider _sp;

        public ExercisePlugin(IServiceProvider sp)
        {
            _sp = sp;
        }

        [KernelFunction("search_exercises")]
        [Description("""
        Search the exercise database for workout information.
        Use when user asks about: exercises, workouts, gym, muscles,
        cardio, training techniques, equipment, weekly training plans,
        bodyweight exercises, strength training.
        Input must be in English.
        """)]
        public async Task<string> SearchExercisesAsync(
        [Description("English keywords or question about exercises")] string query,
        CancellationToken ct = default)
        {
            await using var scope = _sp.CreateAsyncScope();
            var searchService = scope.ServiceProvider.GetRequiredService<IExerciseSearchService>();

            var results = await searchService.SearchAsync(query, ct: ct);
            return ExerciseResultFormatter.Format(results);
        }
    }
}
