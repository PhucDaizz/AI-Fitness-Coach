using AIService.Domain.Entities;
using Infrastructure.Data.Configurations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AIService.Infrastructure.Data.Configurations
{
    public class MessageConfiguration : BaseEntityConfiguration<Message, Guid>
    {
        public override void Configure(EntityTypeBuilder<Message> builder)
        {
            base.Configure(builder);

            builder.ToTable("messages");

            builder.Property(m => m.Id)
                .IsRequired()
                .ValueGeneratedNever();

            builder.Property(m => m.SessionId)
                .IsRequired();

            builder.Property(m => m.Content)
                .HasColumnType("text")
                .IsRequired();

            
            builder.Property(m => m.Role)
                .HasConversion<string>()
                .HasMaxLength(50)
                .IsRequired();

            builder.Property(m => m.PromptTokens).IsRequired(false);
            builder.Property(m => m.CompletionTokens).IsRequired(false);
            builder.Property(m => m.TotalTokens).IsRequired(false);

            builder.HasIndex(m => new { m.CreatedAt, m.TotalTokens, m.PromptTokens, m.CompletionTokens });
        }
    }
}
