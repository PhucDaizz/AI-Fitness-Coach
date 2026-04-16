namespace AIService.Infrastructure.Data.Seeders
{
    public interface IDataSeeder
    {
        int Order { get; }
        Task SeedAsync();
    }
}
