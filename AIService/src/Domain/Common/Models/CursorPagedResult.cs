namespace AIService.Domain.Common.Models
{
    public class CursorPagedResult<T>
    {
        public IReadOnlyList<T> Items { get; set; }
        public bool HasMore { get; set; }
        public DateTime? NextCursor { get; set; }

        public CursorPagedResult(IReadOnlyList<T> items, bool hasMore, DateTime? nextCursor)
        {
            Items = items ?? new List<T>().AsReadOnly();
            HasMore = hasMore;
            NextCursor = nextCursor;
        }
    }
}
