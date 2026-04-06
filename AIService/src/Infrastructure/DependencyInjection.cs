using AIService.Application.Common.Interfaces;
using AIService.Application.Common.Models;
using AIService.Domain.Repositories;
using AIService.Infrastructure.AI.Plugins;
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
            services.Configure<GoogleSettings>(configuration.GetSection("GoogleAI"));

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

            services.AddScoped<INutritionSearchService, NutritionSearchService>();
            services.AddScoped<IExerciseSearchService, ExerciseSearchService>();

            services.AddScoped<ExercisePlugin>();
            services.AddScoped<NutritionPlugin>();
            services.AddScoped<FitnessCalculatorPlugin>();


            // CẤU HÌNH SEMANTIC KERNEL & AI PROVIDER
            var kernelBuilder = services.AddKernel();
            var aiProvider = configuration["AI_Provider"] ?? "Ollama";

            kernelBuilder.Plugins.AddFromType<ExercisePlugin>("exercise");
            kernelBuilder.Plugins.AddFromType<NutritionPlugin>("nutrition");
            kernelBuilder.Plugins.AddFromType<FitnessCalculatorPlugin>("calculator");

            if (aiProvider.Equals("OpenAI", StringComparison.OrdinalIgnoreCase))
            {
                var openAiConfig = configuration.GetSection("OpenAI").Get<OpenAiSettings>()!;
                kernelBuilder.AddOpenAIChatCompletion(
                    modelId: openAiConfig.EmbeddingModel,
                    apiKey: openAiConfig.ApiKey);
            }
            else
            {
                var ollamaConfig = configuration.GetSection("Ollama").Get<OllamaSettings>()!;
                kernelBuilder.AddOllamaEmbeddingGenerator(
                    modelId: ollamaConfig.Model,
                    endpoint: new Uri(ollamaConfig.Url));

                // ĐĂNG KÝ AI LÀM PHIÊN DỊCH (Ollama - qwen2.5:0.5b)
                kernelBuilder.AddOllamaChatCompletion(
                    modelId: "qwen2.5:0.5b",       
                    endpoint: new Uri(ollamaConfig.Url),
                    serviceId: "fast_translator"); 

                #region Google

                var googleConfig = configuration.GetSection("GoogleAI").Get<GoogleSettings>()!;
                kernelBuilder.AddGoogleAIGeminiChatCompletion(
                    modelId: googleConfig.Model,
                    apiKey: googleConfig.ApiKey,
                    serviceId: "pt_brain");

                #endregion


                #region OpenRouter

                /*var openRouterConfig = configuration.GetSection("OpenRouter").Get<OpenRouterSettings>()!;
                var openRouterClient = new HttpClient();
                openRouterClient.DefaultRequestHeaders.Add("HTTP-Referer", "http://localhost:5000");
                openRouterClient.DefaultRequestHeaders.Add("X-Title", "AI Fitness System");

                kernelBuilder.AddOpenAIChatCompletion(
                    modelId: openRouterConfig.Model,
                    apiKey: openRouterConfig.ApiKey,
                    endpoint: new Uri("https://openrouter.ai/api/v1"),
                    httpClient: openRouterClient);*/

                #endregion

                #region Ollama

                /*kernelBuilder.AddOllamaChatCompletion(
                    modelId: "qwen3:1.7b",
                    endpoint: new Uri(ollamaConfig.Url));*/

                #endregion
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
