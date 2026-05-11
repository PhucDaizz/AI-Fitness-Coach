import React from 'react';
import { useTranslation } from 'react-i18next';

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

// BE trả về: { weekStart, weekEnd, weekLabel, sessions }
interface WeekData {
  weekStart: string;
  weekEnd: string;
  weekLabel: string; // "W1"…"W4" — dùng thẳng làm X-axis
  sessions: number;
}

interface WorkoutLineChartProps {
  data: WeekData[];
  loading?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const week = payload[0]?.payload;

  return (
    <div className="bg-surface-container-highest border border-white/10 rounded-xl p-3 shadow-2xl">
      <p className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant mb-0.5">
        {label}
      </p>
      {week?.weekStart && week?.weekEnd && (
        <p className="text-[8px] text-on-surface-variant/50 mb-2">
          {week.weekStart} → {week.weekEnd}
        </p>
      )}
      <p className="text-sm font-black text-primary">
        {payload[0].value}{' '}
        <span className="text-[10px] font-medium text-on-surface-variant">sessions</span>
      </p>
    </div>
  );
};

const WorkoutLineChart: React.FC<WorkoutLineChartProps> = ({ data, loading = false }) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="bg-surface-container rounded-2xl p-6 border border-white/5 animate-pulse">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-4 h-4 bg-white/10 rounded" />
          <div className="h-3 w-40 bg-white/10 rounded" />
        </div>
        <div className="h-48 bg-white/5 rounded-xl" />
      </div>
    );
  }

  // Max sessions để vẽ reference line trung bình
  const avg = data.length ? Math.round(data.reduce((s, d) => s + d.sessions, 0) / data.length) : 0;

  return (
    <div className="bg-surface-container rounded-2xl p-6 border border-white/5">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-[18px]">show_chart</span>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
            {t('stats.weekly_chart.title')}
          </h3>
        </div>
        {avg > 0 && (
          <span className="text-[9px] font-bold text-on-surface-variant/50">
            {t('stats.weekly_chart.avg')}: {avg} sessions
          </span>
        )}
      </div>

      {data.length === 0 ? (
        <div className="h-48 flex flex-col items-center justify-center gap-2 opacity-30">
          <span className="material-symbols-outlined text-3xl">bar_chart</span>
          <p className="text-[10px] font-black uppercase tracking-widest">{t('stats.no_data')}</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            {avg > 0 && (
              <ReferenceLine y={avg} stroke="rgba(106,156,255,0.3)" strokeDasharray="4 4" />
            )}
            <XAxis
              dataKey="weekLabel"
              tick={{ fill: '#adaaaa', fontSize: 10, fontWeight: 700 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#adaaaa', fontSize: 10, fontWeight: 700 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
              width={20}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: 'rgba(177,255,36,0.15)', strokeWidth: 1 }}
            />
            <Line
              type="monotone"
              dataKey="sessions"
              stroke="#b1ff24"
              strokeWidth={2.5}
              dot={{ fill: '#b1ff24', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, fill: '#b1ff24', strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default WorkoutLineChart;
