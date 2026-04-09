using AIService.Application.Common.Interfaces;
using AIService.Domain.Common;
using AIService.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AIService.Infrastructure
{
    public class ApplicationDbContext : DbContext, IApplicationDbContext
    {
        private readonly IDomainEventService _domainEventService;
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, IDomainEventService domainEventService) : base(options)
        {
            _domainEventService = domainEventService;
        }
        
        public DbSet<Equipment> EquipmentDbSet { get; set; }
        public DbSet<Exercise> ExerciseDbSet { get; set; }
        public DbSet<ExerciseCategory> ExerciseCategoryDbSet { get; set; }
        public DbSet<ExerciseMuscle> ExerciseMuscleDbSet { get; set; }
        public DbSet<MuscleGroup> MuscleGroupDbSet { get; set; }
        public DbSet<Meal> MealDbSet { get; set; }
        public DbSet<Message> MessageDbSet { get; set; }
        public DbSet<Session> SessionDbSet { get; set; }

        public IQueryable<Equipment> Equipments => EquipmentDbSet;
        public IQueryable<Exercise> Exercises => ExerciseDbSet;
        public IQueryable<ExerciseCategory> ExerciseCategories => ExerciseCategoryDbSet;
        public IQueryable<ExerciseMuscle> ExerciseMuscles => ExerciseMuscleDbSet;
        public IQueryable<MuscleGroup> MuscleGroups => MuscleGroupDbSet;
        public IQueryable<Meal> Meals => MealDbSet;
        public IQueryable<Message> Messages => MessageDbSet;
        public IQueryable<Session> Sessions => SessionDbSet;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // write your customizations here    
            base.OnModelCreating(modelBuilder);

            modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
        }

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            var domainEntities = ChangeTracker
                .Entries<IHasDomainEvent>()
                .Where(x => x.Entity.DomainEvents.Any())
                .Select(x => x.Entity)
                .ToList();

            var domainEvents = domainEntities
                .SelectMany(x => x.DomainEvents)
                .ToList();

            domainEntities.ForEach(entity => entity.ClearDomainEvents());

            var result = await base.SaveChangesAsync(cancellationToken);

            foreach (var domainEvent in domainEvents)
            {
                await _domainEventService.PublishAsync(domainEvent, cancellationToken);
            }

            return result;
        }
    }
}
