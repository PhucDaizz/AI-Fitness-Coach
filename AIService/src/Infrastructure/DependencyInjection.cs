using AIService.Application.Common.Interfaces;
using AIService.Application.Common.Models;
using AIService.Domain.Repositories;
using AIService.Infrastructure.AI.Filters;
using AIService.Infrastructure.AI.Orchestrators;
using AIService.Infrastructure.AI.Plugins;
using AIService.Infrastructure.BackgroundJobs;
using AIService.Infrastructure.Data.Repositories;
using AIService.Infrastructure.Data.Seeders;
using AIService.Infrastructure.ExternalServices;
using AIService.Infrastructure.Services;
using AIService.Infrastructure.Settings;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.VectorData;
using Microsoft.SemanticKernel;
using Qdrant.Client;
using StackExchange.Redis;

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

            services.AddSignalR();

            services.AddDbContext<ApplicationDbContext>(options =>
               options.UseMySql(
                   configuration.GetConnectionString("DefaultConnection"),
                   new MySqlServerVersion(new Version(8, 0, 21)),
                   b => {
                       b.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName);
                       b.UseNewtonsoftJson(); 
                   }));

            var redisConnectionString = configuration.GetConnectionString("Redis") ?? "localhost:6379";
            services.AddSingleton<IConnectionMultiplexer>(ConnectionMultiplexer.Connect(redisConnectionString));

            services.Scan(scan => scan
                .FromAssembliesOf(typeof(IDataSeeder))
                .AddClasses(classes => classes.AssignableTo<IDataSeeder>())
                .AsImplementedInterfaces()
                .WithScopedLifetime());


            services.AddTransient<TokenForwardingHandler>();
            services.AddHttpClient("WorkoutService", client =>
            {
                client.BaseAddress = new Uri(configuration["NodeService:BaseUrl"] ?? "http://localhost:7003");
                client.Timeout = TimeSpan.FromSeconds(30);
            })
            .AddHttpMessageHandler<TokenForwardingHandler>();

            services.AddScoped<INutritionSearchService, NutritionSearchService>();
            services.AddScoped<IExerciseSearchService, ExerciseSearchService>();
            services.AddScoped<IWorkoutIntegrationService, WorkoutIntegrationService>();

            services.AddScoped<ExercisePlugin>();
            services.AddScoped<NutritionPlugin>();
            services.AddScoped<FitnessCalculatorPlugin>();
            services.AddScoped<WorkoutManagerPlugin>();
            //services.AddScoped<WorkoutPlanPlugin>();   -- Thời gian xử lý phức tạp, không phù hợp làm plugin, sẽ gọi trực tiếp trong Orchestrator

            // CẤU HÌNH SEMANTIC KERNEL & AI PROVIDER
            var kernelBuilder = services.AddKernel();
            var aiProvider = configuration["AI_Provider"] ?? "Ollama";

            kernelBuilder.Plugins.AddFromType<ExercisePlugin>("exercise");
            kernelBuilder.Plugins.AddFromType<NutritionPlugin>("nutrition");
            kernelBuilder.Plugins.AddFromType<FitnessCalculatorPlugin>("calculator");
            kernelBuilder.Plugins.AddFromType<WorkoutManagerPlugin>("workout_manager");
            //kernelBuilder.Plugins.AddFromType<WorkoutPlanPlugin>("workout_plan");   -- Thời gian xử lý phức tạp, không phù hợp làm plugin, sẽ gọi trực tiếp trong Orchestrator

            kernelBuilder.Services.AddSingleton<IFunctionInvocationFilter, ToolUsageTrackingFilter>();

            var handler = new HttpClientHandler();
            var httpClient = new HttpClient(handler)
            {
                Timeout = TimeSpan.FromMinutes(15)
            };


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
                /*kernelBuilder.AddOllamaChatCompletion(
                    modelId: "qwen2.5:0.5b",       
                    endpoint: new Uri(ollamaConfig.Url),
                    serviceId: "fast_translator"); */

                #region Google

                var googleConfig = configuration.GetSection("GoogleAI").Get<GoogleSettings>()!;
                kernelBuilder.AddGoogleAIGeminiChatCompletion(
                    modelId: googleConfig.Model,
                    apiKey: googleConfig.ApiKey,
                    serviceId: "pt_plant",
                    httpClient: httpClient);

                kernelBuilder.AddGoogleAIGeminiChatCompletion(
                    modelId: "gemma-4-26b-a4b-it",
                    apiKey: googleConfig.ApiKey,
                    serviceId: "fast_translator",
                    httpClient: httpClient);

                #endregion


                #region OpenRouter

                var openRouterConfig = configuration.GetSection("OpenRouter").Get<OpenRouterSettings>()!;
                var openRouterClient = new HttpClient();
                openRouterClient.DefaultRequestHeaders.Add("HTTP-Referer", "http://localhost:5000");
                openRouterClient.DefaultRequestHeaders.Add("X-Title", "AI Fitness System");

                kernelBuilder.AddOpenAIChatCompletion(
                    modelId: openRouterConfig.Model,
                    apiKey: openRouterConfig.ApiKey,
                    endpoint: new Uri("https://openrouter.ai/api/v1"),
                    httpClient: openRouterClient,
                    serviceId: "pt_brain");

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

            // Đăng ký Collection Tin nhắn chat
            services.AddTransient<VectorStoreCollection<Guid, ChatMessageVectorRecord>>(sp =>
            {
                var vectorStore = sp.GetRequiredService<VectorStore>();
                return vectorStore.GetCollection<Guid, ChatMessageVectorRecord>("chat_messages"); 
            });

            services.AddTransient<IDatabase>(sp =>
            {
                var multiplexer = sp.GetRequiredService<IConnectionMultiplexer>();
                return multiplexer.GetDatabase();
            });

            services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<ApplicationDbContext>());

            services.AddScoped<DataSeederCoordinator>();
            services.AddScoped<IUnitOfWork, UnitOfWork>();

            services.AddScoped<IEquipmentRepository, EquipmentRepository>();
            services.AddScoped<IExerciseCategoryRepository, ExerciseCategoryRepository>();
            services.AddScoped<IExerciseRepository, ExerciseRepository>();
            services.AddScoped<IMealRepository, MealRepository>();
            services.AddScoped<IMuscleGroupRepository, MuscleGroupRepository>();
            services.AddScoped<ISessionRepository, SessionRepository>();
            services.AddScoped<ITokenDailyStatRepository, TokenDailyStatRepository>();
            services.AddScoped<IToolDailyStatRepository, ToolDailyStatRepository>();

            services.AddScoped<ICacheService, RedisCacheService>();
            services.AddTransient<IChatMemoryService, VectorChatMemoryService>();
            services.AddTransient<IChatNotifier, SignalRChatNotifier>();
            services.AddScoped<IAITranslationService, AITranslationService>();
            services.AddScoped<ITitleGeneratorAiService, AITitleGeneratorService>();
            services.AddScoped<ICurrentUserService, CurrentUserService>();
            services.AddScoped<IDomainEventService, DomainEventService>();
            services.AddScoped<IIntegrationEventService, IntegrationEventService>();
            services.AddScoped<IWorkoutPlanOrchestrator, WorkoutPlanOrchestrator>();
            services.AddScoped<IWeekPlanExecutor, WeekPlanExecutor>();

            services.AddScoped<IChatSessionManager, ChatSessionManager>();
            services.AddScoped<IChatContextBuilder, ChatContextBuilder>();
            services.AddScoped<IChatStreamingService, ChatStreamingService>();
            services.AddSingleton<IChatResponseSaver, ChatResponseSaver>();
            return services;
        }
    }
}
