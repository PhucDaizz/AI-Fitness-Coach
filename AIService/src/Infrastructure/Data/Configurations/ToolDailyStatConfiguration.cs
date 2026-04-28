using AIService.Domain.Entities;
using Infrastructure.Data.Configurations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AIService.Infrastructure.Data.Configurations
{
    public class ToolDailyStatConfiguration : BaseEntityConfiguration<ToolDailyStat, Guid>
    {
        public override void Configure(EntityTypeBuilder<ToolDailyStat> builder)
        {
            base.Configure(builder);


            builder.ToTable("tool_daily_stats");

            builder.Property(x => x.Date)
                .IsRequired();

            builder.Property(x => x.ToolName)
                .IsRequired()
                .HasMaxLength(100); 

            builder.Property(x => x.UsageCount)
                .IsRequired();

            builder.HasIndex(x => new { x.Date, x.ToolName })
                .IsUnique();
        }
    }
}
