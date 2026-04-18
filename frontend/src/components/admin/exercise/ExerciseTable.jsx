import React from 'react';
import Pagination from '../../common/Pagination';

const ExerciseTable = ({ items, onEdit, onDelete, pagination, onPageChange }) => {
  return (
    <div className="bg-surface-container rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-surface-container-high/50">
              <th className="px-6 py-5 text-[0.65rem] uppercase tracking-widest font-black text-on-surface-variant">Visual</th>
              <th className="px-6 py-5 text-[0.65rem] uppercase tracking-widest font-black text-on-surface-variant">Name</th>
              <th className="px-6 py-5 text-[0.65rem] uppercase tracking-widest font-black text-on-surface-variant">Category</th>
              <th className="px-6 py-5 text-[0.65rem] uppercase tracking-widest font-black text-on-surface-variant">Muscles</th>
              <th className="px-6 py-5 text-[0.65rem] uppercase tracking-widest font-black text-on-surface-variant">Equipment</th>
              <th className="px-6 py-5 text-[0.65rem] uppercase tracking-widest font-black text-on-surface-variant">Location</th>
              <th className="px-6 py-5 text-[0.65rem] uppercase tracking-widest font-black text-on-surface-variant text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {items.length > 0 ? (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="w-14 h-14 rounded-lg bg-surface border border-white/10 overflow-hidden">
                      {item.imageThumbnailUrl ? (
                        <img 
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
                          src={item.imageThumbnailUrl} 
                          alt={item.name}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-surface-container-highest text-outline-variant">
                          <span className="material-symbols-outlined">image</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="block text-white font-bold text-sm">{item.name}</span>
                    <span className="text-[0.65rem] text-on-surface-variant uppercase font-mono">ID: {item.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-surface-container-highest text-secondary text-[0.65rem] font-black rounded-full uppercase">
                      {item.category?.name || 'General'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                      {item.primaryMuscles?.map(m => (
                        <span key={m.id} className="px-2 py-0.5 bg-primary/10 text-primary text-[0.6rem] font-bold rounded">
                          {m.nameEN}
                        </span>
                      ))}
                      {item.secondaryMuscles?.map(m => (
                        <span key={m.id} className="px-2 py-0.5 bg-white/5 text-on-surface-variant text-[0.6rem] font-bold rounded">
                          {m.nameEN}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-white text-xs font-semibold">
                      {item.equipments?.map(eq => eq.name).join(', ') || 'None'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {item.locationTypes?.map(loc => (
                        <span key={loc} className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[0.65rem] font-bold uppercase ${
                          loc === 'Gym' ? 'bg-secondary/10 text-secondary' : 
                          loc === 'Home' ? 'bg-tertiary-dim/10 text-tertiary-dim' : 
                          'bg-primary/10 text-primary'
                        }`}>
                          <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                            {loc === 'Gym' ? 'apartment' : loc === 'Home' ? 'home' : 'forest'}
                          </span>
                          {loc}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => onEdit(item)}
                        className="p-2 rounded-lg bg-surface hover:bg-surface-container-highest transition-colors text-white"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                      <button 
                        onClick={() => onDelete(item)}
                        className="p-2 rounded-lg bg-surface hover:bg-error/10 hover:text-error transition-colors text-white"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-10 text-center text-on-surface-variant">No exercises found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="bg-surface-container-high/30 px-6 py-4 flex items-center justify-between border-t border-white/5">
        <span className="text-xs text-on-surface-variant">
          Showing <span className="text-white font-bold">
            {totalItemsInPage(pagination)}
          </span> of <span className="text-white font-bold">{pagination.totalCount}</span> entries
        </span>
        <Pagination pagination={pagination} onPageChange={onPageChange} />
      </div>
    </div>
  );
};

const totalItemsInPage = (p) => {
  const start = ((p.pageNumber - 1) * p.pageSize) + 1;
  const end = Math.min(p.pageNumber * p.pageSize, p.totalCount);
  return `${start}-${end}`;
};

export default ExerciseTable;
