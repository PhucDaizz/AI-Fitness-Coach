using AIService.Domain.Entities;
using Infrastructure.Data.Configurations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AIService.Infrastructure.Data.Configurations
{
    public class TokenDailyStatConfiguration : BaseEntityConfiguration<TokenDailyStat, Guid>
    {
        public override void Configure(EntityTypeBuilder<TokenDailyStat> builder)
        {
            base.Configure(builder);

            builder.ToTable("token_daily_stats");

            builder.HasIndex(x => x.Date).IsUnique();
        }
    }
}
