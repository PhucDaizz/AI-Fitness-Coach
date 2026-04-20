import React, { useState, useEffect } from 'react';

const DEFAULT_PREVIEW = 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=400&auto=format&fit=crop';

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

  const [previewUrl, setPreviewUrl] = useState(DEFAULT_PREVIEW);

  useEffect(() => {
    if (initialData) {
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
      setPreviewUrl(initialData.imageUrl || DEFAULT_PREVIEW);
    } else {
      setFormData({
        name: '', description: '', descriptionSource: 0, categoryId: '',
        locationType: ['Gym'], imageUrl: '', imageThumbnailUrl: '', isFrontImage: true,
        muscles: [], equipmentIds: []
      });
      setPreviewUrl(DEFAULT_PREVIEW);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...formData, id: initialData?.id });
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let val = type === 'number' ? parseFloat(value) : value;
    
    // Specifically handle descriptionSource which is a select but needs to be an integer
    if (name === 'descriptionSource') {
      val = parseInt(value, 10);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: val
    }));

    if (name === 'imageUrl') {
      setPreviewUrl(value || DEFAULT_PREVIEW);
    }
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
      <div className="bg-surface-container w-full max-w-6xl max-h-[95vh] overflow-y-auto rounded-[2.5rem] border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.9)] no-scrollbar animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="sticky top-0 bg-surface-container-high/95 backdrop-blur-md px-10 py-8 border-b border-white/5 flex justify-between items-start z-10">
          <div>
            <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px]">Movement Architecture Matrix</span>
            <h3 className="text-4xl font-black italic tracking-tighter uppercase text-white mt-1">
              {initialData ? 'Update' : 'Initialize'} <span className="text-primary">Protocol</span>
            </h3>
          </div>
          <button onClick={onClose} className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-error hover:text-white hover:scale-110 transition-all shadow-lg text-on-surface-variant font-bold">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-10">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Left Column: Visual Assets (4 Columns) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant italic">Protocol Visual Asset</label>
                <div className="aspect-[4/5] w-full rounded-2xl bg-[#1a1919] border border-white/5 overflow-hidden relative group shadow-2xl">
                  <img 
                    src={previewUrl} 
                    onError={() => setPreviewUrl(DEFAULT_PREVIEW)}
                    alt="Exercise Preview"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                  
                  {/* Overlay Info */}
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                     <span className="bg-primary/20 backdrop-blur-md border border-primary/20 text-primary text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Live Source</span>
                     {formData.isFrontImage ? (
                        <span className="material-symbols-outlined text-white/50" title="Front Body Render">front_hand</span>
                     ) : (
                        <span className="material-symbols-outlined text-white/50" title="Back Body Render">back_hand</span>
                     )}
                  </div>
                </div>
              </div>

              <div className="space-y-4 bg-[#131313] p-5 rounded-2xl border border-white/5">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[#adaaaa]">Hero Image URL</label>
                  <input 
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    className="w-full bg-[#0e0e0e] border border-white/5 focus:ring-1 focus:ring-primary rounded-xl py-2.5 px-4 text-xs text-white" 
                    placeholder="https://..." 
                    type="text"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[#adaaaa]">Thumbnail URL (Optional)</label>
                  <input 
                    name="imageThumbnailUrl"
                    value={formData.imageThumbnailUrl}
                    onChange={handleChange}
                    className="w-full bg-[#0e0e0e] border border-white/5 focus:ring-1 focus:ring-primary rounded-xl py-2.5 px-4 text-xs text-white" 
                    placeholder="https://..." 
                    type="text"
                  />
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white">Front Body View</span>
                    <span className="text-[8px] text-on-surface-variant opacity-60">Does this exercise target front muscles?</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={formData.isFrontImage}
                      onChange={e => setFormData({...formData, isFrontImage: e.target.checked})}
                    />
                    <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/40 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary peer-checked:after:bg-on-primary"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column: Technical Details (8 Columns) */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Row 1: Identification */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant italic px-1">Protocol Nomenclature</label>
                  <input 
                    name="name"
                    required
                    className="w-full bg-[#1a1919] border border-white/5 rounded-xl py-3.5 px-5 text-white focus:ring-2 focus:ring-primary font-bold shadow-inner" 
                    value={formData.name}
                    onChange={handleChange}
                    type="text" 
                    placeholder="e.g. Barbell Bench Press"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant italic px-1">Movement Category</label>
                  <select 
                    name="categoryId"
                    className="w-full bg-[#1a1919] border border-white/5 rounded-xl py-3.5 px-5 text-white focus:ring-2 focus:ring-primary font-bold appearance-none cursor-pointer"
                    value={formData.categoryId}
                    onChange={handleChange}
                  >
                    <option value="">Select Classification</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Narrative & Source */}
              <div className="space-y-1 bg-[#1a1919] rounded-2xl p-6 border border-white/5 shadow-inner relative">
                <div className="absolute top-6 right-6">
                  <select 
                    name="descriptionSource"
                    className="bg-[#131313] border border-white/10 rounded-lg py-1 px-3 text-[9px] text-white focus:ring-1 focus:ring-primary uppercase font-bold tracking-wider"
                    value={formData.descriptionSource}
                    onChange={handleChange}
                  >
                    <option value={0}>Official Database</option>
                    <option value={1}>Pulse AI Gen</option>
                    <option value={2}>User Source</option>
                  </select>
                </div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#adaaaa]">Execution Matrix (Cues)</label>
                <textarea 
                  name="description"
                  className="w-full bg-transparent border-none text-white focus:ring-0 resize-none min-h-[100px] mt-2 p-0 text-sm placeholder:text-white/10" 
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Define the biomechanical execution..."
                />
              </div>

              {/* Row 3: Biomechanics (Muscles) */}
              <div className="space-y-3">
                <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant italic px-1">Anatomical Target Map</label>
                <div className="bg-[#1a1919] rounded-2xl p-5 min-h-[4rem] flex flex-wrap gap-2 items-center border border-white/5">
                  {formData.muscles.map(m => {
                    const muscle = allMuscles.find(am => am.id === m.muscleId);
                    return (
                      <div key={m.muscleId} className={`flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all ${m.isPrimary ? 'bg-primary/10 border-primary text-primary' : 'bg-surface-container-high border-white/10 text-white/70'}`}>
                        <span className="text-[9px] font-black uppercase tracking-wider">{muscle?.nameEN || 'Muscle'}</span>
                        <div className="h-3 w-px bg-current opacity-30"></div>
                        <button 
                          type="button" 
                          onClick={() => setMusclePrimary(m.muscleId, !m.isPrimary)}
                          title={m.isPrimary ? "Set as Secondary" : "Set as Primary"}
                          className="hover:scale-125 transition-transform"
                        >
                          <span className="material-symbols-outlined text-[14px] leading-none">{m.isPrimary ? 'star' : 'star_outline'}</span>
                        </button>
                        <button type="button" onClick={() => toggleMuscle(m.muscleId)} className="hover:text-error hover:scale-125 transition-all">
                          <span className="material-symbols-outlined text-[14px] leading-none">close</span>
                        </button>
                      </div>
                    );
                  })}
                  <div className="relative group/muscledrop ml-1">
                    <button type="button" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-black transition-all">
                      <span className="material-symbols-outlined text-sm font-bold">add</span>
                    </button>
                    <div className="absolute top-full left-0 mt-2 w-56 bg-surface-container-highest border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover/muscledrop:opacity-100 group-hover/muscledrop:visible transition-all z-50 p-2 max-h-60 overflow-y-auto no-scrollbar">
                      {allMuscles.filter(am => !formData.muscles.find(m => m.muscleId === am.id)).map(am => (
                        <button 
                          key={am.id}
                          type="button"
                          onClick={() => toggleMuscle(am.id)}
                          className="w-full text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-black rounded-lg transition-colors"
                        >
                          {am.nameEN}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 4: Environment & Gear */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[#adaaaa] px-1">Hardware Required (Equipment)</label>
                  <div className="bg-[#1a1919] rounded-2xl p-4 min-h-[4rem] flex flex-wrap gap-2 items-center border border-white/5">
                    {formData.equipmentIds.map(id => {
                      const gear = allEquipment.find(ae => ae.id === id);
                      return (
                        <span key={id} className="flex items-center gap-2 px-3 py-1.5 bg-surface-container-high text-white rounded-lg text-[9px] font-black uppercase border border-white/10 group">
                          {gear?.name || 'Gear'}
                          <button type="button" onClick={() => toggleEquipment(id)} className="text-white/40 hover:text-error transition-colors">
                            <span className="material-symbols-outlined text-[14px] leading-none">close</span>
                          </button>
                        </span>
                      );
                    })}
                    <div className="relative group/geardrop ml-1">
                      <button type="button" className="w-7 h-7 rounded-sm bg-white/5 flex items-center justify-center hover:bg-white/20 transition-all">
                        <span className="material-symbols-outlined text-sm">add</span>
                      </button>
                      <div className="absolute bottom-full left-0 mb-2 w-56 bg-surface-container-highest border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover/geardrop:opacity-100 group-hover/geardrop:visible transition-all z-50 p-2 max-h-60 overflow-y-auto no-scrollbar">
                        {allEquipment.filter(ae => !formData.equipmentIds.includes(ae.id)).map(ae => (
                          <button 
                            key={ae.id}
                            type="button"
                            onClick={() => toggleEquipment(ae.id)}
                            className="w-full text-left px-4 py-2 text-[10px] uppercase font-bold hover:bg-white/10 rounded-lg transition-colors"
                          >
                            {ae.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[#adaaaa] px-1">Environmental Vectors</label>
                  <div className="flex gap-3 h-[4rem]">
                    {['Gym', 'Home', 'Outdoor'].map(loc => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => toggleLocation(loc)}
                        className={`flex-1 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border ${
                          formData.locationType.includes(loc) 
                            ? 'bg-primary/10 border-primary text-primary shadow-[0_0_15px_rgba(177,255,36,0.1)]' 
                            : 'bg-[#1a1919] border-white/5 text-on-surface-variant hover:bg-white/5'
                        }`}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="flex gap-4 pt-4 border-t border-white/5">
                <button 
                  type="button" 
                  onClick={onClose}
                  className="px-10 py-4 rounded-full text-[#adaaaa] font-black text-[10px] uppercase tracking-[0.2em] hover:text-white hover:bg-white/5 transition-all border border-transparent hover:border-white/10"
                >
                  Abort
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 rounded-full bg-gradient-to-r from-primary to-secondary text-black font-black text-[10px] uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(177,255,36,0.3)]"
                >
                  {initialData ? 'Compile Database Updates' : 'Initialize Root Protocol'}
                </button>
              </div>

            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ExerciseModal;
