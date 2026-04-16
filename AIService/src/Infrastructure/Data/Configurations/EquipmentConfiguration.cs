using AIService.Domain.Entities;
using Infrastructure.Data.Configurations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AIService.Infrastructure.Data.Configurations
{
    public class EquipmentConfiguration : BaseEntityConfiguration<Equipment, int>
    {
        public override void Configure(EntityTypeBuilder<Equipment> builder)
        {
            base.Configure(builder);
            builder.ToTable("equipment");

            builder.Property(e => e.Id)
                .HasColumnName("id")
                .IsRequired()
                .ValueGeneratedOnAdd();

            builder.Property(e => e.Name).HasColumnName("name").HasMaxLength(100).IsRequired();
            builder.Property(e => e.NameVN).HasColumnName("name_vn").HasMaxLength(100);

            builder.HasIndex(e => e.Id).IsUnique();
        }
    }
}
