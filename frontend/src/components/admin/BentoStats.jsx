import React, { useState, useEffect, useMemo, useRef } from 'react';
import useChatSignalR from '../../hooks/useChatSignalR';
import { getTotalUsers, getTokenChartData } from '../../services/api/system.service';

const BentoStats = () => {
  const [onlineCount, setOnlineCount] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [timeFrame, setTimeFrame] = useState(1); // 1: Day, 2: Week, 3: Month
  const [isLoadingChart, setIsLoadingChart] = useState(true);
  
  // Interaction states
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const chartRef = useRef(null);

  // Fetch static system metrics on mount
  useEffect(() => {
    const fetchStaticMetrics = async () => {
      try {
        const count = await getTotalUsers();
        setTotalUsers(count);
      } catch (err) {
        console.error("Failed to sync system volume:", err);
      }
    };
    fetchStaticMetrics();
  }, []);

  // Fetch chart data when timeFrame changes
  useEffect(() => {
    const fetchChart = async () => {
      try {
        setIsLoadingChart(true);
        const data = await getTokenChartData(timeFrame);
        setChartData(data || []);
      } catch (err) {
        console.error("Failed to fetch token chart:", err);
      } finally {
        setIsLoadingChart(false);
      }
    };
    fetchChart();
  }, [timeFrame]);

  // Bind to SignalR for real-time user metrics
  useChatSignalR({
    UpdateOnlineUsersCount: (count) => {
      setOnlineCount(count);
    }
  });

  // Calculate SVG path for the chart
  const { points, pathLine, pathArea, chartLabels } = useMemo(() => {
    if (!chartData || chartData.length === 0) return { points: [], pathLine: '', pathArea: '', chartLabels: [] };

    const width = 400;
    const height = 100;
    const padding = 10;
    const usableHeight = height - padding * 2;
    
    const values = chartData.map(d => d.value);
    const maxVal = Math.max(...values, 100);
    
    const calculatedPoints = chartData.map((d, i) => {
      const x = (i / (chartData.length - 1)) * width;
      const y = height - ((d.value / maxVal) * usableHeight + padding);
      return { x, y, value: d.value, label: d.label };
    });

    // Generate Cubic Bezier Path
    let line = `M ${calculatedPoints[0].x},${calculatedPoints[0].y}`;
    for (let i = 0; i < calculatedPoints.length - 1; i++) {
      const p0 = calculatedPoints[i];
      const p1 = calculatedPoints[i + 1];
      const cp1x = p0.x + (p1.x - p0.x) / 2;
      line += ` C ${cp1x},${p0.y} ${cp1x},${p1.y} ${p1.x},${p1.y}`;
    }

    const area = `${line} V ${height} H 0 Z`;
    
    // Pick labels for the X axis
    const labelIndices = [0, Math.floor(chartData.length * 0.25), Math.floor(chartData.length * 0.5), Math.floor(chartData.length * 0.75), chartData.length - 1];
    const pickedLabels = labelIndices.map(idx => chartData[idx]?.label || '');

    return { points: calculatedPoints, pathLine: line, pathArea: area, chartLabels: pickedLabels };
  }, [chartData]);

  const handleMouseMove = (e) => {
    if (!chartRef.current || points.length === 0) return;
    
    const rect = chartRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 400; // Map screen X to SVG 400 width
    
    // Find closest point by X coordinate
    let closestIndex = 0;
    let minDiff = Math.abs(points[0].x - x);
    
    for (let i = 1; i < points.length; i++) {
      const diff = Math.abs(points[i].x - x);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = i;
      }
    }
    setHoveredIndex(closestIndex);
  };

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
            {[
              { id: 1, label: 'Day' },
              { id: 2, label: 'Week' },
              { id: 3, label: 'Month' }
            ].map(btn => (
              <button 
                key={btn.id}
                onClick={() => setTimeFrame(btn.id)}
                className={`px-4 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full transition-all ${
                  timeFrame === btn.id ? 'bg-primary text-on-primary shadow-[0_0_15px_rgba(177,255,36,0.3)]' : 'text-on-surface-variant hover:text-white'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
        
        <div 
          className="flex-1 relative flex items-end gap-1.5 min-h-[200px] z-10 cursor-crosshair"
          ref={chartRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {isLoadingChart ? (
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
             </div>
          ) : (
            <>
              {/* Tooltip Info */}
              {hoveredIndex !== null && points[hoveredIndex] && (
                <div 
                  className="absolute z-50 pointer-events-none bg-surface-container-highest/90 backdrop-blur-md border border-primary/30 p-3 rounded-xl shadow-2xl flex flex-col items-center min-w-[80px]"
                  style={{
                    left: `${(points[hoveredIndex].x / 400) * 100}%`,
                    top: `${(points[hoveredIndex].y / 100) * 100}%`,
                    transform: 'translate(-50%, -120%)'
                  }}
                >
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-0.5">{points[hoveredIndex].label}</p>
                  <p className="text-sm font-black text-white tracking-widest">{points[hoveredIndex].value.toLocaleString()}</p>
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary/30 rotate-45 border-r border-b border-primary/30"></div>
                </div>
              )}

              {/* Html Overlay for Scan Line and Ping Dot */}
              {hoveredIndex !== null && points[hoveredIndex] && (
                <>
                  {/* Vertical Scan Line */}
                  <div 
                    className="absolute top-0 bottom-0 border-l border-dashed border-primary/40 pointer-events-none"
                    style={{ left: `${(points[hoveredIndex].x / 400) * 100}%` }}
                  ></div>
                  
                  {/* Glowing Dot */}
                  <div 
                    className="absolute w-3 h-3 bg-primary rounded-full shadow-[0_0_10px_rgba(177,255,36,0.8)] pointer-events-none -translate-x-1/2 -translate-y-1/2"
                    style={{ 
                      left: `${(points[hoveredIndex].x / 400) * 100}%`,
                      top: `${(points[hoveredIndex].y / 100) * 100}%`
                    }}
                  >
                    <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-75"></div>
                  </div>
                </>
              )}

              <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 400 100">
                <defs>
                  <linearGradient id="lineGrad" x1="0%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="#b1ff24" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#b1ff24" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={pathLine} fill="transparent" stroke="#b1ff24" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                <path d={pathArea} fill="url(#lineGrad)" vectorEffect="non-scaling-stroke" />
              </svg>
              
              <div className="absolute inset-0 flex flex-col justify-between opacity-5 pointer-events-none">
                <div className="h-px bg-white w-full"></div>
                <div className="h-px bg-white w-full"></div>
                <div className="h-px bg-white w-full"></div>
                <div className="h-px bg-white w-full"></div>
              </div>
            </>
          )}
        </div>
        
        <div className="flex justify-between mt-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.3em] relative z-10">
          {chartLabels.map((label, i) => (
            <span key={i}>{label}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BentoStats;
