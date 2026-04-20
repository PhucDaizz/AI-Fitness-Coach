using AIService.Domain.Entities;
using Infrastructure.Data.Configurations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking; 
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System.Text.Json;

namespace AIService.Infrastructure.Data.Configurations
{
    public class MealConfiguration : BaseEntityConfiguration<Meal, int>
    {
        public override void Configure(EntityTypeBuilder<Meal> builder)
        {
            base.Configure(builder);

            builder.ToTable("meals");

            builder.Property(e => e.Id).HasColumnName("id");

            builder.Property(m => m.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
            builder.Property(m => m.Description).HasColumnName("description").HasColumnType("text");

            builder.Property(m => m.Calories).HasColumnName("calories").IsRequired();
            builder.Property(m => m.Protein).HasColumnName("protein").IsRequired();
            builder.Property(m => m.Carbs).HasColumnName("carbs").IsRequired();
            builder.Property(m => m.Fat).HasColumnName("fat").IsRequired();

            builder.Property(m => m.CuisineType).HasColumnName("cuisine_type").HasMaxLength(100);
            builder.Property(m => m.ImageUrl).HasColumnName("image_url").HasMaxLength(500);

            var stringListComparer = new ValueComparer<List<string>>(
                (c1, c2) => c1.SequenceEqual(c2),
                c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
                c => c.ToList());

            builder.Property(m => m.DietTags)
                   .HasColumnName("diet_tags")
                   .HasColumnType("json"); 

            builder.Property(m => m.EmbedStatus)
                   .HasColumnName("embed_status")
                   .HasConversion<string>();
        }
    }
}