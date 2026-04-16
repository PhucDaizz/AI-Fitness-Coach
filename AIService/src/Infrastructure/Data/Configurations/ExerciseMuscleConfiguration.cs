using AIService.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AIService.Infrastructure.Data.Configurations
{
    public class ExerciseMuscleConfiguration : IEntityTypeConfiguration<ExerciseMuscle>
    {
        public void Configure(EntityTypeBuilder<ExerciseMuscle> builder)
        {
            builder.ToTable("exercise_muscles");

            builder.HasKey(em => new { em.ExerciseId, em.MuscleId, em.IsPrimary });

            builder.Property(em => em.ExerciseId).HasColumnName("exercise_id");
            builder.Property(em => em.MuscleId).HasColumnName("muscle_id");
            builder.Property(em => em.IsPrimary).HasColumnName("is_primary");

            builder.HasOne(em => em.MuscleGroup)
                .WithMany()
                .HasForeignKey(em => em.MuscleId);
        }
    }
}
