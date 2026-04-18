import React from 'react';

const Pagination = ({ pagination, onPageChange }) => {
  const { pageNumber, totalPages, hasPreviousPage, hasNextPage } = pagination;

  const getPageNumbers = () => {
    const pages = [];
    const showMax = 5; // Max page buttons to show (excluding ellipses and first/last)

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Always include first page
      pages.push(1);

      if (pageNumber <= 4) {
        // Near start
        for (let i = 2; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (pageNumber >= totalPages - 3) {
        // Near end
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages - 1; i++) pages.push(i);
        pages.push(totalPages);
      } else {
        // Middle
        pages.push('...');
        for (let i = pageNumber - 1; i <= pageNumber + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center gap-1">
      <button 
        disabled={!hasPreviousPage}
        onClick={() => onPageChange(pageNumber - 1)}
        className="p-2 text-on-surface-variant hover:text-white transition-colors disabled:opacity-30 flex items-center"
      >
        <span className="material-symbols-outlined text-sm">chevron_left</span>
      </button>

      {getPageNumbers().map((page, index) => (
        <React.Fragment key={index}>
          {page === '...' ? (
            <span className="px-2 text-on-surface-variant/50">...</span>
          ) : (
            <button 
              onClick={() => onPageChange(page)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all text-xs font-bold ${
                pageNumber === page 
                ? 'bg-primary text-on-primary shadow-[0_0_15px_rgba(177,255,36,0.3)]' 
                : 'hover:bg-surface-container-highest text-white'
              }`}
            >
              {page}
            </button>
          )}
        </React.Fragment>
      ))}

      <button 
        disabled={!hasNextPage}
        onClick={() => onPageChange(pageNumber + 1)}
        className="p-2 text-on-surface-variant hover:text-white transition-colors disabled:opacity-30 flex items-center"
      >
        <span className="material-symbols-outlined text-sm">chevron_right</span>
      </button>
    </div>
  );
};

export default Pagination;
