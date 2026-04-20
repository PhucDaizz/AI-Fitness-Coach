import React from 'react';

const BentoStats = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      {/* User Metrics Scorecards */}
      <div className="md:col-span-4 grid grid-cols-1 gap-6">
        <div className="bg-surface-container p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <span className="material-symbols-outlined text-8xl">wifi_tethering</span>
          </div>
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-1">Active Online Users</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-5xl font-black text-white tracking-tighter">1,284</h2>
            <span className="text-primary text-xs font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">arrow_upward</span> 12%
            </span>
          </div>
          <div className="mt-6 flex gap-1 items-end h-8">
            <div className="w-2 bg-primary/20 h-4 rounded-full"></div>
            <div className="w-2 bg-primary/40 h-6 rounded-full"></div>
            <div className="w-2 bg-primary h-8 rounded-full"></div>
            <div className="w-2 bg-primary/60 h-5 rounded-full"></div>
            <div className="w-2 bg-primary/30 h-3 rounded-full"></div>
            <div className="w-2 bg-primary/80 h-7 rounded-full"></div>
          </div>
        </div>
        
        <div className="bg-surface-container p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <span className="material-symbols-outlined text-8xl">group</span>
          </div>
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-1">Total System Users</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-5xl font-black text-white tracking-tighter">48.2k</h2>
            <span className="text-secondary text-xs font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">trending_up</span> +2.4k
            </span>
          </div>
          <p className="text-[0.65rem] text-on-surface-variant mt-4 font-medium italic">Peak concurrency reached 14h ago</p>
        </div>
      </div>

      {/* Total Token Consumption Chart */}
      <div className="md:col-span-8 bg-surface-container p-6 rounded-3xl flex flex-col">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Total Token Consumption</h3>
            <p className="text-xs text-on-surface-variant">Kinetic Engine Processing Load</p>
          </div>
          <div className="flex gap-2 bg-surface-container-highest p-1 rounded-full">
            <button className="px-4 py-1 text-[10px] font-bold uppercase tracking-widest bg-primary text-on-primary rounded-full">Day</button>
            <button className="px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-white">Week</button>
            <button className="px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-white">Month</button>
          </div>
        </div>
        
        <div className="flex-1 relative flex items-end gap-1.5 min-h-[200px]">
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 100">
            <defs>
              <linearGradient id="lineGrad" x1="0%" x2="0%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="#b1ff24" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#b1ff24" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,80 Q40,40 80,60 T160,20 T240,70 T320,30 T400,10" fill="transparent" stroke="#b1ff24" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            <path d="M0,80 Q40,40 80,60 T160,20 T240,70 T320,30 T400,10 V100 H0 Z" fill="url(#lineGrad)" vectorEffect="non-scaling-stroke" />
          </svg>
          <div className="absolute inset-0 flex flex-col justify-between opacity-5 pointer-events-none">
            <div className="h-px bg-white w-full"></div>
            <div className="h-px bg-white w-full"></div>
            <div className="h-px bg-white w-full"></div>
            <div className="h-px bg-white w-full"></div>
          </div>
        </div>
        
        <div className="flex justify-between mt-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>23:59</span>
        </div>
      </div>
    </div>
  );
};

export default BentoStats;
