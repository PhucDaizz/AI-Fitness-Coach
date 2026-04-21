using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AIService.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTableTokenDailyStat : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "token_daily_stats",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    TotalPromptTokens = table.Column<long>(type: "bigint", nullable: false),
                    TotalCompletionTokens = table.Column<long>(type: "bigint", nullable: false),
                    TotalTokens = table.Column<long>(type: "bigint", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    CreatedBy = table.Column<string>(type: "varchar(450)", maxLength: 450, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    UpdatedBy = table.Column<string>(type: "varchar(450)", maxLength: 450, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_token_daily_stats", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_messages_CreatedAt_TotalTokens_PromptTokens_CompletionTokens",
                table: "messages",
                columns: new[] { "CreatedAt", "TotalTokens", "PromptTokens", "CompletionTokens" });

            migrationBuilder.CreateIndex(
                name: "IX_token_daily_stats_Date",
                table: "token_daily_stats",
                column: "Date",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "token_daily_stats");

            migrationBuilder.DropIndex(
                name: "IX_messages_CreatedAt_TotalTokens_PromptTokens_CompletionTokens",
                table: "messages");
        }
    }
}
