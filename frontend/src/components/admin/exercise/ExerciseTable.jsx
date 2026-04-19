import React from 'react';
import Pagination from '../../common/Pagination';

const DEFAULT_EXERCISE_IMAGE = 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=200&auto=format&fit=crop';

const ExerciseTable = ({ items, onEdit, onDelete, pagination, onPageChange }) => {
  
  const handleImageError = (e) => {
    e.target.src = DEFAULT_EXERCISE_IMAGE;
  };

  const getValidImageUrl = (url) => {
    if (!url || url === '' || url.includes('placeholder')) {
      return DEFAULT_EXERCISE_IMAGE;
    }
    return url;
  };

  return (
    <div className="bg-surface-container rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-surface-container-high/50">
              <th className="px-6 py-5 text-[10px] uppercase tracking-widest font-black text-on-surface-variant">Protocol</th>
              <th className="px-6 py-5 text-[10px] uppercase tracking-widest font-black text-on-surface-variant">Exercise Profile</th>
              <th className="px-6 py-5 text-[10px] uppercase tracking-widest font-black text-on-surface-variant">Classification</th>
              <th className="px-6 py-5 text-[10px] uppercase tracking-widest font-black text-on-surface-variant">Biometrics</th>
              <th className="px-6 py-5 text-[10px] uppercase tracking-widest font-black text-on-surface-variant">Hardware</th>
              <th className="px-6 py-5 text-[10px] uppercase tracking-widest font-black text-on-surface-variant">Environment</th>
              <th className="px-6 py-5 text-[10px] uppercase tracking-widest font-black text-on-surface-variant text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {items.length > 0 ? (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="w-14 h-14 rounded-xl bg-[#1a1919] border border-white/10 overflow-hidden relative shadow-inner group-hover:border-primary/30 transition-all duration-500">
                      <img 
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100" 
                        src={getValidImageUrl(item.imageThumbnailUrl || item.imageUrl)} 
                        alt={item.name}
                        onError={handleImageError}
                      />
                      {(!item.imageThumbnailUrl && !item.imageUrl) && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                          <span className="material-symbols-outlined text-white/50 text-xs">fitness_center</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="block text-white font-black text-sm group-hover:text-primary transition-colors">{item.name}</span>
                    <span className="text-[9px] text-on-surface-variant uppercase font-mono tracking-tighter italic opacity-50">SYNC_ID: {item.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-surface-container-highest text-secondary text-[8px] font-black rounded-full uppercase tracking-widest border border-white/5">
                      {item.category?.name || 'General'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-[180px]">
                      {item.primaryMuscles?.map(m => (
                        <span key={m.id} className="px-2 py-0.5 bg-primary/10 text-primary text-[8px] font-black rounded border border-primary/10 uppercase">
                          {m.nameEN}
                        </span>
                      ))}
                      {item.secondaryMuscles?.slice(0, 2).map(m => (
                        <span key={m.id} className="px-2 py-0.5 bg-white/5 text-on-surface-variant text-[8px] font-black rounded border border-white/5 uppercase opacity-60">
                          {m.nameEN}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-0.5">
                      {item.equipments?.length > 0 ? (
                        item.equipments.map(eq => (
                          <span key={eq.id} className="text-white text-[10px] font-bold tracking-tight opacity-80 flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-secondary"></span>
                            {eq.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-on-surface-variant text-[10px] italic opacity-30 uppercase font-black">Bodyweight</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {item.locationTypes?.map(loc => (
                        <span key={loc} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider ${
                          loc === 'Gym' ? 'bg-secondary/10 text-secondary' : 
                          loc === 'Home' ? 'bg-tertiary-dim/10 text-tertiary-dim' : 
                          'bg-primary/10 text-primary'
                        }`}>
                          <span className="material-symbols-outlined text-[12px]">
                            {loc === 'Gym' ? 'apartment' : loc === 'Home' ? 'home' : 'forest'}
                          </span>
                          {loc}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                      <button 
                        onClick={() => onEdit(item)}
                        className="w-9 h-9 rounded-xl bg-surface-container-highest hover:bg-white/10 transition-colors text-white flex items-center justify-center shadow-lg border border-white/5"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit_note</span>
                      </button>
                      <button 
                        onClick={() => onDelete(item)}
                        className="w-9 h-9 rounded-xl bg-surface-container-highest hover:bg-error/20 hover:text-error transition-colors text-white flex items-center justify-center shadow-lg border border-white/5"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-16 text-center">
                   <span className="material-symbols-outlined text-4xl text-on-surface-variant/20 block mb-2 animate-pulse">inventory_2</span>
                   <p className="text-on-surface-variant italic text-[10px] uppercase tracking-widest font-black">No Bio-Protocol Signals Detected</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="bg-surface-container-high/30 px-8 py-5 flex items-center justify-between border-t border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></div>
          <span className="text-[9px] text-on-surface-variant uppercase tracking-[0.2em] font-black">
            Library Density: <span className="text-white">{pagination.totalCount.toLocaleString()}</span> Operational Nodes
          </span>
        </div>
        <Pagination pagination={pagination} onPageChange={onPageChange} />
      </div>
    </div>
  );
};

export default ExerciseTable;
