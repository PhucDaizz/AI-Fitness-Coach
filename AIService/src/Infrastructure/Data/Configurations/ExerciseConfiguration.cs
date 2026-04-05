using AIService.Domain.Entities;
using Infrastructure.Data.Configurations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AIService.Infrastructure.Data.Configurations
{
    public class ExerciseConfiguration : BaseEntityConfiguration<Exercise, int>
    {
        public override void Configure(EntityTypeBuilder<Exercise> builder)
        {
            base.Configure(builder);
            builder.ToTable("exercises");

            builder.Property(e => e.Id)
                .HasColumnName("id")
                .IsRequired()
                .ValueGeneratedOnAdd();

            builder.Property(e => e.UUId).HasColumnName("uuid").IsRequired();
            builder.Property(e => e.Name).HasMaxLength(200).IsRequired();
            builder.Property(e => e.Description).HasColumnType("text");
            builder.Property(e => e.DescriptionSource).HasConversion<string>();
            builder.Property(e => e.EmbedStatus).HasConversion<string>();

            builder.Property(e => e.LocationType).HasColumnType("json");

            builder.Ignore(e => e.PrimaryMuscles);
            builder.Ignore(e => e.SecondaryMuscles);

            builder.HasOne(e => e.Category)
                .WithMany()
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.SetNull);

            // Quan hệ N-N với Equipment (exercise_equipment)
            builder.HasMany(e => e.Equipments)
                .WithMany()
                .UsingEntity(
                    "exercise_equipment",
                    l => l.HasOne(typeof(Equipment)).WithMany().HasForeignKey("equipment_id"),
                    r => r.HasOne(typeof(Exercise)).WithMany().HasForeignKey("exercise_id")
                );
            builder.Navigation(e => e.Equipments).HasField("_equipments");

            builder.HasMany(e => e.ExerciseMuscles)
                 .WithOne(em => em.Exercise)
                 .HasForeignKey(em => em.ExerciseId)
                 .OnDelete(DeleteBehavior.Cascade);
            builder.Navigation(e => e.ExerciseMuscles).HasField("_exerciseMuscles");
        }
    }
}
