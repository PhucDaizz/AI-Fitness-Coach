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
    public class ExerciseCsvSeeder : IDataSeeder
    {
        private readonly IApplicationDbContext _context;
        private readonly ILogger<ExerciseCsvSeeder> _logger;

        public int Order => 2; 

        public ExerciseCsvSeeder(IApplicationDbContext context, ILogger<ExerciseCsvSeeder> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task SeedAsync()
        {
            try
            {
                if (await _context.Exercises.AnyAsync())
                {
                    _logger.LogInformation("Du lieu Bai tap da ton tai. Bo qua doc CSV.");
                    return;
                }

                var csvPath = Path.Combine(AppContext.BaseDirectory, "Data", "SeedFiles", "exercises.csv");

                if (!File.Exists(csvPath))
                {
                    _logger.LogWarning($"Khong tim thay file CSV tai duong dan: {csvPath}");
                    return;
                }

                _logger.LogInformation("Bat dau doc file CSV va bom du lieu Bai tap...");

                var muscleDict = await _context.MuscleGroups
                    .ToDictionaryAsync(m => m.NameEN.ToLower().Trim());

                var equipmentDict = await _context.Equipments
                    .ToDictionaryAsync(e => e.Name.ToLower().Trim());

                var csvConfig = new CsvConfiguration(CultureInfo.InvariantCulture)
                {
                    HasHeaderRecord = true,
                    MissingFieldFound = null,
                    HeaderValidated = null,
                    BadDataFound = null
                };

                using var reader = new StreamReader(csvPath);
                using var csv = new CsvReader(reader, csvConfig);

                var records = csv.GetRecords<ExerciseCsvRecord>().ToList();
                var exercisesToInsert = new List<Exercise>();

                foreach (var record in records)
                {
                    if (!Enum.TryParse<DescriptionSource>(record.description_source, true, out var sourceEnum))
                    {
                        sourceEnum = DescriptionSource.wger;
                    }

                    var exercise = Exercise.Create(
                        id: record.id,
                        uuId: string.IsNullOrWhiteSpace(record.uuid) ? null : Guid.Parse(record.uuid),
                        name: record.name,
                        description: record.description,
                        source: sourceEnum
                    );

                    // 1. Gan Category
                    exercise.SetCategory(record.category_id);

                    // 2. Gan Image (Xu ly cot is_front_image dang "1" hoac "true")
                    bool isFront = record.is_front_image == "1" || record.is_front_image?.ToLower() == "true";
                    exercise.SetImages(record.image_url, record.image_thumbnail_url, isFront);

                    // 3. Gan Embed Status (Neu co trong CSV, khong thi lay mac dinh luc Create)
                    if (Enum.TryParse<EmbedStatus>(record.embed_status, true, out var embedStatus))
                    {
                        exercise.UpdateEmbedStatus(embedStatus);
                    }

                    // Xu ly Co chinh (Parse chuoi JSON va do ID)
                    var primaryMuscles = ParseJsonStringArray(record.muscles_primary);
                    foreach (var muscleName in primaryMuscles)
                    {
                        if (muscleDict.TryGetValue(muscleName.ToLower().Trim(), out var muscle))
                        {
                            exercise.AddMuscle(muscle.Id, isPrimary: true);
                        }
                    }

                    // Xu ly Co phu
                    var secondaryMuscles = ParseJsonStringArray(record.muscles_secondary);
                    foreach (var muscleName in secondaryMuscles)
                    {
                        if (muscleDict.TryGetValue(muscleName.ToLower().Trim(), out var muscle))
                        {
                            exercise.AddMuscle(muscle.Id, isPrimary: false);
                        }
                    }

                    // Xu ly Dung cu, loai tap o dau 
                    var equipmentList = ParseJsonStringArray(record.equipment_list);
                    var locationTypes = ClassifyLocation(record.name, equipmentList);
                    exercise.SetLocationTypes(locationTypes);

                    foreach (var eqName in equipmentList)
                    {
                        if (equipmentDict.TryGetValue(eqName.ToLower().Trim(), out var equipment))
                        {
                            exercise.AddEquipment(equipment);
                        }
                    }

                    exercisesToInsert.Add(exercise);
                }

                // 8. Luu vao Database 
                _logger.LogInformation($"Chuan bi Insert {exercisesToInsert.Count} bai tap...");

                ((DbContext)_context).Set<Exercise>().AddRange(exercisesToInsert);
                await ((DbContext)_context).SaveChangesAsync();

                _logger.LogInformation("Bom du lieu Bai tap tu CSV thanh cong!");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Loi trong qua trinh Seed file CSV Bai tap!");
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

        // Ham phan loai dia diem tap dua tren ten va thiet bi
        private List<string> ClassifyLocation(string name, List<string> equipmentList)
        {
            var locations = new HashSet<string>();
            var nameLower = name.ToLower();

            var gymEquipment = new[] { "machine", "cable", "barbell", "sz-bar", "bench" };
            var flexibleEquipment = new[] { "dumbbell", "kettlebell", "swiss ball", "resistance band", "gym mat", "pull-up bar" };

            if ((nameLower.Contains("run") || nameLower.Contains("sprint") || nameLower.Contains("jog") || nameLower.Contains("walk"))
                && !nameLower.Contains("treadmill"))
            {
                return new List<string> { "Outdoor", "Home", "Gym" };
            }

            var eqLower = equipmentList.Select(e => e.ToLower()).ToList();

            bool requiresGym = eqLower.Any(e => gymEquipment.Contains(e));
            bool hasFlexible = eqLower.Any(e => flexibleEquipment.Contains(e));

            if (requiresGym)
            {
                locations.Add("Gym");
            }
            else if (hasFlexible)
            {
                locations.Add("Home");
                locations.Add("Gym");
            }
            else if (eqLower.Count == 0 || (eqLower.Count == 1 && (eqLower[0] == "bodyweight" || eqLower[0] == "gym mat")))
            {
                locations.Add("Home");
                locations.Add("Outdoor");
                locations.Add("Gym");
            }

            if (locations.Count == 0)
            {
                locations.Add("Gym");
            }

            return locations.ToList();
        }

        public class ExerciseCsvRecord
        {
            public int id { get; set; }
            public string? uuid { get; set; }
            public string name { get; set; } = null!;
            public string? description { get; set; }
            public string? description_source { get; set; }

            public int? category_id { get; set; }
            public string? category_name { get; set; }

            // Cac cot JSON
            public string? muscles_primary { get; set; }
            public string? muscles_secondary { get; set; }
            public string? equipment_list { get; set; }

            public string? image_url { get; set; }
            public string? image_thumbnail_url { get; set; }
            public string? is_front_image { get; set; }
            public string? embed_status { get; set; }
        }
    }
}