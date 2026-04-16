using AIService.Domain.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations
{
    public abstract class BaseEntityConfiguration<TEntity, TId> : IEntityTypeConfiguration<TEntity>
        where TEntity : BaseEntity<TId>
    {
        public virtual void Configure(EntityTypeBuilder<TEntity> builder)
        {
            builder.HasKey(e => e.Id);

            builder.Property(e => e.CreatedAt)
                   .IsRequired();

            builder.Property(e => e.UpdatedAt)
                   .IsRequired(false);

            builder.Property(e => e.CreatedBy)
                   .HasMaxLength(450)
                   .IsRequired(false);

            builder.Property(e => e.UpdatedBy)
                   .HasMaxLength(450)
                   .IsRequired(false);

            builder.Ignore(e => e.DomainEvents);
        }
    }
}
