using AIService.Domain.Entities;
using Infrastructure.Data.Configurations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AIService.Infrastructure.Data.Configurations
{
    public class MuscleGroupConfiguration : BaseEntityConfiguration<MuscleGroup, int>
    {
        public override void Configure(EntityTypeBuilder<MuscleGroup> builder)
        {
            base.Configure(builder);

            builder.ToTable("muscle_groups");

            builder.Property(e => e.Id)
                .HasColumnName("id")
                .IsRequired()
                .ValueGeneratedNever(); ;

            builder.Property(m => m.NameEN)
                   .HasColumnName("name_en")
                   .HasMaxLength(100)
                   .IsRequired();

            builder.Property(m => m.NameVN)
                   .HasColumnName("name_vn")
                   .HasMaxLength(100);

            builder.Property(m => m.IsFront)
                   .HasColumnName("is_front")
                   .HasDefaultValue(true);
        }
    }
}