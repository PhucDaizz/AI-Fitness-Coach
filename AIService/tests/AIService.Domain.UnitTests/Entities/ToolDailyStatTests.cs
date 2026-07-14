using System;
using AIService.Domain.Entities;
using FluentAssertions;
using Xunit;

namespace AIService.Domain.UnitTests.Entities
{
    public class ToolDailyStatTests
    {
        [Fact]
        public void Constructor_ShouldInitializeCorrectly()
        {
            // Arrange
            var date = DateOnly.FromDateTime(DateTime.UtcNow);
            string toolName = "WebSearchTool";

            // Act
            var stat = new ToolDailyStat(date, toolName);

            // Assert
            stat.Id.Should().NotBeEmpty();
            stat.Date.Should().Be(date);
            stat.ToolName.Should().Be(toolName);
            stat.UsageCount.Should().Be(0);
        }

        [Fact]
        public void IncrementUsage_ShouldAddOneToUsageCount()
        {
            // Arrange
            var date = DateOnly.FromDateTime(DateTime.UtcNow);
            var stat = new ToolDailyStat(date, "CalculatorTool");

            // Act
            stat.IncrementUsage();

            // Assert
            stat.UsageCount.Should().Be(1);

            // Act again
            stat.IncrementUsage();

            // Assert again
            stat.UsageCount.Should().Be(2);
        }
    }
}
