using AIService.Application.Common.Interfaces;
using AIService.Application.Common.Models;
using AIService.Domain.Repositories;
using AIService.Infrastructure.Data.Repositories;
using AIService.Infrastructure.Data.Seeders;
using AIService.Infrastructure.Services;
using AIService.Infrastructure.Settings;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.VectorData;
using Microsoft.SemanticKernel;
using Qdrant.Client;

namespace AIService.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            services.Configure<QdrantSettings>(configuration.GetSection("Qdrant"));
            services.Configure<OllamaSettings>(configuration.GetSection("Ollama"));
            services.Configure<OpenAiSettings>(configuration.GetSection("OpenAI"));
            services.Configure<OpenRouterSettings>(configuration.GetSection("OpenRouter"));

            services.AddDbContext<ApplicationDbContext>(options =>
               options.UseMySql(
                   configuration.GetConnectionString("DefaultConnection"),
                   new MySqlServerVersion(new Version(8, 0, 21)),
                   b => b.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName)));

            services.Scan(scan => scan
                .FromAssembliesOf(typeof(IDataSeeder))
                .AddClasses(classes => classes.AssignableTo<IDataSeeder>())
                .AsImplementedInterfaces()
                .WithScopedLifetime());

            // CẤU HÌNH SEMANTIC KERNEL & AI PROVIDER
            var kernelBuilder = services.AddKernel();
            var aiProvider = configuration["AI_Provider"] ?? "Ollama";
            if (aiProvider.Equals("OpenAI", StringComparison.OrdinalIgnoreCase))
            {
                var openAiConfig = configuration.GetSection("OpenAI").Get<OpenAiSettings>()!;
                kernelBuilder.AddOpenAITextEmbeddingGeneration(
                    modelId: openAiConfig.EmbeddingModel,
                    apiKey: openAiConfig.ApiKey);
            }
            else
            {
                var ollamaConfig = configuration.GetSection("Ollama").Get<OllamaSettings>()!;
                kernelBuilder.AddOllamaTextEmbeddingGeneration(
                    modelId: ollamaConfig.Model,
                    endpoint: new Uri(ollamaConfig.Url));

                // dùng openroute 
                var openRouterConfig = configuration.GetSection("OpenRouter").Get<OpenRouterSettings>()!;
                var openRouterClient = new HttpClient();
                openRouterClient.DefaultRequestHeaders.Add("HTTP-Referer", "http://localhost:5000");
                openRouterClient.DefaultRequestHeaders.Add("X-Title", "AI Fitness System");

                kernelBuilder.AddOpenAIChatCompletion(
                    modelId: openRouterConfig.Model, 
                    apiKey: openRouterConfig.ApiKey,
                    endpoint: new Uri("https://openrouter.ai/api/v1"), 
                    httpClient: openRouterClient);

                /*kernelBuilder.AddOllamaChatCompletion(
                    modelId: "qwen3:1.7b",
                    endpoint: new Uri(ollamaConfig.Url));*/
            }

            // CẤU HÌNH QDRANT & VECTOR STORE
            services.AddSingleton<IQdrantService, QdrantService>();

            services.AddSingleton<QdrantClient>(sp =>
            {
                var s = configuration.GetSection("Qdrant").Get<QdrantSettings>()!;
                return new QdrantClient(
                    host: s.Host,
                    port: s.Port,
                    https: s.Https,
                    apiKey: string.IsNullOrEmpty(s.ApiKey) ? null : s.ApiKey);
            });
            services.AddQdrantVectorStore();

            // Đăng ký Collection Món ăn

            services.AddTransient<VectorStoreCollection<Guid, MealVectorRecord>>(sp =>
            {
                var vectorStore = sp.GetRequiredService<VectorStore>();
                return vectorStore.GetCollection<Guid, MealVectorRecord>("meals"); 
            });

            // Đăng ký Collection Bài tập
            services.AddTransient<VectorStoreCollection<Guid, ExerciseVectorRecord>>(sp =>
            {
                var vectorStore = sp.GetRequiredService<VectorStore>();
                return vectorStore.GetCollection<Guid, ExerciseVectorRecord>("exercises"); 
            });


            services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<ApplicationDbContext>());

            services.AddScoped<DataSeederCoordinator>();
            services.AddScoped<IUnitOfWork, UnitOfWork>();

            services.AddScoped<IEquipmentRepository, EquipmentRepository>();
            services.AddScoped<IExerciseCategoryRepository, ExerciseCategoryRepository>();
            services.AddScoped<IExerciseRepository, ExerciseRepository>();
            services.AddScoped<IMealRepository, MealRepository>();
            services.AddScoped<IMuscleGroupRepository, MuscleGroupRepository>();

            services.AddScoped<ICurrentUserService, CurrentUserService>();
            services.AddScoped<IDomainEventService, DomainEventService>();
            services.AddScoped<IIntegrationEventService, IntegrationEventService>();

            return services;
        }
    }
}
