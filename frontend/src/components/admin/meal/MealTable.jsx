import React from 'react';
import Pagination from '../../common/Pagination';

// High-quality fallback food image
const DEFAULT_MEAL_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=200&auto=format&fit=crop';

const MealTable = ({ items, onEdit, onDelete, pagination, onPageChange }) => {
  
  const handleImageError = (e) => {
    e.target.src = DEFAULT_MEAL_IMAGE;
  };

  const getValidImageUrl = (url) => {
    if (!url || url === '' || url.includes('your-domain.com') || url.includes('placeholder')) {
      return DEFAULT_MEAL_IMAGE;
    }
    return url;
  };

  return (
    <div className="bg-surface-container rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-high/50 border-b border-white/5">
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">ID</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Meal Preview</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Name</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Energy (Kcal)</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Macros (P/C/F)</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Cuisine</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Tags</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">AI Status</th>
              <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-on-surface-variant text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {items.length > 0 ? (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4 font-mono text-[10px] text-on-surface-variant">#{item.id}</td>
                  <td className="px-6 py-4">
                    <div className="w-12 h-12 rounded-lg bg-surface-container-highest border border-white/10 overflow-hidden relative shadow-inner">
                      <img 
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100" 
                        src={getValidImageUrl(item.imageUrl)} 
                        alt={item.name}
                        onError={handleImageError}
                      />
                      {/* Subtitle overlay for missing images */}
                      {(!item.imageUrl || item.imageUrl.includes('your-domain.com')) && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                          <span className="material-symbols-outlined text-white/50 text-xs">restaurant</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-white group-hover:text-primary transition-colors text-sm line-clamp-1">{item.name}</p>
                    <p className="text-[9px] text-on-surface-variant/50 uppercase tracking-tighter">Verified Protocol</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-black text-secondary text-xs">{item.calories}</span>
                      <span className="text-[8px] text-on-surface-variant font-bold uppercase">KCAL</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-primary">{item.protein}</span>
                        <span className="text-[7px] text-white/30 font-bold">PRO</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-secondary">{item.carbs}</span>
                        <span className="text-[7px] text-white/30 font-bold">CARB</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-error">{item.fat}</span>
                        <span className="text-[7px] text-white/30 font-bold">FAT</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest bg-white/5 px-2 py-1 rounded capitalize">
                      {item.cuisineType || 'Global'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-[120px]">
                      {item.dietTags?.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="bg-surface-container-highest text-[8px] font-black uppercase px-2 py-0.5 rounded text-white/40 border border-white/5">
                          {tag}
                        </span>
                      ))}
                      {item.dietTags?.length > 3 && (
                        <span className="text-[8px] text-white/20 font-bold">+{item.dietTags.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_10px] ${getStatusColor(item.embedStatus)}`}></div>
                      <span className={`text-[9px] font-black uppercase tracking-tighter ${getStatusTextColor(item.embedStatus)}`}>
                        {getStatusText(item.embedStatus)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                      <button 
                        onClick={() => onEdit(item)}
                        className="w-8 h-8 rounded-lg bg-surface-container-highest hover:bg-white/10 transition-colors text-white flex items-center justify-center shadow-lg"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                      <button 
                        onClick={() => onDelete(item)}
                        className="w-8 h-8 rounded-lg bg-surface-container-highest hover:bg-error/20 hover:text-error transition-colors text-white flex items-center justify-center shadow-lg"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="px-6 py-12 text-center">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant/20 block mb-2">database_off</span>
                  <p className="text-on-surface-variant italic text-xs uppercase tracking-widest font-bold">No High-Performance Records</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="bg-surface-container-high/30 px-6 py-4 flex items-center justify-between border-t border-white/5">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          <span className="text-[9px] text-on-surface-variant uppercase tracking-[0.2em] font-black">
            Matrix Total: <span className="text-white">{pagination.totalCount.toLocaleString()}</span> Profiles
          </span>
        </div>
        <Pagination pagination={pagination} onPageChange={onPageChange} />
      </div>
    </div>
  );
};

const getStatusColor = (status) => {
  if (status === 2 || status === 'embedded') return 'bg-primary shadow-primary/50';
  if (status === 1 || status === 'pending') return 'bg-tertiary shadow-tertiary/50';
  if (status === 3 || status === 'skip') return 'bg-error shadow-error/50';
  return 'bg-outline shadow-outline/10';
};

const getStatusTextColor = (status) => {
  if (status === 2 || status === 'embedded') return 'text-primary';
  if (status === 1 || status === 'pending') return 'text-tertiary';
  if (status === 3 || status === 'skip') return 'text-error';
  return 'text-outline';
};

const getStatusText = (status) => {
  if (status === 2 || status === 'embedded') return 'Synced';
  if (status === 1 || status === 'pending') return 'Wait';
  if (status === 3 || status === 'skip') return 'Skip';
  return status || 'Void';
};

export default MealTable;
