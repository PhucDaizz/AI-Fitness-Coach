using AIService.Application.Common.Interfaces;
using AIService.Domain.Entities;
using AIService.Domain.Enum;
using CsvHelper;
using CsvHelper.Configuration;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Globalization;
using System.Text.Json;

namespace AIService.Infrastructure.Data.Seeders
{
    public class MealCsvSeeder : IDataSeeder
    {
        private readonly IApplicationDbContext _context;
        private readonly ILogger<MealCsvSeeder> _logger;

        public int Order => 3; 

        public MealCsvSeeder(IApplicationDbContext context, ILogger<MealCsvSeeder> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task SeedAsync()
        {
            try
            {
                if (await _context.Meals.AnyAsync())
                {
                    _logger.LogInformation("Du lieu do an (Meals) da ton tai. Bo qua doc CSV.");
                    return;
                }

                var csvPath = Path.Combine(AppContext.BaseDirectory, "Data", "SeedFiles", "meals.csv");

                if (!File.Exists(csvPath))
                {
                    _logger.LogWarning($"Khong tim thay file CSV tai: {csvPath}");
                    return;
                }

                _logger.LogInformation("Bat dau doc file CSV va bom du lieu do an...");

                var csvConfig = new CsvConfiguration(CultureInfo.InvariantCulture)
                {
                    HasHeaderRecord = true,
                    MissingFieldFound = null,
                    HeaderValidated = null,
                    BadDataFound = null
                };

                using var reader = new StreamReader(csvPath);
                using var csv = new CsvReader(reader, csvConfig);

                var records = csv.GetRecords<MealCsvRecord>().ToList();
                var mealsToInsert = new List<Meal>();

                foreach (var record in records)
                {
                    var meal = Meal.Create(
                        name: record.name,
                        calories: record.calories,
                        protein: record.protein,
                        carbs: record.carbs,
                        fat: record.fat
                    );

                    meal.SetDetails(record.description, record.cuisine_type, record.image_url);

                    var tags = ParseJsonStringArray(record.diet_tags);
                    meal.SetDietTags(tags);

                    if (Enum.TryParse<EmbedStatus>(record.embed_status, true, out var embedStatus))
                    {
                        meal.UpdateEmbedStatus(embedStatus);
                    }

                    mealsToInsert.Add(meal);
                }

                _logger.LogInformation($"Chuan bi Insert {mealsToInsert.Count} mon an...");

                ((DbContext)_context).Set<Meal>().AddRange(mealsToInsert);
                await ((DbContext)_context).SaveChangesAsync();

                _logger.LogInformation("Bom du lieu do an thanh cong");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Loi luc doc file csv do an");
                throw;
            }
        }

        private List<string> ParseJsonStringArray(string? jsonString)
        {
            if (string.IsNullOrWhiteSpace(jsonString) || jsonString == "[]")
                return new List<string>();

            try
            {
                return JsonSerializer.Deserialize<List<string>>(jsonString) ?? new List<string>();
            }
            catch
            {
                return new List<string>();
            }
        }

        // Mapping với file CSV
        public class MealCsvRecord
        {
            public string name { get; set; } = null!;
            public string? cuisine_type { get; set; }
            public int calories { get; set; }
            public float protein { get; set; }
            public float carbs { get; set; }
            public float fat { get; set; }
            public string? diet_tags { get; set; } // Chứa JSON string
            public string? description { get; set; }
            public string? embed_status { get; set; }
            public string? image_url { get; set; }
        }
    }
}
