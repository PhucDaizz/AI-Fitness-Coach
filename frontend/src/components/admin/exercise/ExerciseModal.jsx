import React, { useState, useEffect } from 'react';

const ExerciseModal = ({ isOpen, onClose, onSave, initialData, categories, allMuscles, allEquipment }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    descriptionSource: 0, // Enum
    categoryId: '',
    locationType: [],
    imageUrl: '',
    imageThumbnailUrl: '',
    isFrontImage: true,
    muscles: [], // List<MuscleInputDto> { muscleId, isPrimary }
    equipmentIds: []
  });

  useEffect(() => {
    if (initialData) {
      // Map initialData (ExerciseDetailDto) to formData (Commands)
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        descriptionSource: initialData.descriptionSource || 0,
        categoryId: initialData.categoryId || '',
        locationType: initialData.locationType || [],
        imageUrl: initialData.imageUrl || '',
        imageThumbnailUrl: initialData.imageThumbnailUrl || '',
        isFrontImage: initialData.isFrontImage ?? true,
        muscles: initialData.muscles?.map(m => ({ muscleId: m.muscleId, isPrimary: m.isPrimary })) || [],
        equipmentIds: initialData.equipmentIds || []
      });
    } else {
      setFormData({
        name: '', description: '', descriptionSource: 0, categoryId: '',
        locationType: ['Gym'], imageUrl: '', imageThumbnailUrl: '', isFrontImage: true,
        muscles: [], equipmentIds: []
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...formData, id: initialData?.id });
  };

  const toggleMuscle = (muscleId) => {
    const exists = formData.muscles.find(m => m.muscleId === muscleId);
    if (exists) {
      setFormData({ ...formData, muscles: formData.muscles.filter(m => m.muscleId !== muscleId) });
    } else {
      setFormData({ ...formData, muscles: [...formData.muscles, { muscleId, isPrimary: true }] });
    }
  };

  const setMusclePrimary = (muscleId, isPrimary) => {
    setFormData({
      ...formData,
      muscles: formData.muscles.map(m => m.muscleId === muscleId ? { ...m, isPrimary } : m)
    });
  };

  const toggleLocation = (loc) => {
    if (formData.locationType.includes(loc)) {
      setFormData({ ...formData, locationType: formData.locationType.filter(l => l !== loc) });
    } else {
      setFormData({ ...formData, locationType: [...formData.locationType, loc] });
    }
  };

  const toggleEquipment = (id) => {
    if (formData.equipmentIds.includes(id)) {
      setFormData({ ...formData, equipmentIds: formData.equipmentIds.filter(e => e !== id) });
    } else {
      setFormData({ ...formData, equipmentIds: [...formData.equipmentIds, id] });
    }
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="bg-surface-container w-full max-w-4xl max-h-[95vh] overflow-y-auto rounded-3xl border border-white/10 shadow-2xl no-scrollbar animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-surface-container-high/95 backdrop-blur px-8 py-6 border-b border-white/5 flex justify-between items-center z-10">
          <div>
            <h3 className="text-2xl font-black italic text-primary uppercase">{initialData ? 'Update Protocol' : 'New Exercise Definition'}</h3>
            <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Sytem Core configuration</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Row 1: Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[0.65rem] font-black uppercase tracking-widest text-[#adaaaa] px-1">Exercise Name</label>
                <input 
                  required
                  className="w-full bg-[#1a1919] border-none rounded-xl py-4 px-5 text-white focus:ring-1 focus:ring-primary shadow-inner" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  type="text" 
                  placeholder="e.g. Barbell Bench Press"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[0.65rem] font-black uppercase tracking-widest text-[#adaaaa] px-1">Description Source</label>
                <select 
                  className="w-full bg-[#1a1919] border-none rounded-xl py-4 px-5 text-white focus:ring-1 focus:ring-primary"
                  value={formData.descriptionSource}
                  onChange={e => setFormData({...formData, descriptionSource: parseInt(e.target.value)})}
                >
                  <option value={0}>Official Database</option>
                  <option value={1}>User Contributed</option>
                  <option value={2}>Pulse AI Generated</option>
                </select>
              </div>
              <div className="col-span-full space-y-3">
                <label className="text-[0.65rem] font-black uppercase tracking-widest text-[#adaaaa] px-1">Definition / Cues</label>
                <textarea 
                  className="w-full bg-[#1a1919] border-none rounded-xl py-4 px-5 text-white focus:ring-1 focus:ring-primary resize-none min-h-[120px]" 
                  rows="4"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Focus on lowering the bar to mid-chest..."
                />
              </div>
            </div>

            {/* Row 2: Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <label className="text-[0.65rem] font-black uppercase tracking-widest text-[#adaaaa] px-1">Exercise Category</label>
                <select 
                  className="w-full bg-[#1a1919] border-none rounded-xl py-4 px-5 text-white focus:ring-1 focus:ring-primary"
                  value={formData.categoryId}
                  onChange={e => setFormData({...formData, categoryId: e.target.value})}
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2 space-y-3">
                <label className="text-[0.65rem] font-black uppercase tracking-widest text-[#adaaaa] px-1">Muscle Target Map</label>
                <div className="bg-[#1a1919] rounded-2xl p-4 min-h-[4rem] flex flex-wrap gap-2 items-center border border-white/5">
                  {formData.muscles.map(m => {
                    const muscle = allMuscles.find(am => am.id === m.muscleId);
                    return (
                      <div key={m.muscleId} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${m.isPrimary ? 'bg-primary/20 border-primary text-primary' : 'bg-secondary/20 border-secondary text-secondary'}`}>
                        <span className="text-[0.625rem] font-black uppercase">{muscle?.nameEN || 'Muscle'}</span>
                        <div className="h-4 w-px bg-white/10"></div>
                        <button 
                          type="button" 
                          onClick={() => setMusclePrimary(m.muscleId, !m.isPrimary)}
                          title={m.isPrimary ? "Set as Secondary" : "Set as Primary"}
                          className="hover:scale-110 active:scale-95"
                        >
                          <span className="material-symbols-outlined text-xs">{m.isPrimary ? 'star' : 'star_outline'}</span>
                        </button>
                        <button type="button" onClick={() => toggleMuscle(m.muscleId)} className="hover:text-error">
                          <span className="material-symbols-outlined text-xs">close</span>
                        </button>
                      </div>
                    );
                  })}
                  <div className="relative group/muscledrop">
                    <button type="button" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all">
                      <span className="material-symbols-outlined text-lg">add</span>
                    </button>
                    <div className="absolute top-full left-0 mt-2 w-64 bg-surface-container-highest border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover/muscledrop:opacity-100 group-hover/muscledrop:visible transition-all z-50 p-2 max-h-64 overflow-y-auto no-scrollbar">
                      {allMuscles.filter(am => !formData.muscles.find(m => m.muscleId === am.id)).map(am => (
                        <button 
                          key={am.id}
                          type="button"
                          onClick={() => toggleMuscle(am.id)}
                          className="w-full text-left px-4 py-2 text-xs hover:bg-primary/10 hover:text-primary rounded-lg transition-colors"
                        >
                          {am.nameEN}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 3: Equipment & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[0.65rem] font-black uppercase tracking-widest text-[#adaaaa] px-1">Physical Requirements (Equipment)</label>
                <div className="bg-[#1a1919] rounded-2xl p-4 min-h-[4rem] flex flex-wrap gap-2 items-center border border-white/5">
                  {formData.equipmentIds.map(id => {
                    const gear = allEquipment.find(ae => ae.id === id);
                    return (
                      <span key={id} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 text-white rounded-lg text-[0.625rem] font-black uppercase border border-white/10 group">
                        {gear?.name || 'Gear'}
                        <button type="button" onClick={() => toggleEquipment(id)} className="text-on-surface-variant hover:text-error opacity-0 group-hover:opacity-100 transition-all">
                          <span className="material-symbols-outlined text-xs">close</span>
                        </button>
                      </span>
                    );
                  })}
                  <div className="relative group/geardrop">
                    <button type="button" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-secondary/20 hover:text-secondary transition-all">
                      <span className="material-symbols-outlined text-lg">add</span>
                    </button>
                    <div className="absolute top-full left-0 mt-2 w-64 bg-surface-container-highest border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover/geardrop:opacity-100 group-hover/geardrop:visible transition-all z-50 p-2 max-h-64 overflow-y-auto no-scrollbar">
                      {allEquipment.filter(ae => !formData.equipmentIds.includes(ae.id)).map(ae => (
                        <button 
                          key={ae.id}
                          type="button"
                          onClick={() => toggleEquipment(ae.id)}
                          className="w-full text-left px-4 py-2 text-xs hover:bg-secondary/10 hover:text-secondary rounded-lg transition-colors"
                        >
                          {ae.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[0.65rem] font-black uppercase tracking-widest text-[#adaaaa] px-1">Environmental Vectors (Location)</label>
                <div className="flex gap-4">
                  {['Gym', 'Home', 'Outdoor'].map(loc => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => toggleLocation(loc)}
                      className={`flex-1 py-4 rounded-xl font-black text-[0.65rem] uppercase tracking-widest transition-all border ${
                        formData.locationType.includes(loc) ? 'bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(177,255,36,0.1)]' : 'bg-white/5 border-white/5 text-on-surface-variant'
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 4: Assets */}
            <div className="bg-[#131313] p-6 rounded-2xl border border-white/5 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[0.65rem] font-black uppercase tracking-widest text-[#adaaaa] px-1">Hero Asset URL (High Res)</label>
                  <input 
                    className="w-full bg-[#0e0e0e] border-none rounded-xl py-3 px-5 text-xs text-white focus:ring-1 focus:ring-primary shadow-inner" 
                    value={formData.imageUrl}
                    onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                    type="text" 
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[0.65rem] font-black uppercase tracking-widest text-[#adaaaa] px-1">Thumbnail Preview URL</label>
                  <input 
                    className="w-full bg-[#0e0e0e] border-none rounded-xl py-3 px-5 text-xs text-white focus:ring-1 focus:ring-primary shadow-inner" 
                    value={formData.imageThumbnailUrl}
                    onChange={e => setFormData({...formData, imageThumbnailUrl: e.target.value})}
                    type="text" 
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex flex-col">
                  <span className="text-[0.65rem] font-black uppercase tracking-widest text-white">Front Body Mapping</span>
                  <span className="text-[0.55rem] text-on-surface-variant opacity-60">Should this be rendered on the anterior anatomical model?</span>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={formData.isFrontImage}
                    onChange={e => setFormData({...formData, isFrontImage: e.target.checked})}
                  />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/40 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary peer-checked:after:bg-on-primary"></div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex gap-4 pt-10 border-t border-white/5">
              <button 
                type="button" 
                onClick={onClose}
                className="flex-1 py-4 rounded-full text-[#adaaaa] font-black text-xs uppercase tracking-[0.2em] hover:text-white hover:bg-white/5 transition-all"
              >
                Abort Changes
              </button>
              <button 
                type="submit"
                className="flex-[2] py-4 rounded-full bg-primary text-on-primary font-black text-xs uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(177,255,36,0.3)]"
              >
                Commit Protocol
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ExerciseModal;
