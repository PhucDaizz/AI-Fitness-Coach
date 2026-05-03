import React, { useState, useEffect } from 'react';
import { getAnalyticsSummary, getMuscleVolume } from '../../services/api/analytics.service';

const AnalyticsSummary = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [muscleVolume, setMuscleVolume] = useState([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [summaryData, volumeData] = await Promise.all([
          getAnalyticsSummary(),
          getMuscleVolume()
        ]);
        
        setSummary(summaryData);
        setMuscleVolume(volumeData);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics data.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-sm mt-3 p-4 rounded-xl bg-surface-container border border-white/10 shadow-lg animate-pulse flex flex-col gap-3">
        <div className="h-4 w-1/3 bg-white/10 rounded"></div>
        <div className="grid grid-cols-2 gap-2">
          <div className="h-12 w-full bg-white/5 rounded-lg"></div>
          <div className="h-12 w-full bg-white/5 rounded-lg"></div>
          <div className="h-12 w-full bg-white/5 rounded-lg"></div>
          <div className="h-12 w-full bg-white/5 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-sm mt-3 p-3 rounded-xl bg-error/10 border border-error/20 text-error text-xs flex items-center gap-2">
        <span className="material-symbols-outlined text-[16px]">error</span>
        <span>{error}</span>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="w-full max-w-sm mt-3 bg-surface-container rounded-xl border border-white/10 shadow-lg overflow-hidden font-body text-xs">
      <div className="p-3 bg-white/5 border-b border-white/10 flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-primary/20 text-primary flex items-center justify-center">
          <span className="material-symbols-outlined text-[14px]">query_stats</span>
        </div>
        <h3 className="text-sm font-bold text-on-surface">Your Progress Overview</h3>
      </div>

      <div className="p-3 space-y-4">
        {/* Top Stats Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-surface-container-high rounded-lg p-2.5 flex flex-col justify-center border border-white/5">
            <div className="flex items-center gap-1.5 text-on-surface-variant mb-1">
              <span className="material-symbols-outlined text-[12px] text-orange-400">local_fire_department</span>
              <span className="text-[9px] font-bold uppercase tracking-wider">Current Streak</span>
            </div>
            <div className="text-lg font-black text-on-surface">
              {summary.currentStreak} <span className="text-[10px] text-on-surface-variant font-medium lowercase">days</span>
            </div>
          </div>
          
          <div className="bg-surface-container-high rounded-lg p-2.5 flex flex-col justify-center border border-white/5">
            <div className="flex items-center gap-1.5 text-on-surface-variant mb-1">
              <span className="material-symbols-outlined text-[12px] text-primary">done_all</span>
              <span className="text-[9px] font-bold uppercase tracking-wider">Completion</span>
            </div>
            <div className="text-lg font-black text-on-surface">
              {summary.completionRate}%
            </div>
          </div>

          <div className="bg-surface-container-high rounded-lg p-2.5 flex flex-col justify-center border border-white/5">
            <div className="flex items-center gap-1.5 text-on-surface-variant mb-1">
              <span className="material-symbols-outlined text-[12px] text-secondary">fitness_center</span>
              <span className="text-[9px] font-bold uppercase tracking-wider">Total Volume</span>
            </div>
            <div className="text-lg font-black text-on-surface">
              {(summary.totalVolumeKg / 1000).toFixed(1)} <span className="text-[10px] text-on-surface-variant font-medium lowercase">tons</span>
            </div>
          </div>

          <div className="bg-surface-container-high rounded-lg p-2.5 flex flex-col justify-center border border-white/5">
            <div className="flex items-center gap-1.5 text-on-surface-variant mb-1">
              <span className="material-symbols-outlined text-[12px] text-blue-400">calendar_month</span>
              <span className="text-[9px] font-bold uppercase tracking-wider">This Week</span>
            </div>
            <div className="text-lg font-black text-on-surface">
              {summary.sessionsThisWeek} <span className="text-[10px] text-on-surface-variant font-medium lowercase">sessions</span>
            </div>
          </div>
        </div>

        {/* Muscle Volume Breakdown */}
        {muscleVolume.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-white/5">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Muscle Volume Breakdown</h4>
            <div className="space-y-1.5">
              {muscleVolume.slice(0, 4).map((mv, idx) => {
                const maxVolume = Math.max(...muscleVolume.map(m => m.totalVolume));
                const percentage = (mv.totalVolume / maxVolume) * 100;
                
                return (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-[100px] text-[9px] font-bold text-on-surface truncate shrink-0">
                      {mv.muscleGroup}
                    </div>
                    <div className="flex-grow h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="w-12 text-right text-[9px] text-on-surface-variant shrink-0">
                      {mv.totalVolume}kg
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsSummary;
