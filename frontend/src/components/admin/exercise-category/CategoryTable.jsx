import React from 'react';
import Pagination from '../../common/Pagination';

const CategoryTable = ({ categories, onEdit, onDelete, pagination, onPageChange }) => {
  return (
    <div className="bg-surface-container border-none rounded-xl overflow-hidden relative group">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-high border-none">
              <th className="px-10 py-4 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">ID</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Name</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">NameVN</th>
              <th className="px-10 py-4 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-highest/30">
            {categories.length > 0 ? (
              categories.map((category) => (
                <tr key={category.id} className="hover:bg-surface-container-high transition-colors group/row">
                  <td className="px-10 py-5 text-sm font-mono text-primary/70">{category.id}</td>
                  <td className="px-6 py-5 text-sm font-bold text-white">{category.name}</td>
                  <td className="px-6 py-5 text-sm text-on-surface-variant">{category.nameVN}</td>
                  <td className="px-10 py-5 text-right">
                    <div className="flex justify-end gap-3">
                      <button 
                        onClick={() => onEdit(category)}
                        className="p-2 rounded-lg hover:bg-primary/10 text-on-surface-variant hover:text-primary transition-all"
                      >
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button 
                        onClick={() => onDelete(category)}
                        className="p-2 rounded-lg hover:bg-error/10 text-on-surface-variant hover:text-error transition-all"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-10 text-center text-on-surface-variant">No categories found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between px-10 py-4 bg-surface-container-high/50 border-t border-surface-container-highest/20">
        <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">
          Showing {((pagination.pageNumber - 1) * pagination.pageSize) + 1} to {Math.min(pagination.pageNumber * pagination.pageSize, pagination.totalCount)} of {pagination.totalCount} entries
        </p>
        <Pagination pagination={pagination} onPageChange={onPageChange} />
      </div>
    </div>
  );
};

export default CategoryTable;
