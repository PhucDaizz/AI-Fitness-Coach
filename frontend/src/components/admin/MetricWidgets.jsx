import React, { useState, useEffect } from 'react';
import { getToolUsageChartData } from '../../services/api/system.service';

const MetricWidgets = () => {
  // Tool Usage States
  const [toolData, setToolData] = useState([]);
  const [toolTimeFrame, setToolTimeFrame] = useState(1); // 1: 7Days, 2: ThisMonth, 3: ThisYear, 4: AllTime
  const [isLoadingTool, setIsLoadingTool] = useState(true);

  // Fetch Tool Usage Chart data
  useEffect(() => {
    const fetchToolChart = async () => {
      try {
        setIsLoadingTool(true);
        const data = await getToolUsageChartData(toolTimeFrame);
        setToolData(data || []);
      } catch (err) {
        console.error("Failed to fetch tool usage chart:", err);
      } finally {
        setIsLoadingTool(false);
      }
    };
    fetchToolChart();
  }, [toolTimeFrame]);

  // Tool Usage Calculation
  const toolColors = ['#b1ff24', '#00e5ff', '#b388ff', '#ff4081', '#ffea00'];
  const totalToolUsage = toolData.reduce((sum, item) => sum + item.totalUsage, 0);
  
  let currentAngle = 0;
  const toolPieSlices = toolData.map((item, i) => {
    const percentage = totalToolUsage === 0 ? 0 : item.totalUsage / totalToolUsage;
    const endAngle = currentAngle + percentage * 360;
    const slice = { startAngle: currentAngle, endAngle, percentage, color: toolColors[i % toolColors.length], ...item };
    currentAngle = endAngle;
    return slice;
  });
  
  const conicGradientStr = toolData.length > 0
    ? toolPieSlices.map(s => `${s.color} ${s.startAngle}deg ${s.endAngle}deg`).join(', ')
    : '#1a1a1a';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Tool Usage Distribution (Real Data) */}
      <div className="bg-surface-container p-6 rounded-3xl flex flex-col h-full relative overflow-hidden group">
        <div className="absolute -bottom-8 -right-8 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
          <span className="material-symbols-outlined text-[150px]">memory</span>
        </div>

        <div className="flex justify-between items-start mb-8 relative z-10">
          <h3 className="text-sm font-bold text-white uppercase tracking-[0.15em]">Tool Usage Distribution</h3>
          <select 
            value={toolTimeFrame}
            onChange={(e) => setToolTimeFrame(parseInt(e.target.value))}
            className="bg-[#1a1919] border border-white/5 text-[9px] font-black uppercase tracking-widest text-on-surface-variant focus:text-white rounded-lg py-1 px-2 focus:ring-1 focus:ring-primary cursor-pointer outline-none"
          >
            <option value={1}>7 Days</option>
            <option value={2}>This Month</option>
            <option value={3}>This Year</option>
            <option value={4}>All Time</option>
          </select>
        </div>

        <div className="relative flex items-center justify-center flex-1 min-h-[160px] z-10">
          {isLoadingTool ? (
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          ) : toolData.length === 0 ? (
            <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest italic">No tool executions recorded</p>
          ) : (
            <div 
              className="w-40 h-40 rounded-full flex items-center justify-center relative shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-white/5" 
              style={{ background: `conic-gradient(${conicGradientStr})` }}
            >
              <div className="w-32 h-32 rounded-full bg-surface-container flex flex-col items-center justify-center z-10 shadow-inner border border-white/5">
                <span className="text-3xl font-black text-white italic tracking-tighter">{totalToolUsage.toLocaleString()}</span>
                <span className="text-[8px] font-bold text-on-surface-variant uppercase tracking-widest">Total Calls</span>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 space-y-3 z-10 max-h-[140px] overflow-y-auto pr-1">
          {toolData.map((item, i) => {
            const percent = totalToolUsage === 0 ? 0 : Math.round((item.totalUsage / totalToolUsage) * 100);
            const color = toolColors[i % toolColors.length];
            return (
              <div key={item.toolName} className="flex items-center justify-between group/item">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shadow-lg" style={{ backgroundColor: color, boxShadow: `0 0 5px ${color}` }}></div>
                  <span className="text-[10px] text-on-surface-variant font-bold uppercase truncate max-w-[120px]">
                    {item.toolName.replace('search_', '').replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                   <span className="text-[10px] font-black text-white">{item.totalUsage}</span>
                   <span className="text-[9px] font-medium text-outline-variant">{percent}%</span>
                </div>
              </div>
            );
          })}
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
