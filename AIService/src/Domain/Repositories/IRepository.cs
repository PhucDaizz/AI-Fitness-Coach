namespace AIService.Domain.Repositories
{
    public interface IRepository<TEntity> where TEntity : class
    {
        // 1. READ (Lấy dữ liệu)
        Task<TEntity?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
        Task<IEnumerable<TEntity>> GetAllAsync(CancellationToken cancellationToken = default);

        // 2. CREATE (Thêm mới)
        Task AddAsync(TEntity entity, CancellationToken cancellationToken = default);
        Task AddRangeAsync(IEnumerable<TEntity> entities, CancellationToken cancellationToken = default);

        // 3. UPDATE (Cập nhật)
        void Update(TEntity entity);

        // 4. DELETE (Xóa)
        void Delete(TEntity entity);
        void DeleteRange(IEnumerable<TEntity> entities);
    }
}
