import React, { useState, useEffect } from 'react';

const CategoryModal = ({ isOpen, onClose, onSave, initialData }) => {
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <div className="w-full max-w-md bg-surface-container rounded-2xl shadow-2xl border border-outline-variant/15 overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="bg-surface-container-high px-8 py-6 flex justify-between items-center border-b border-surface-container-highest/20">
          <div>
            <h3 className="text-xl font-black italic tracking-tighter text-white">
              {initialData ? 'Edit Category' : 'Add New Category'}
            </h3>
            <p className="text-[10px] uppercase tracking-widest text-primary mt-1">Classification Unit</p>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-[10px] uppercase tracking-[0.15em] font-bold text-on-surface-variant mb-2">Category Name (English)</label>
            <input 
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-surface-container-low border border-outline-variant/10 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-on-surface-variant/30 text-white outline-none" 
              placeholder="e.g. Upper Body" 
              type="text"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-[0.15em] font-bold text-on-surface-variant mb-2">NameVN (Vietnamese)</label>
            <input 
              required
              value={formData.nameVN}
              onChange={(e) => setFormData({...formData, nameVN: e.target.value})}
              className="w-full bg-surface-container-low border border-outline-variant/10 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-on-surface-variant/30 text-white outline-none" 
              placeholder="e.g. Phần thân trên" 
              type="text"
            />
          </div>
          <div className="flex gap-4 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-full font-bold text-sm text-on-surface-variant bg-surface-container-highest hover:text-white transition-all underline-offset-4 hover:underline"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 px-6 py-3 rounded-full font-bold text-sm bg-primary text-on-primary hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_15px_rgba(177,255,36,0.3)]"
            >
              Confirm & Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;
