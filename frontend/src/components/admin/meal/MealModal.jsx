import React, { useState, useEffect } from 'react';

const CUISINES = [
  "american", "south east asian", "chinese", "italian", "french", 
  "mexican", "mediterranean", "eastern europe", "kosher", "nordic", 
  "south american", "middle eastern", "british", "asian", "caribbean", 
  "indian", "japanese", "central europe", "world", "vietnamese"
];

const MealModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cuisineType: 'world',
    imageUrl: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    dietTags: []
  });

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        name: initialData.name || '',
        description: initialData.description || '',
        cuisineType: initialData.cuisineType || 'world',
        imageUrl: initialData.imageUrl || '',
        calories: initialData.calories || 0,
        protein: initialData.protein || 0,
        carbs: initialData.carbs || 0,
        fat: initialData.fat || 0,
        dietTags: initialData.dietTags || []
      });
    } else {
      setFormData({
        name: '',
        description: '',
        cuisineType: 'world',
        imageUrl: '',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        dietTags: []
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleAddTag = (e) => {
    if ((e.key === 'Enter' || e.type === 'click') && tagInput.trim()) {
      e.preventDefault();
      if (!formData.dietTags.includes(tagInput.trim())) {
        setFormData(prev => ({
          ...prev,
          dietTags: [...prev.dietTags, tagInput.trim()]
        }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      dietTags: prev.dietTags.filter(t => t !== tagToRemove)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-surface-container w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2rem] p-6 md:p-10 border border-primary/20 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative">
        <div className="flex justify-between items-start mb-8">
          <div>
            <span className="text-primary font-black uppercase tracking-widest text-[10px]">Culinary Database Entry</span>
            <h3 className="text-3xl font-black italic tracking-tighter uppercase text-white">
              {formData.id ? 'Optimizing Meal' : 'Crafting New Meal'}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-white hover:bg-error transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Core Identity */}
          <div className="space-y-6">
            <div className="space-y-1">
              <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Meal Identity</label>
              <input 
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-[#1a1919] border border-white/5 focus:ring-2 focus:ring-primary rounded-xl px-4 py-3 text-sm text-white" 
                placeholder="e.g. Kinetic Performance Steak" 
                type="text"
              />
            </div>
            
            <div className="space-y-1">
              <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Detailed Narrative</label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full bg-[#1a1919] border border-white/5 focus:ring-2 focus:ring-primary rounded-xl px-4 py-3 text-sm text-white" 
                placeholder="Describe nutritional benefits and flavor profile..." 
                rows="4"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Cuisine Type</label>
                <select 
                  name="cuisineType"
                  value={formData.cuisineType}
                  onChange={handleChange}
                  className="w-full bg-[#1a1919] border border-white/5 focus:ring-2 focus:ring-primary rounded-xl px-4 py-3 text-sm text-white appearance-none capitalize"
                >
                  {CUISINES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Image Resource URL</label>
                <input 
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  className="w-full bg-[#1a1919] border border-white/5 focus:ring-2 focus:ring-primary rounded-xl px-4 py-3 text-sm text-white" 
                  placeholder="https://..." 
                  type="text"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Macro Precision */}
          <div className="space-y-6">
            <div className="bg-surface-container-high rounded-2xl p-6 border border-white/5">
              <label className="block text-[10px] font-black uppercase tracking-widest text-primary mb-4">Macro Precision Profile</label>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <span className="absolute right-3 top-9 text-[10px] font-bold text-on-surface-variant">KCAL</span>
                  <label className="text-[9px] font-bold text-on-surface-variant uppercase">Calories</label>
                  <input 
                    name="calories"
                    value={formData.calories}
                    onChange={handleChange}
                    className="w-full bg-[#1a1919] border border-white/5 focus:ring-1 focus:ring-primary rounded-lg px-3 py-2 text-sm mt-1 text-white" 
                    type="number" 
                  />
                </div>
                <div className="relative">
                  <span className="absolute right-3 top-9 text-[10px] font-bold text-on-surface-variant">G</span>
                  <label className="text-[9px] font-bold text-on-surface-variant uppercase">Protein</label>
                  <input 
                    name="protein"
                    value={formData.protein}
                    onChange={handleChange}
                    className="w-full bg-[#1a1919] border border-white/5 focus:ring-1 focus:ring-primary rounded-lg px-3 py-2 text-sm mt-1 text-white" 
                    type="number" 
                  />
                </div>
                <div className="relative">
                  <span className="absolute right-3 top-9 text-[10px] font-bold text-on-surface-variant">G</span>
                  <label className="text-[9px] font-bold text-on-surface-variant uppercase">Carbs</label>
                  <input 
                    name="carbs"
                    value={formData.carbs}
                    onChange={handleChange}
                    className="w-full bg-[#1a1919] border border-white/5 focus:ring-1 focus:ring-primary rounded-lg px-3 py-2 text-sm mt-1 text-white" 
                    type="number" 
                  />
                </div>
                <div className="relative">
                  <span className="absolute right-3 top-9 text-[10px] font-bold text-on-surface-variant">G</span>
                  <label className="text-[9px] font-bold text-on-surface-variant uppercase">Fat</label>
                  <input 
                    name="fat"
                    value={formData.fat}
                    onChange={handleChange}
                    className="w-full bg-[#1a1919] border border-white/5 focus:ring-1 focus:ring-primary rounded-lg px-3 py-2 text-sm mt-1 text-white" 
                    type="number" 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Dietary Classification Tags</label>
              <div className="flex flex-wrap gap-2 mb-3 min-h-[40px] p-2 bg-[#1a1919] rounded-xl border border-white/5">
                {formData.dietTags.map((tag, idx) => (
                  <span key={idx} className="bg-primary text-on-primary text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 group">
                    {tag}
                    <span 
                      onClick={() => removeTag(tag)}
                      className="material-symbols-outlined text-[12px] cursor-pointer hover:scale-125 transition-transform"
                    >
                      close
                    </span>
                  </span>
                ))}
                <div className="flex-1 min-w-[100px]">
                  <input 
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="+ New Tag"
                    className="w-full bg-transparent border-none focus:ring-0 text-[10px] text-white py-0"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex gap-4">
              <button 
                type="button"
                onClick={() => setFormData({
                  name: '',
                  description: '',
                  cuisineType: 'world',
                  imageUrl: '',
                  calories: 0,
                  protein: 0,
                  carbs: 0,
                  fat: 0,
                  dietTags: []
                })}
                className="flex-1 py-4 border border-white/10 text-on-surface-variant font-bold rounded-full hover:bg-white/5 transition-colors uppercase tracking-widest text-[10px]"
              >
                Reset Matrix
              </button>
              <button 
                type="submit"
                className="flex-1 py-4 bg-gradient-to-r from-primary to-secondary text-black font-black rounded-full shadow-[0_0_20px_rgba(177,255,36,0.3)] transition-transform active:scale-95 uppercase tracking-widest text-[10px]"
              >
                Sync to Database
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MealModal;
