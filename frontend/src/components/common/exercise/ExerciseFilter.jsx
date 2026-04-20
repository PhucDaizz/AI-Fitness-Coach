import React, { useState } from 'react';

const ExerciseFilter = ({ filters, onFilterChange, lookups, isAdmin = false }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [localSearch, setLocalSearch] = useState(filters.searchTerm);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    onFilterChange('searchTerm', localSearch);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearchSubmit();
  };

  const handleReset = () => {
    setLocalSearch('');
    onFilterChange('reset', null);
  };

  const toggleLocation = (loc) => {
    let current = [];
    if (filters.locationTypes) {
      current = typeof filters.locationTypes === 'string' ? filters.locationTypes.split(',') : [...filters.locationTypes];
    }
    
    if (current.includes(loc)) {
      current = current.filter(l => l !== loc);
    } else {
      current.push(loc);
    }
    onFilterChange('locationTypes', current.join(','));
  };

  // Check if location is active
  const isLocationActive = (loc) => {
    if (!filters.locationTypes) return false;
    const current = typeof filters.locationTypes === 'string' ? filters.locationTypes.split(',') : filters.locationTypes;
    return current.includes(loc);
  };

  return (
    <div className="space-y-6 mb-8">
      {/* Search Bar */}
      <div className="bg-surface-container rounded-2xl p-4 flex items-center gap-4 border border-white/5 focus-within:ring-1 focus-within:ring-primary/20 transition-all shadow-lg">
        <span className="material-symbols-outlined text-primary">search</span>
        <input 
          type="text" 
          placeholder="Decode protocol name or ID... (Press Enter to rapid search)"
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
            Sync Search
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 overflow-hidden transition-all duration-500 ${showAdvanced ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        
        {/* Category Select */}
        <div className="bg-surface-container p-3 rounded-xl border border-white/5 space-y-1">
          <label className="block text-[9px] uppercase tracking-widest text-on-surface-variant font-black">Movement Class</label>
          <select 
            value={filters.categoryIds}
            onChange={e => onFilterChange('categoryIds', e.target.value)}
            className="w-full bg-[#1a1919] border-none text-xs rounded-lg focus:ring-1 focus:ring-primary py-1.5 px-2 text-white"
          >
            <option value="">All Regions</option>
            {lookups.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* Muscle Group Select */}
        <div className="bg-surface-container p-3 rounded-xl border border-white/5 space-y-1">
          <label className="block text-[9px] uppercase tracking-widest text-[#adaaaa] font-black">Biometric Target</label>
          <select 
            value={filters.muscleGroupIds}
            onChange={e => onFilterChange('muscleGroupIds', e.target.value)}
            className="w-full bg-[#1a1919] border-none text-xs rounded-lg focus:ring-1 focus:ring-primary py-1.5 px-2 text-white"
          >
            <option value="">Full Anatomy</option>
            {lookups.muscles.map(m => <option key={m.id} value={m.id}>{m.nameEN}</option>)}
          </select>
        </div>

        {/* Equipment Select */}
        <div className="bg-surface-container p-3 rounded-xl border border-white/5 space-y-1">
          <label className="block text-[9px] uppercase tracking-widest text-[#adaaaa] font-black">Hardware Requirement</label>
          <select 
            value={filters.equipmentIds}
            onChange={e => onFilterChange('equipmentIds', e.target.value)}
            className="w-full bg-[#1a1919] border-none text-xs rounded-lg focus:ring-1 focus:ring-primary py-1.5 px-2 text-white"
          >
            <option value="">Agnostic</option>
            {lookups.equipment.map(eq => <option key={eq.id} value={eq.id}>{eq.name}</option>)}
          </select>
        </div>

        {/* Environment Filter (Multiple tags) */}
        <div className="bg-surface-container p-3 rounded-xl border border-white/5 space-y-2 lg:col-span-2 text-center flex flex-col justify-center">
          <label className="block text-[9px] uppercase tracking-widest text-on-surface-variant font-black">Environmental Vector</label>
          <div className="flex justify-center gap-2">
            {['Gym', 'Home', 'Outdoor'].map(loc => (
              <button 
                key={loc}
                onClick={() => toggleLocation(loc)}
                className={`px-3 py-1 text-[9px] font-black uppercase rounded-lg transition-colors border ${
                  isLocationActive(loc) ? 'bg-primary/20 text-primary border-primary' : 'bg-transparent text-on-surface-variant border-white/10 hover:bg-white/5'
                }`}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>

        {/* Admin Only Sync Status */}
        {isAdmin && (
          <div className="bg-surface-container p-3 rounded-xl border border-white/5 space-y-1">
            <label className="block text-[9px] uppercase tracking-widest text-secondary font-black">AI Sync Status</label>
            <select 
              value={filters.embedStatus === null ? '' : filters.embedStatus}
              onChange={e => onFilterChange('embedStatus', e.target.value)}
              className="w-full bg-[#1a1919] border-none text-xs rounded-lg focus:ring-1 focus:ring-primary py-1.5 px-2 text-white"
            >
              <option value="">All Status</option>
              <option value="2">Synced (Embedded)</option>
              <option value="1">Pending Analysis</option>
              <option value="3">Skipped</option>
            </select>
          </div>
        )}

        {/* Sorting Logic */}
        <div className="bg-surface-container p-3 rounded-xl border border-white/5 space-y-1">
          <label className="block text-[9px] uppercase tracking-widest text-on-surface-variant font-black">Sort Protocol</label>
          <select 
            value={filters.sortBy}
            onChange={e => onFilterChange('sortBy', e.target.value)}
            className="w-full bg-[#1a1919] border-none text-xs rounded-lg focus:ring-1 focus:ring-primary py-1.5 px-2 text-white"
          >
            <option value="CreatedAt">Recent Matrix</option>
            <option value="Name">Alpha Designation</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => onFilterChange('sortDescending', !filters.sortDescending)}
            className="flex-1 h-8 flex items-center justify-between px-3 bg-[#1a1919] rounded-lg text-[9px] font-black text-white hover:text-primary transition-all border border-white/5"
            title="Sort Direction"
          >

            <span>{filters.sortDescending ? 'DESC' : 'ASC'}</span>
            <span className="material-symbols-outlined text-[14px]">
              {filters.sortDescending ? 'south' : 'north'}
            </span>
          </button>
          <button 
            onClick={handleReset}
            className="w-8 h-8 flex items-center justify-center text-error hover:bg-error/10 rounded-lg transition-all"
            title="Purge Filters"
          >
            <span className="material-symbols-outlined text-[18px]">restart_alt</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExerciseFilter;
