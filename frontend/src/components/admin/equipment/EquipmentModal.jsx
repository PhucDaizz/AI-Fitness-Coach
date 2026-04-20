import React, { useState, useEffect } from 'react';

const EquipmentModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    nameVN: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        nameVN: initialData.nameVN || ''
      });
    } else {
      setFormData({ name: '', nameVN: '' });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
      <div className="w-full max-w-md bg-surface-container border border-[#494847]/20 rounded-3xl p-8 relative overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="absolute top-0 left-0 w-1 h-full bg-[#b1ff24]"></div>
        
        <div className="flex justify-between items-start mb-8">
          <div>
            <h4 className="text-xl font-black italic tracking-tight text-white uppercase">
              {initialData ? 'Edit Asset' : 'Add New Equipment'}
            </h4>
            <p className="text-[10px] uppercase tracking-widest text-primary mt-1 font-bold">Physical Inventory</p>
          </div>
          <button onClick={onClose} className="text-[#adaaaa] hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#adaaaa] mb-2 font-bold">Equipment Name</label>
            <input 
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-surface-container-highest border-none rounded-xl p-4 text-white placeholder:text-[#494847] focus:ring-2 focus:ring-[#b1ff24] outline-none transition-all" 
              placeholder="e.g. Olympic Barbell" 
              type="text"
            />
          </div>
          
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-[#adaaaa] mb-2 font-bold">Name (Vietnamese) - Optional</label>
            <input 
              value={formData.nameVN}
              onChange={(e) => setFormData({...formData, nameVN: e.target.value})}
              className="w-full bg-surface-container-highest border-none rounded-xl p-4 text-white placeholder:text-[#494847] focus:ring-2 focus:ring-[#b1ff24] outline-none transition-all" 
              placeholder="e.g. Thanh tạ Olympic" 
              type="text"
            />
          </div>

          <div className="pt-4 flex gap-4">
            <button 
              type="submit"
              className="flex-1 py-4 rounded-full bg-[#b1ff24] text-[#3e5e00] font-black text-xs uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(177,255,36,0.2)]"
            >
              {initialData ? 'Update Asset' : 'Save Asset'}
            </button>
            <button 
              type="button"
              onClick={onClose}
              className="px-6 py-4 rounded-full bg-surface-container-highest text-[#adaaaa] font-bold text-xs uppercase tracking-[0.2em] hover:text-white transition-all underline-offset-4 hover:underline"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EquipmentModal;
