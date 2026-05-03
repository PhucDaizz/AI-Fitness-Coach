import React, { useState, useEffect } from 'react';
import { syncMealEmbedding } from '../../../services/api/meal.service';

const CUISINES = [
  "american", "south east asian", "chinese", "italian", "french", 
  "mexican", "mediterranean", "eastern europe", "kosher", "nordic", 
  "south american", "middle eastern", "british", "asian", "caribbean", 
  "indian", "japanese", "central europe", "world", "vietnamese"
];

const DEFAULT_PREVIEW = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop';

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

  const [syncing, setSyncing] = useState(false);

  const [tagInput, setTagInput] = useState('');
  const [previewUrl, setPreviewUrl] = useState(DEFAULT_PREVIEW);

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
      setPreviewUrl(initialData.imageUrl || DEFAULT_PREVIEW);
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
      setPreviewUrl(DEFAULT_PREVIEW);
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const val = type === 'number' ? parseFloat(value) : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: val
    }));

    if (name === 'imageUrl') {
      setPreviewUrl(value || DEFAULT_PREVIEW);
    }
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

  const handleSyncEmbedding = async () => {
    if (!formData.id) return;
    
    try {
      setSyncing(true);
      await syncMealEmbedding(formData.id);
      alert('Đã đồng bộ Vector Món ăn thành công.');
    } catch (err) {
      console.error('Failed to sync meal embedding:', err);
      alert(err.message || 'Có lỗi khi đồng bộ Vector Món ăn.');
    } finally {
      setSyncing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[120] flex items-center justify-center p-4">
      <div className="bg-surface-container w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-6 md:p-10 border border-primary/20 shadow-[0_0_80px_rgba(0,0,0,0.9)] relative no-scrollbar">
        {/* Modal Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px]">Culinary Profile Architecture</span>
            <h3 className="text-4xl font-black italic tracking-tighter uppercase text-white">
              {formData.id ? 'Optimizing' : 'Initializing'} <span className="text-primary">Meal</span>
            </h3>
          </div>
          <div className="flex items-center gap-3">
            {formData.id && (
              <button 
                type="button" 
                onClick={handleSyncEmbedding}
                disabled={syncing}
                className="h-12 px-6 rounded-full bg-primary/10 text-primary font-black text-[10px] uppercase tracking-[0.2em] hover:bg-primary/20 transition-all border border-primary/20 disabled:opacity-50 flex items-center gap-2 shadow-lg"
              >
                <span className={`material-symbols-outlined text-[18px] ${syncing ? 'animate-spin' : ''}`}>
                  {syncing ? 'sync' : 'database'}
                </span>
                {syncing ? 'Syncing...' : 'Sync Embedding'}
              </button>
            )}
            <button 
              onClick={onClose}
              className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center text-white hover:bg-error hover:scale-110 transition-all shadow-lg"
            >
              <span className="material-symbols-outlined font-bold">close</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left: Image Preview & Assets (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant italic">Visual Asset Preview</label>
              <div className="aspect-square w-full rounded-2xl bg-[#1a1919] border border-white/5 overflow-hidden relative group shadow-2xl">
                <img 
                  src={previewUrl} 
                  onError={() => setPreviewUrl(DEFAULT_PREVIEW)}
                  alt="Meal Preview"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                   <span className="bg-primary/20 backdrop-blur-md border border-primary/20 text-primary text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Live Visual Source</span>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Image Resource URL</label>
              <input 
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                className="w-full bg-[#1a1919] border border-white/5 focus:ring-2 focus:ring-primary rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/10" 
                placeholder="https://images.unsplash.com/..." 
                type="text"
              />
            </div>
          </div>

          {/* Right: Core Intelligence & Macros (8 Cols) */}
          <div className="lg:col-span-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant italic">Protocol Name</label>
                <input 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#1a1919] border border-white/5 focus:ring-2 focus:ring-primary rounded-xl px-4 py-3 text-sm text-white font-bold" 
                  placeholder="e.g. Kinetic Performance Steak" 
                  type="text"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant italic">Cuisine Taxonomy</label>
                <select 
                  name="cuisineType"
                  value={formData.cuisineType}
                  onChange={handleChange}
                  className="w-full bg-[#1a1919] border border-white/5 focus:ring-2 focus:ring-primary rounded-xl px-4 py-3 text-sm text-white appearance-none capitalize cursor-pointer font-bold"
                >
                  {CUISINES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant italic">Detailed Narrative (Description)</label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full bg-[#1a1919] border border-white/5 focus:ring-2 focus:ring-primary rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/5 scrollbar-thin" 
                placeholder="Brief but impactful description of this culinary profile..." 
                rows="4"
              ></textarea>
            </div>

            {/* Macro Matrix */}
            <div className="bg-[#1a1919] rounded-2xl p-6 border border-white/5 shadow-inner">
              <label className="block text-[10px] font-black uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                Macro Nutritional Matrix
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest">Energy (Kcal)</label>
                  <input 
                    name="calories"
                    value={formData.calories}
                    onChange={handleChange}
                    className="w-full bg-surface-container border-none focus:ring-1 focus:ring-primary rounded-lg px-3 py-3 text-sm text-white font-mono" 
                    type="number" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-primary uppercase tracking-widest">Protein (g)</label>
                  <input 
                    name="protein"
                    value={formData.protein}
                    onChange={handleChange}
                    className="w-full bg-surface-container border-none focus:ring-1 focus:ring-primary rounded-lg px-3 py-3 text-sm text-white font-mono" 
                    type="number" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-secondary uppercase tracking-widest">Carbs (g)</label>
                  <input 
                    name="carbs"
                    value={formData.carbs}
                    onChange={handleChange}
                    className="w-full bg-surface-container border-none focus:ring-1 focus:ring-primary rounded-lg px-3 py-3 text-sm text-white font-mono" 
                    type="number" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-error uppercase tracking-widest">Fat (g)</label>
                  <input 
                    name="fat"
                    value={formData.fat}
                    onChange={handleChange}
                    className="w-full bg-surface-container border-none focus:ring-1 focus:ring-primary rounded-lg px-3 py-3 text-sm text-white font-mono" 
                    type="number" 
                  />
                </div>
              </div>
            </div>

            {/* Dietary Tags */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-widest text-on-surface-variant italic">Dietary Classification Tokens</label>
              <div className="flex flex-wrap gap-2 min-h-[50px] p-3 bg-[#1a1919] rounded-xl border border-white/5">
                {formData.dietTags.map((tag, idx) => (
                  <span key={idx} className="bg-primary text-black text-[9px] font-black px-4 py-1.5 rounded-full flex items-center gap-2 group transition-all hover:pr-2">
                    {tag}
                    <span 
                      onClick={() => removeTag(tag)}
                      className="material-symbols-outlined text-[14px] cursor-pointer hover:scale-125 font-bold"
                    >
                      close
                    </span>
                  </span>
                ))}
                <input 
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="+ New Classification"
                  className="bg-transparent border-none focus:ring-0 text-[10px] text-white py-0 min-w-[150px] uppercase font-bold"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 flex gap-4">
              <button 
                type="button"
                onClick={onClose}
                className="px-10 py-4 border border-white/10 text-on-surface-variant font-black rounded-full hover:bg-white/5 transition-all uppercase tracking-widest text-[10px]"
              >
                Abort Changes
              </button>

              <button 
                type="submit"
                className="flex-1 py-4 bg-gradient-to-r from-primary to-secondary text-black font-black rounded-full shadow-[0_0_30px_rgba(177,255,36,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest text-[10px]"
              >
                {formData.id ? 'Authorize Database Update' : 'Initialize New Culinary Record'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MealModal;
