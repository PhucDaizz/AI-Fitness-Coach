# Base image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
USER app
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Copy all csproj projects
COPY ["src/API/AIService.API.csproj", "src/API/"]
COPY ["src/Application/AIService.Application.csproj", "src/Application/"]
COPY ["src/Infrastructure/AIService.Infrastructure.csproj", "src/Infrastructure/"]
COPY ["src/Domain/AIService.Domain.csproj", "src/Domain/"]

# Restore dependencies
RUN dotnet restore "./src/API/AIService.API.csproj"

# Copy the rest of the source code
COPY . .
WORKDIR "/src/src/API"
RUN dotnet build "./AIService.API.csproj" -c $BUILD_CONFIGURATION -o /app/build

# Publish stage
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./AIService.API.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# Final stage
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "AIService.API.dll"]
