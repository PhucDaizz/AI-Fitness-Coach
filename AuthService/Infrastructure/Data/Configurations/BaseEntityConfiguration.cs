using Domain.Common.Domain.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations
{
    public abstract class BaseEntityConfiguration<T> : IEntityTypeConfiguration<T>
        where T : BaseEntity
    {
        public virtual void Configure(EntityTypeBuilder<T> builder)
        {
            builder.HasKey(e => e.Id);

            builder.Property(e => e.Id)
                   .ValueGeneratedNever();

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
