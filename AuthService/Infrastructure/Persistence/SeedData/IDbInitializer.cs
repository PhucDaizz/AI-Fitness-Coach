namespace Infrastructure.Persistence.SeedData
{
    public interface IDbInitializer
    {
        Task SeedAsync();
    }
}
