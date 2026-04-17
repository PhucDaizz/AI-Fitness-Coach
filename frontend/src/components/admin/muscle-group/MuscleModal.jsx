import React, { useState, useEffect } from 'react';

const MuscleModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    nameEN: '',
    nameVN: '',
    isFront: true
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        nameEN: initialData.nameEN || '',
        nameVN: initialData.nameVN || '',
        isFront: initialData.isFront ?? true
      });
    } else {
      setFormData({ nameEN: '', nameVN: '', isFront: true });
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
              {initialData ? 'Edit Muscle Group' : 'Add Muscle Group'}
            </h3>
            <p className="text-[10px] uppercase tracking-widest text-primary mt-1">Anatomical Cluster</p>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.15em] font-bold text-on-surface-variant mb-2">Name (English)</label>
              <input 
                required
                value={formData.nameEN}
                onChange={(e) => setFormData({...formData, nameEN: e.target.value})}
                className="w-full bg-surface-container-low border border-outline-variant/10 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-on-surface-variant/30 text-white outline-none" 
                placeholder="e.g. Biceps" 
                type="text"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.15em] font-bold text-on-surface-variant mb-2">Name (Vietnamese)</label>
              <input 
                required
                value={formData.nameVN}
                onChange={(e) => setFormData({...formData, nameVN: e.target.value})}
                className="w-full bg-surface-container-low border border-outline-variant/10 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-on-surface-variant/30 text-white outline-none" 
                placeholder="e.g. Cơ nhị đầu" 
                type="text"
              />
            </div>
          </div>

          <div className="bg-surface-container-low p-4 rounded-xl border border-white/5">
            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface">Body Position</span>
                <span className="text-[8px] text-on-surface-variant opacity-60">Is this muscle on the front of the body?</span>
              </div>
              <div className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={formData.isFront}
                  onChange={(e) => setFormData({...formData, isFront: e.target.checked})}
                />
                <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-on-surface-variant after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary peer-checked:after:bg-on-primary"></div>
              </div>
            </label>
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

export default MuscleModal;
