import React, { useState, useEffect } from 'react';
import useChatSignalR from '../../hooks/useChatSignalR';
import { getTotalUsers } from '../../services/api/system.service';

const BentoStats = () => {
  const [onlineCount, setOnlineCount] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);

  // Fetch static system metrics on mount
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const count = await getTotalUsers();
        setTotalUsers(count);
      } catch (err) {
        console.error("Failed to sync system volume:", err);
      }
    };
    fetchMetrics();
  }, []);

  // Bind to SignalR for real-time user metrics
  useChatSignalR({
    UpdateOnlineUsersCount: (count) => {
      setOnlineCount(count);
    }
  });

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
            <h2 className="text-5xl font-black text-white tracking-tighter">
              {onlineCount.toLocaleString()}
            </h2>
            <div className="flex items-center gap-1.5 ml-1">
               <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
               </span>
               <span className="text-[10px] font-black uppercase text-primary tracking-widest -mb-0.5">Live</span>
            </div>
          </div>
          <div className="mt-6 flex gap-1 items-end h-8">
            <div className="w-2 bg-primary/20 h-4 rounded-full"></div>
            <div className="w-2 bg-primary/40 h-6 rounded-full"></div>
            <div className="w-2 bg-primary h-8 rounded-full animate-pulse"></div>
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
            <h2 className="text-5xl font-black text-white tracking-tighter">
              {totalUsers >= 1000 ? `${(totalUsers / 1000).toFixed(1)}k` : totalUsers}
            </h2>
          </div>
        </div>
      </div>

      {/* Total Token Consumption Chart */}
      <div className="md:col-span-8 bg-surface-container p-6 rounded-3xl flex flex-col border border-white/5 shadow-2xl relative overflow-hidden">
        {/* Background circuit lines effect */}
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
          <svg width="100%" height="100%">
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="flex justify-between items-start mb-8 relative z-10">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Total Token Consumption</h3>
            <p className="text-xs text-on-surface-variant uppercase tracking-widest font-black opacity-50">Kinetic Engine Processing Load</p>
          </div>
          <div className="flex gap-2 bg-surface-container-highest p-1 rounded-full border border-white/5">
            <button className="px-4 py-1 text-[10px] font-bold uppercase tracking-widest bg-primary text-on-primary rounded-full shadow-[0_0_15px_rgba(177,255,36,0.3)]">Day</button>
            <button className="px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-white transition-colors">Week</button>
            <button className="px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-white transition-colors">Month</button>
          </div>
        </div>
        
        <div className="flex-1 relative flex items-end gap-1.5 min-h-[200px] z-10">
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 100">
            <defs>
              <linearGradient id="lineGrad" x1="0%" x2="0%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="#b1ff24" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#b1ff24" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,80 Q40,40 80,60 T160,20 T240,70 T320,30 T400,10" fill="transparent" stroke="#b1ff24" strokeWidth="2" strokeDasharray="1000" strokeDashoffset="0" vectorEffect="non-scaling-stroke">
               <animate attributeName="stroke-dashoffset" from="1000" to="0" dur="3s" fill="freeze" />
            </path>
            <path d="M0,80 Q40,40 80,60 T160,20 T240,70 T320,30 T400,10 V100 H0 Z" fill="url(#lineGrad)" vectorEffect="non-scaling-stroke" />
          </svg>
          <div className="absolute inset-0 flex flex-col justify-between opacity-5 pointer-events-none">
            <div className="h-px bg-white w-full"></div>
            <div className="h-px bg-white w-full"></div>
            <div className="h-px bg-white w-full"></div>
            <div className="h-px bg-white w-full"></div>
          </div>
        </div>
        
        <div className="flex justify-between mt-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.3em] relative z-10">
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>SYNC_NODE</span>
        </div>
      </div>
    </div>
  );
};

export default BentoStats;
