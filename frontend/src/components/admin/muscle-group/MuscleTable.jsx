import React from 'react';

const MuscleTable = ({ items, onEdit, onDelete, pagination, onPageChange }) => {
  return (
    <div className="bg-surface-container border-none rounded-xl overflow-hidden relative group">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-high border-none">
              <th className="px-10 py-4 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">ID</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Name (EN)</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Name (VN)</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant text-center">Position</th>
              <th className="px-10 py-4 text-[10px] uppercase tracking-widest font-bold text-on-surface-variant text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-highest/30">
            {items.length > 0 ? (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-surface-container-high transition-colors group/row">
                  <td className="px-10 py-5 text-sm font-mono text-primary/70">{item.id}</td>
                  <td className="px-6 py-5 text-sm font-bold text-white">{item.nameEN}</td>
                  <td className="px-6 py-5 text-sm text-on-surface-variant">{item.nameVN}</td>
                  <td className="px-6 py-5 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${item.isFront ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-secondary/10 text-secondary border border-secondary/20'}`}>
                      {item.isFront ? 'Front' : 'Back'}
                    </span>
                  </td>
                  <td className="px-10 py-5 text-right">
                    <div className="flex justify-end gap-3">
                      <button 
                        onClick={() => onEdit(item)}
                        className="p-2 rounded-lg hover:bg-primary/10 text-on-surface-variant hover:text-primary transition-all"
                      >
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button 
                        onClick={() => onDelete(item)}
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
                <td colSpan="5" className="px-6 py-10 text-center text-on-surface-variant">No muscle groups found.</td>
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
        <div className="flex items-center gap-1">
          <button 
            disabled={!pagination.hasPreviousPage}
            onClick={() => onPageChange(pagination.pageNumber - 1)}
            className="p-2 text-on-surface-variant hover:text-white transition-colors disabled:opacity-30"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          
          {[...Array(pagination.totalPages)].map((_, i) => (
            <button 
              key={i + 1}
              onClick={() => onPageChange(i + 1)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all text-xs font-bold ${
                pagination.pageNumber === i + 1 
                ? 'bg-primary text-on-primary' 
                : 'hover:bg-surface-container-highest text-white'
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button 
            disabled={!pagination.hasNextPage}
            onClick={() => onPageChange(pagination.pageNumber + 1)}
            className="p-2 text-on-surface-variant hover:text-white transition-colors disabled:opacity-30"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MuscleTable;
