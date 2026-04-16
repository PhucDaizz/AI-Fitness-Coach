using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AIService.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMealTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_exercises_exercise_categories_CategoryExternalId",
                table: "exercises");

            migrationBuilder.RenameColumn(
                name: "CategoryExternalId",
                table: "exercises",
                newName: "CategoryId");

            migrationBuilder.RenameIndex(
                name: "IX_exercises_CategoryExternalId",
                table: "exercises",
                newName: "IX_exercises_CategoryId");

            migrationBuilder.CreateTable(
                name: "meals",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    name = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    description = table.Column<string>(type: "text", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    calories = table.Column<int>(type: "int", nullable: false),
                    protein = table.Column<float>(type: "float", nullable: false),
                    carbs = table.Column<float>(type: "float", nullable: false),
                    fat = table.Column<float>(type: "float", nullable: false),
                    cuisine_type = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    diet_tags = table.Column<string>(type: "json", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    image_url = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    embed_status = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    CreatedBy = table.Column<string>(type: "varchar(450)", maxLength: 450, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    UpdatedBy = table.Column<string>(type: "varchar(450)", maxLength: 450, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_meals", x => x.id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddForeignKey(
                name: "FK_exercises_exercise_categories_CategoryId",
                table: "exercises",
                column: "CategoryId",
                principalTable: "exercise_categories",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_exercises_exercise_categories_CategoryId",
                table: "exercises");

            migrationBuilder.DropTable(
                name: "meals");

            migrationBuilder.RenameColumn(
                name: "CategoryId",
                table: "exercises",
                newName: "CategoryExternalId");

            migrationBuilder.RenameIndex(
                name: "IX_exercises_CategoryId",
                table: "exercises",
                newName: "IX_exercises_CategoryExternalId");

            migrationBuilder.AddForeignKey(
                name: "FK_exercises_exercise_categories_CategoryExternalId",
                table: "exercises",
                column: "CategoryExternalId",
                principalTable: "exercise_categories",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
