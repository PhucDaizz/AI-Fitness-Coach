import React from 'react';
import Pagination from '../../common/Pagination';

const getEquipmentIcon = (name = '') => {
  const nameLower = name.toLowerCase();
  
  const iconMap = {
    'barbell': 'fitness_center',
    'dumbbell': 'fitness_center',
    'sz-bar': 'fitness_center',
    'pull-up bar': 'fitness_center',
    'bench': 'chair_alt',
    'machine': 'settings_accessibility',
    'kettlebell': 'fitness_center',
    'cable': 'cable',
    'resistance band': 'cable',
    'bodyweight': 'accessibility_new',
    'gym mat': 'layers',
    'swiss ball': 'sports_volleyball',
    'treadmill': 'directions_run',
    'rowing': 'rowing',
    'cycle': 'directions_bike',
    'other': 'more_horiz'
  };

  // Find partial match
  for (const [key, icon] of Object.entries(iconMap)) {
    if (nameLower.includes(key)) return icon;
  }

  return 'fitness_center'; // Default icon
};

const EquipmentTable = ({ items, onEdit, onDelete, pagination, onPageChange }) => {
  return (
    <div className="bg-surface-container rounded-3xl overflow-hidden shadow-2xl shadow-black/60">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#494847]/10">
              <th className="px-6 py-5 text-[10px] font-bold text-[#adaaaa] uppercase tracking-[0.15em]">Equipment ID</th>
              <th className="px-6 py-5 text-[10px] font-bold text-[#adaaaa] uppercase tracking-[0.15em]">Name</th>
              <th className="px-6 py-5 text-[10px] font-bold text-[#adaaaa] uppercase tracking-[0.15em]">NameVN</th>
              <th className="px-6 py-5 text-[10px] font-bold text-[#adaaaa] uppercase tracking-[0.15em] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#494847]/10">
            {items.length > 0 ? (
              items.map((item) => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-5">
                    <span className="font-mono text-xs text-[#6a9cff]">#EQ-{item.id.toString().padStart(4, '0')}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center text-[#b1ff24]">
                        <span className="material-symbols-outlined">{getEquipmentIcon(item.name)}</span>
                      </div>
                      <span className="font-semibold text-sm text-white">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm text-[#adaaaa]">{item.nameVN || 'N/A'}</td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => onEdit(item)}
                        className="p-2 hover:text-[#b1ff24] transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </button>
                      <button 
                        onClick={() => onDelete(item)}
                        className="p-2 hover:text-error transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-10 text-center text-on-surface-variant">No items found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-6 bg-surface-container-high border-t border-[#494847]/10 flex items-center justify-between">
        <span className="text-xs text-[#adaaaa] font-medium tracking-wide">
          Showing <span className="text-white">
            {((pagination.pageNumber - 1) * pagination.pageSize) + 1}-{Math.min(pagination.pageNumber * pagination.pageSize, pagination.totalCount)}
          </span> of <span className="text-white">{pagination.totalCount}</span> equipment
        </span>
        <Pagination pagination={pagination} onPageChange={onPageChange} />
      </div>
    </div>
  );
};

export default EquipmentTable;
