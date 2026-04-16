using AIService.Application.Common.Interfaces;
using AIService.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AIService.Infrastructure.Data.Seeders
{
    public class ExerciseLookupSeeder : IDataSeeder
    {
        private readonly IApplicationDbContext _context;
        private readonly ILogger<ExerciseLookupSeeder> _logger;

        public int Order => 1; 

        public ExerciseLookupSeeder(IApplicationDbContext context, ILogger<ExerciseLookupSeeder> logger)
        {
            _context = context;
            _logger = logger;
        }
        public async Task SeedAsync()
        {
            try
            {
                if (_context is DbContext dbContext)
                {
                    if (dbContext.Database.IsRelational())
                    {
                        await dbContext.Database.MigrateAsync();
                    }
                }

                _logger.LogInformation("Bat dau kiem tra và bom du lieu khoi tao...");

                if (!await _context.MuscleGroups.AnyAsync())
                {
                    _logger.LogInformation("Dang bom du lieu nhom co (Muscle Groups)...");
                    var muscles = new List<MuscleGroup>
                    {
                        MuscleGroup.Create(1, "Biceps brachii", true, "Tay trước (Biceps)"),
                        MuscleGroup.Create(2, "Anterior deltoid", true, "Vai trước"),
                        MuscleGroup.Create(3, "Serratus anterior", true, "Răng cưa trước"),
                        MuscleGroup.Create(4, "Pectoralis major", true, "Ngực (Pecs)"),
                        MuscleGroup.Create(5, "Triceps brachii", false, "Tay sau (Triceps)"),
                        MuscleGroup.Create(6, "Posterior deltoid", false, "Vai sau"),
                        MuscleGroup.Create(7, "Latissimus dorsi", false, "Lưng xô (Lats)"),
                        MuscleGroup.Create(8, "Gluteus maximus", false, "Mông (Glutes)"),
                        MuscleGroup.Create(9, "Quadriceps femoris", true, "Đùi trước (Quads)"),
                        MuscleGroup.Create(10, "Gastrocnemius", false, "Bắp chân (Calves)"),
                        MuscleGroup.Create(11, "Hamstrings", false, "Đùi sau (Hamstrings)"),
                        MuscleGroup.Create(12, "Soleus", false, "Cơ dép (Soleus)"),
                        MuscleGroup.Create(13, "Trapezius", false, "Cơ thang (Traps)"),
                        MuscleGroup.Create(14, "Rectus abdominis", true, "Cơ bụng (Abs)"),
                        MuscleGroup.Create(15, "Obliques", true, "Cơ hông (Obliques)")
                    };
                    ((DbContext)_context).Set<MuscleGroup>().AddRange(muscles);
                }

                if (!await _context.Equipments.AnyAsync())
                {
                    _logger.LogInformation("Dang bom du lieu dung cu (Equipment)...");
                    var equipments = new List<Equipment>
                    {
                        Equipment.Create(1, "Barbell", "Tạ đòn"),
                        Equipment.Create(2, "SZ-Bar", "Tạ đòn cong"),
                        Equipment.Create(3, "Dumbbell", "Tạ đơn"),
                        Equipment.Create(4, "Gym mat", "Thảm tập"),
                        Equipment.Create(5, "Swiss ball", "Bóng tập"),
                        Equipment.Create(6, "Pull-up bar", "Xà đơn"),
                        Equipment.Create(7, "Cable", "Cáp ròng rọc"),
                        Equipment.Create(8, "Bench", "Ghế tập"),
                        Equipment.Create(9, "Machine", "Máy tập"),
                        Equipment.Create(10, "Kettlebell", "Tạ bình"),
                        Equipment.Create(11, "Bodyweight", "Không dụng cụ"),
                        Equipment.Create(12, "Resistance band", "Dây kháng lực"),
                        Equipment.Create(13, "Other", "Khác")
                    };
                    ((DbContext)_context).Set<Equipment>().AddRange(equipments);
                }

                if (!await _context.ExerciseCategories.AnyAsync())
                {
                    _logger.LogInformation("Dang bom du lieu danh muc bai tap (Categories)...");
                    var categories = new List<ExerciseCategory>
                    {
                        ExerciseCategory.Create(8, "Arms", "Tay"),
                        ExerciseCategory.Create(9, "Legs", "Chân"),
                        ExerciseCategory.Create(10, "Abs", "Bụng / Core"),
                        ExerciseCategory.Create(11, "Chest", "Ngực"),
                        ExerciseCategory.Create(12, "Back", "Lưng"),
                        ExerciseCategory.Create(13, "Shoulders", "Vai"),
                        ExerciseCategory.Create(14, "Calves", "Bắp chân"),
                        ExerciseCategory.Create(15, "Glutes", "Mông")
                    };
                    ((DbContext)_context).Set<ExerciseCategory>().AddRange(categories);
                }

                await _context.SaveChangesAsync();
                _logger.LogInformation("Bom du lieu thanh cong");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Co loi xay ra luc bom du lieu");
                throw;
            }
        }
    }
}
