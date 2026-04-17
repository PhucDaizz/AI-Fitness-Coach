import React from 'react';

const MetricWidgets = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Tool Usage Distribution */}
      <div className="bg-surface-container p-6 rounded-3xl flex flex-col h-full">
        <h3 className="text-sm font-bold text-white uppercase tracking-[0.15em] mb-8">Tool Usage Distribution</h3>
        <div className="relative flex items-center justify-center flex-1 py-4">
          <div className="w-40 h-40 rounded-full flex items-center justify-center relative overflow-hidden" style={{ background: 'conic-gradient(#b1ff24 0% 50%, #6a9cff 50% 60%, #494847 60% 85%, #262626 85% 100%)' }}>
            <div className="w-32 h-32 rounded-full bg-surface-container flex flex-col items-center justify-center z-10 shadow-inner">
              <span className="text-3xl font-black text-white">50%</span>
              <span className="text-[8px] font-bold text-on-surface-variant uppercase tracking-widest">Primary Action</span>
            </div>
          </div>
        </div>
        <div className="mt-8 space-y-3">
          {[
            { color: 'bg-primary', label: 'generate_workout_plan', value: '50%' },
            { color: 'bg-secondary', label: 'log_workout', value: '10%' },
            { color: 'bg-outline', label: 'nutrition_advice', value: '25%' },
            { color: 'bg-surface-variant', label: 'Other', value: '15%' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                <span className="text-xs text-on-surface-variant font-medium">{item.label}</span>
              </div>
              <span className="text-xs font-bold text-white">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Difficulty Feedback Loop */}
      <div className="bg-surface-container p-6 rounded-3xl flex flex-col h-full">
        <h3 className="text-sm font-bold text-white uppercase tracking-[0.15em] mb-8">Difficulty Feedback Loop</h3>
        <div className="flex-1 flex flex-col justify-center space-y-8">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-xs font-bold text-white uppercase tracking-widest">Too Easy</span>
              <span className="text-xs font-medium text-on-surface-variant">15%</span>
            </div>
            <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
              <div className="h-full bg-secondary w-[15%]"></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-xs font-bold text-white uppercase tracking-widest">Just Right</span>
              <span className="text-xs font-medium text-on-surface-variant">72%</span>
            </div>
            <div className="h-4 bg-surface-container-highest rounded-full overflow-hidden">
              <div className="h-full bg-primary w-[72%] shadow-[0_0_15px_rgba(177,255,36,0.3)]"></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-xs font-bold text-white uppercase tracking-widest">Too Hard</span>
              <span className="text-xs font-medium text-on-surface-variant">13%</span>
            </div>
            <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
              <div className="h-full bg-error w-[13%]"></div>
            </div>
          </div>
        </div>
        <div className="mt-8 p-4 bg-surface-container-highest rounded-2xl border-l-2 border-primary/40">
          <p className="text-[0.65rem] text-primary font-bold uppercase tracking-widest mb-1">Coach Insight</p>
          <p className="text-xs text-on-surface-variant">"Just Right" ratings up 4.2% since V2.4 model weights update.</p>
        </div>
      </div>

      {/* Plan Completion Rate */}
      <div className="bg-surface-container p-6 rounded-3xl flex flex-col h-full overflow-hidden relative">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
        <h3 className="text-sm font-bold text-white uppercase tracking-[0.15em] mb-8">Plan Completion Rate</h3>
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="relative w-48 h-48">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" fill="transparent" r="45" stroke="#262626" strokeWidth="8"></circle>
              <circle cx="50" cy="50" fill="transparent" r="45" stroke="#b1ff24" strokeDasharray="282.7" strokeDashoffset="45.2" strokeLinecap="round" strokeWidth="8"></circle>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-black text-white italic tracking-tighter">84<span className="text-2xl">%</span></span>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] mt-1">Avg Rate</span>
            </div>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="bg-surface-container-highest p-4 rounded-2xl">
            <p className="text-2xl font-bold text-white">4.2</p>
            <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Avg Sets / User</p>
          </div>
          <div className="bg-surface-container-highest p-4 rounded-2xl">
            <p className="text-2xl font-bold text-white">92%</p>
            <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">Retention</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricWidgets;
