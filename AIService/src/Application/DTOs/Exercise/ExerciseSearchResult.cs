using AIService.Application.Common.Models;

namespace AIService.Application.DTOs.Exercise
{
    public sealed record ExerciseSearchResult(
    ExerciseVectorRecord Record,
    Domain.Entities.Exercise? DbExercise,
    double Score)
    {
        public string Description => DbExercise?.Description ?? "No description.";
        public string ImageUrl => DbExercise?.ImageUrl ?? Record.ImageUrl ?? string.Empty;
        public string CategoryDisplay =>
            string.IsNullOrEmpty(Record.CategoryVN)
                ? Record.Category
                : $"{Record.CategoryVN} ({Record.Category})";
        public string EquipmentDisplay =>
            Record.IsBodyweight
                ? "Bodyweight only"
                : string.Join(", ", Record.Equipments);
    }
}
