using System;
using AIService.Domain.Entities;
using FluentAssertions;
using Xunit;

namespace AIService.Domain.UnitTests.Entities
{
    public class TokenDailyStatTests
    {
        [Fact]
        public void Constructor_ShouldInitializeCorrectly()
        {
            // Arrange
            var date = DateOnly.FromDateTime(DateTime.UtcNow);

            // Act
            var stat = new TokenDailyStat(date);

            // Assert
            stat.Id.Should().NotBeEmpty();
            stat.Date.Should().Be(date);
            stat.TotalPromptTokens.Should().Be(0);
            stat.TotalCompletionTokens.Should().Be(0);
            stat.TotalTokens.Should().Be(0);
        }

        [Fact]
        public void AddTokens_ShouldIncrementCountersCorrectly()
        {
            // Arrange
            var date = DateOnly.FromDateTime(DateTime.UtcNow);
            var stat = new TokenDailyStat(date);

            // Act
            stat.AddTokens(100, 50, 150);

            // Assert
            stat.TotalPromptTokens.Should().Be(100);
            stat.TotalCompletionTokens.Should().Be(50);
            stat.TotalTokens.Should().Be(150);

            // Act again
            stat.AddTokens(200, 100, 300);

            // Assert again
            stat.TotalPromptTokens.Should().Be(300);
            stat.TotalCompletionTokens.Should().Be(150);
            stat.TotalTokens.Should().Be(450);
        }
    }
}
