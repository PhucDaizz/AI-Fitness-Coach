using AIService.Application.Common.Behaviours;
using AIService.Application.Common.Interfaces;
using AIService.Application.Features.Workout.Commands.GeneratePlan.Services;
using AIService.Application.Features.Workout.Commands.Services;
using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace AIService.Application
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddApplication(this IServiceCollection services)
        {
            services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly()));

            services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

            services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehaviour<,>));

            services.AddScoped<IHistoricalContextBuilder, HistoricalContextBuilder>();
            services.AddScoped<IWorkoutPlanGenerationService, WorkoutPlanGenerationService>();

            return services;
        }
    }
}
