namespace API.StartUp
{
    public static class DependenciesConfig
    {
        public static void AddDependencies(this WebApplicationBuilder builder)
        {
            builder.Services.AddControllers();
            builder.Services.AddSwaggerServices();
        }
    }
}
