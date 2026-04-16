using AIService.Domain.Entities;
using Infrastructure.Data.Configurations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AIService.Infrastructure.Data.Configurations
{
    public class ExerciseCategoryConfiguration : BaseEntityConfiguration<ExerciseCategory, int>
    {
        public override void Configure(EntityTypeBuilder<ExerciseCategory> builder)
        {
            base.Configure(builder);
            builder.ToTable("exercise_categories");
            builder.Property(e => e.Id)
                .HasColumnName("id")
                .IsRequired()
                .ValueGeneratedOnAdd();

            builder.Property(c => c.Name).HasMaxLength(100).IsRequired();
            builder.Property(c => c.NameVN).HasColumnName("name_vn").HasMaxLength(100);

            builder.HasIndex(c => c.Id).IsUnique();
        }
    }
}
