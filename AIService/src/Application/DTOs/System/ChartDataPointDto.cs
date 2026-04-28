namespace AIService.Application.DTOs.System
{
    public class ChartDataPointDto
    {
        public string Label { get; set; } = string.Empty; 
        public long Value { get; set; }                  
    }

    public enum ChartTimeFrame
    {
        Last24Hours = 1,
        Last7Days = 2,
        Last12Months = 3
    }
}
