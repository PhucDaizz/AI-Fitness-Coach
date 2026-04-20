import React from 'react';

const StrategicInsights = () => {
  return (
    <div className="bg-surface-container p-8 rounded-[2.5rem] relative overflow-hidden">
      <div className="flex flex-col md:flex-row gap-12 items-center relative z-10">
        <div className="md:w-1/3">
          <h3 className="text-2xl font-black text-white mb-4 italic tracking-tight uppercase">Strategic Insights</h3>
          <p className="text-sm text-on-surface-variant leading-relaxed mb-6 font-medium">User goal alignment dictates our next model fine-tuning cycle. Muscle Gain continues to dominate volume, requiring higher density training data sets.</p>
          <button className="px-8 py-3 bg-primary text-on-primary rounded-full text-xs font-bold uppercase tracking-widest hover:scale-105 transition-transform active:scale-95 shadow-[0_10px_20px_rgba(177,255,36,0.2)]">
            Export Raw Data
          </button>
        </div>
        <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
          {/* Muscle Gain Card */}
          <div className="bg-surface-container-highest p-6 rounded-3xl border border-primary/10 relative group">
            <span className="material-symbols-outlined text-primary mb-4 block" style={{ fontVariationSettings: "'FILL' 1" }}>fitness_center</span>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Muscle Gain</p>
            <h4 className="text-4xl font-black text-white">62%</h4>
            <div className="mt-6 h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-primary w-[62%]"></div>
            </div>
          </div>
          {/* Fat Loss Card */}
          <div className="bg-surface-container-highest p-6 rounded-3xl border border-secondary/10 relative group">
            <span className="material-symbols-outlined text-secondary mb-4 block" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Fat Loss</p>
            <h4 className="text-4xl font-black text-white">28%</h4>
            <div className="mt-6 h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-secondary w-[28%]"></div>
            </div>
          </div>
          {/* Overall Health Card */}
          <div className="bg-surface-container-highest p-6 rounded-3xl border border-white/5 relative group">
            <span className="material-symbols-outlined text-white mb-4 block" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Overall Health</p>
            <h4 className="text-4xl font-black text-white">10%</h4>
            <div className="mt-6 h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-white/40 w-[10%]"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background visual element */}
      <div className="absolute -right-20 -bottom-20 opacity-5">
        <span className="text-[20rem] font-black italic select-none">GOALS</span>
      </div>
    </div>
  );
};

export default StrategicInsights;
