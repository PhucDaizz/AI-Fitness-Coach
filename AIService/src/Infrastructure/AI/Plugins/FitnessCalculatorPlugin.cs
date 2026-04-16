using Microsoft.SemanticKernel;
using System.ComponentModel;

namespace AIService.Infrastructure.AI.Plugins
{
    public sealed class FitnessCalculatorPlugin
    {
        [KernelFunction("calculate_tdee")]
        [Description("""
            Calculate daily calorie needs (TDEE/BMR) for a person.
            Use when user asks about: how many calories to eat,
            TDEE, BMR, calorie needs, calories for weight loss or muscle gain.
            """)]
        public string CalculateTdee(
            [Description("Body weight in kilograms")] double weightKg,
            [Description("Height in centimeters")] double heightCm,
            [Description("Age in years")] int age,
            [Description("Gender: male or female")] string gender,
            [Description("Activity level: sedentary, light, moderate, active, very_active")]
            string activityLevel)
        {
            double bmr = gender.ToLower() == "male"
                ? 88.362 + (13.397 * weightKg) + (4.799 * heightCm) - (5.677 * age)
                : 447.593 + (9.247 * weightKg) + (3.098 * heightCm) - (4.330 * age);

            double multiplier = activityLevel switch
            {
                "sedentary" => 1.2,
                "light" => 1.375,
                "moderate" => 1.55,
                "active" => 1.725,
                "very_active" => 1.9,
                _ => 1.55
            };

            var tdee = bmr * multiplier;

            return $"""
                === TDEE CALCULATION ===
                BMR: {bmr:F0} kcal/day
                TDEE (maintenance): {tdee:F0} kcal/day
                Weight loss (-500 kcal): {tdee - 500:F0} kcal/day
                Muscle gain (+300 kcal): {tdee + 300:F0} kcal/day
                """;
        }

        [KernelFunction("calculate_bmi")]
        [Description("""
            Calculate BMI (Body Mass Index).
            Use when user asks about: BMI, body mass index,
            am I overweight, healthy weight range.
            """)]
        public string CalculateBmi(
            [Description("Body weight in kilograms")] double weightKg,
            [Description("Height in centimeters")] double heightCm)
        {
            var heightM = heightCm / 100.0;
            var bmi = weightKg / (heightM * heightM);

            var category = bmi switch
            {
                < 18.5 => "Underweight (Thiếu cân)",
                < 25.0 => "Normal weight (Bình thường)",
                < 30.0 => "Overweight (Thừa cân)",
                _ => "Obese (Béo phì)"
            };

            return $"""
                === BMI CALCULATION ===
                BMI: {bmi:F1}
                Category: {category}
                Healthy range for your height: {18.5 * heightM * heightM:F1}kg - {24.9 * heightM * heightM:F1}kg
                """;
        }
    }
}
