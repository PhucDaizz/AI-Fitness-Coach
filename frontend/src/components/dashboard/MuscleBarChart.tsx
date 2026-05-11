import React from 'react';
import { useTranslation } from 'react-i18next';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

// BE trả về: { muscleGroup, totalVolume } sorted desc
interface MuscleVolumeData {
  muscleGroup: string;
  totalVolume: number;
}

interface MuscleBarChartProps {
  data: MuscleVolumeData[];
  loading?: boolean;
}

// Màu cho từng bar — đủ contrast trên dark background
const BAR_COLORS = [
  '#b1ff24',
  '#6a9cff',
  '#ff6b9d',
  '#ffd93d',
  '#c77dff',
  '#4ecdc4',
  '#ff8c42',
  '#a8e6cf',
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-container-highest border border-white/10 rounded-xl p-3 shadow-2xl">
      <p className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant mb-1">
        {label}
      </p>
      <p className="text-sm font-black text-primary">
        {payload[0].value.toLocaleString()}{' '}
        <span className="text-[10px] font-medium text-on-surface-variant">kg</span>
      </p>
    </div>
  );
};

// Truncate muscle name cho X-axis (tên dài như "Quadriceps" → "Quad…")
const truncate = (str: string, max = 7) => (str.length > max ? str.slice(0, max) + '…' : str);

// Format Y-axis: 3200 → "3.2k"
const formatYAxis = (value: number) => {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return String(value);
};

const MuscleBarChart: React.FC<MuscleBarChartProps> = ({ data, loading = false }) => {
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

  // Hiển thị top 8 nhóm cơ, truncate label
  const displayData = data.slice(0, 8).map((d) => ({
    ...d,
    displayName: truncate(d.muscleGroup),
  }));

  return (
    <div className="bg-surface-container rounded-2xl p-6 border border-white/5">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[18px]">fitness_center</span>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
            {t('stats.muscle_chart.title')}
          </h3>
        </div>
        {data.length > 0 && (
          <span className="text-[9px] font-bold text-on-surface-variant/50">
            {data.length} {t('stats.muscle_chart.groups')}
          </span>
        )}
      </div>

      {displayData.length === 0 ? (
        <div className="h-48 flex flex-col items-center justify-center gap-2 opacity-30">
          <span className="material-symbols-outlined text-3xl">bar_chart</span>
          <p className="text-[10px] font-black uppercase tracking-widest">{t('stats.no_data')}</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={displayData} margin={{ top: 8, right: 8, bottom: 4, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="displayName"
              tick={{ fill: '#adaaaa', fontSize: 9, fontWeight: 700 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatYAxis}
              tick={{ fill: '#adaaaa', fontSize: 9, fontWeight: 700 }}
              axisLine={false}
              tickLine={false}
              width={32}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="totalVolume" radius={[6, 6, 0, 0]}>
              {displayData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={BAR_COLORS[index % BAR_COLORS.length]}
                  fillOpacity={0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default MuscleBarChart;
