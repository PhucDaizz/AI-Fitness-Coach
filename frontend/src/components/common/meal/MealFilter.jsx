import React, { useState } from 'react';

const CUISINES = [
  "american", "south east asian", "chinese", "italian", "french", 
  "mexican", "mediterranean", "eastern europe", "kosher", "nordic", 
  "south american", "middle eastern", "british", "asian", "caribbean", 
  "indian", "japanese", "central europe", "world", "vietnamese"
];

const MealFilter = ({ filters, onFilterChange, isAdmin = false }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [localSearch, setLocalSearch] = useState(filters.searchTerm);
  const [tagInput, setTagInput] = useState('');

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    onFilterChange('searchTerm', localSearch);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearchSubmit();
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      if (!filters.dietTags.includes(tagInput.trim())) {
        onFilterChange('dietTags', [...filters.dietTags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    onFilterChange('dietTags', filters.dietTags.filter(t => t !== tag));
  };

  const handleReset = () => {
    setLocalSearch('');
    onFilterChange('reset', null);
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="bg-surface-container rounded-2xl p-4 flex items-center gap-4 border border-white/5 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
        <span className="material-symbols-outlined text-primary">search</span>
        <input 
          type="text" 
          placeholder="Search performance meals... (Enter to confirm)"
          value={localSearch}
          onChange={e => setLocalSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          className="bg-transparent border-none focus:ring-0 text-white text-sm w-full placeholder:text-outline-variant"
        />
        <div className="flex gap-2">
          <button 
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`p-2 rounded-xl transition-all ${showAdvanced ? 'bg-primary text-black' : 'text-on-surface-variant hover:bg-white/5'}`}
            title="Advanced Filters"
          >
            <span className="material-symbols-outlined leading-none text-[20px]">tune</span>
          </button>
          <button 
            onClick={handleSearchSubmit}
            className="bg-surface-container-highest text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all shadow-lg"
          >
            Go
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 overflow-hidden transition-all duration-500 ${showAdvanced ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        {/* Cuisine Select */}
        <div className="bg-surface-container p-3 rounded-xl border border-white/5 space-y-1">
          <label className="block text-[9px] uppercase tracking-widest text-on-surface-variant font-black">Cuisine</label>
          <select 
            value={filters.cuisineType}
            onChange={e => onFilterChange('cuisineType', e.target.value)}
            className="w-full bg-[#1a1919] border-none text-xs rounded-lg focus:ring-1 focus:ring-primary py-1.5 px-2 text-white capitalize"
          >
            <option value="">All Cuisines</option>
            {CUISINES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Nutritional Range: Calories */}
        <div className="bg-surface-container p-3 rounded-xl border border-white/5">
          <label className="block text-[9px] uppercase tracking-widest text-on-surface-variant font-black mb-2">Calories (Kcal)</label>
          <div className="flex items-center gap-2">
            <input 
              type="number" placeholder="Min"
              value={filters.caloriesFrom}
              onChange={e => onFilterChange('caloriesFrom', e.target.value)}
              className="w-full bg-[#1a1919] border-none text-[10px] rounded p-1 text-white text-center"
            />
            <input 
              type="number" placeholder="Max"
              value={filters.caloriesTo}
              onChange={e => onFilterChange('caloriesTo', e.target.value)}
              className="w-full bg-[#1a1919] border-none text-[10px] rounded p-1 text-white text-center"
            />
          </div>
        </div>

        {/* Nutritional Range: Protein */}
        <div className="bg-surface-container p-3 rounded-xl border border-white/5">
          <label className="block text-[9px] uppercase tracking-widest text-primary font-black mb-2">Protein (g)</label>
          <div className="flex items-center gap-2">
            <input 
              type="number" placeholder="Min"
              value={filters.proteinFrom}
              onChange={e => onFilterChange('proteinFrom', e.target.value)}
              className="w-full bg-[#1a1919] border-none text-[10px] rounded p-1 text-white text-center"
            />
            <input 
              type="number" placeholder="Max"
              value={filters.proteinTo}
              onChange={e => onFilterChange('proteinTo', e.target.value)}
              className="w-full bg-[#1a1919] border-none text-[10px] rounded p-1 text-white text-center"
            />
          </div>
        </div>

        {/* Admin Only Sync Status */}
        {isAdmin && (
          <div className="bg-surface-container p-3 rounded-xl border border-white/5 space-y-1">
            <label className="block text-[9px] uppercase tracking-widest text-secondary font-black">AI Sync Status</label>
            <select 
              value={filters.embedStatus}
              onChange={e => onFilterChange('embedStatus', e.target.value)}
              className="w-full bg-[#1a1919] border-none text-xs rounded-lg focus:ring-1 focus:ring-primary py-1.5 px-2 text-white"
            >
              <option value="">All Status</option>
              <option value="embedded">Synced</option>
              <option value="pending">Pending</option>
              <option value="skip">Skipped</option>
            </select>
          </div>
        )}

        {/* Diet Tags */}
        <div className="bg-surface-container p-3 rounded-xl border border-white/5 lg:col-span-2 space-y-2">
          <label className="block text-[9px] uppercase tracking-widest text-on-surface-variant font-black">Dietary Filters</label>
          <div className="flex flex-wrap gap-1 max-h-[60px] overflow-y-auto no-scrollbar">
            {filters.dietTags.map(tag => (
              <span key={tag} className="px-2 py-0.5 bg-primary/20 text-primary text-[8px] font-bold rounded flex items-center gap-1">
                {tag}
                <span onClick={() => removeTag(tag)} className="material-symbols-outlined text-[10px] cursor-pointer">close</span>
              </span>
            ))}
            <input 
              type="text" placeholder="+ Tag (Enter)"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              className="bg-transparent border-none focus:ring-0 text-[10px] text-white p-0 ml-1 min-w-[80px]"
            />
          </div>
        </div>

        {/* Sorting Logic */}
        <div className="bg-surface-container p-3 rounded-xl border border-white/5 space-y-1">
          <label className="block text-[9px] uppercase tracking-widest text-on-surface-variant font-black">Sort Field</label>
          <select 
            value={filters.sortBy}
            onChange={e => onFilterChange('sortBy', e.target.value)}
            className="w-full bg-[#1a1919] border-none text-xs rounded-lg focus:ring-1 focus:ring-primary py-1.5 px-2 text-white"
          >
            <option value="CreatedAt">Recent</option>
            <option value="Name">ABC Name</option>
            <option value="Calories">Energy</option>
            <option value="Protein">Protein</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => onFilterChange('sortDescending', !filters.sortDescending)}
            className="flex-1 h-8 flex items-center justify-between px-3 bg-[#1a1919] rounded-lg text-[9px] font-black text-white hover:text-primary transition-all border border-white/5"
          >
            <span>{filters.sortDescending ? 'DESC' : 'ASC'}</span>
            <span className="material-symbols-outlined text-[14px]">
              {filters.sortDescending ? 'south' : 'north'}
            </span>
          </button>
          <button 
            onClick={handleReset}
            className="p-2 text-error hover:bg-error/10 rounded-lg transition-all"
            title="Reset Filters"
          >
            <span className="material-symbols-outlined">restart_alt</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MealFilter;
