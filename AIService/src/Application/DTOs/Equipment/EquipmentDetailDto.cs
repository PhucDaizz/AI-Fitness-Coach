namespace AIService.Application.DTOs.Equipment
{
    public record EquipmentDetailDto(int Id, string Name, string? NameVN, DateTime CreatedAt, DateTime UpdatedAt);
}
