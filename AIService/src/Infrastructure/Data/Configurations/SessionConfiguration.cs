using AIService.Domain.Entities;
using Infrastructure.Data.Configurations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AIService.Infrastructure.Data.Configurations
{
    public class SessionConfiguration : BaseEntityConfiguration<Session, Guid>
    {
        public override void Configure(EntityTypeBuilder<Session> builder)
        {
            base.Configure(builder);

            builder.ToTable("sessions");

            builder.Property(e => e.Id)
                .IsRequired()
                .ValueGeneratedNever();

            builder.Property(s => s.Title)
                .HasMaxLength(255)
                .IsRequired(false);

            builder.Property(s => s.UserId)
                .IsRequired()
                .HasMaxLength(100);

            builder.HasMany(s => s.Messages)
                .WithOne() 
                .HasForeignKey(m => m.SessionId)
                .OnDelete(DeleteBehavior.Cascade);
            
            builder.Metadata.FindNavigation(nameof(Session.Messages))!
                .SetPropertyAccessMode(PropertyAccessMode.Field);
        }
    }
}
