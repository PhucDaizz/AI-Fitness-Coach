import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { cn } from '../../lib/utils';

// BE trả về sparse array — ngày không tập KHÔNG có trong mảng
interface HeatmapDay {
  date: string; // "YYYY-MM-DD"
  count: number;
}

interface ActivityHeatmapProps {
  data: HeatmapDay[];
  loading?: boolean;
}

// ─── Tạo grid 52 tuần, mỗi cột = 1 tuần (Mon→Sun) ─────────────────────────────
const generateGrid = (weeks = 52): string[][] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Tìm Monday của tuần hiện tại
  const dow = today.getDay(); // 0=Sun, 1=Mon…
  const daysFromMonday = dow === 0 ? 6 : dow - 1;
  const currentMonday = new Date(today);
  currentMonday.setDate(today.getDate() - daysFromMonday);

  const grid: string[][] = [];

  // Tạo weeks-1 tuần trước → tuần hiện tại (trái → phải = cũ → mới)
  for (let w = weeks - 1; w >= 0; w--) {
    const weekMonday = new Date(currentMonday);
    weekMonday.setDate(currentMonday.getDate() - w * 7);

    const week: string[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(weekMonday);
      date.setDate(weekMonday.getDate() + d);
      // Format as YYYY-MM-DD using local time to avoid timezone offset issues
      const localDateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      // Ô trống cho ngày trong tương lai
      week.push(date <= today ? localDateStr : '');
    }
    grid.push(week);
  }

  return grid;
};

// ─── Màu intensity theo số sessions ────────────────────────────────────────────
const getIntensityClass = (count: number): string => {
  if (count === 0) return 'bg-white/5';
  if (count === 1) return 'bg-primary/25';
  if (count === 2) return 'bg-primary/50';
  if (count === 3) return 'bg-primary/75';
  return 'bg-primary';
};

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
// Chỉ label Mon / Wed / Fri để không quá chật
const DAY_LABELS = ['Mon', '', 'Wed', '', 'Fri', '', ''];

const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ data, loading = false }) => {
  const { t } = useTranslation();

  // Tạo Map để lookup O(1)
  const dataMap = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach((d) => map.set(d.date, d.count));
    return map;
  }, [data]);

  const grid = useMemo(() => generateGrid(52), []);

  // Tổng sessions trong kỳ
  const totalSessions = useMemo(() => data.reduce((sum, d) => sum + d.count, 0), [data]);

  // Tính vị trí label tháng: chỉ show khi tuần đầu tiên của tháng xuất hiện
  const monthLabels = useMemo(() => {
    const labels: Array<{ weekIdx: number; label: string }> = [];
    let lastMonth = -1;
    grid.forEach((week, wi) => {
      const firstDate = week.find((d) => d !== '');
      if (!firstDate) return;
      const month = parseInt(firstDate.split('-')[1], 10) - 1; // 0-indexed month
      if (month !== lastMonth) {
        labels.push({ weekIdx: wi, label: MONTH_NAMES[month] });
        lastMonth = month;
      }
    });
    return labels;
  }, [grid]);

  if (loading) {
    return (
      <div className="bg-surface-container rounded-2xl p-6 border border-white/5 animate-pulse">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white/10 rounded" />
            <div className="h-3 w-40 bg-white/10 rounded" />
          </div>
          <div className="h-3 w-28 bg-white/5 rounded" />
        </div>
        <div className="h-28 bg-white/5 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="bg-surface-container rounded-2xl p-6 border border-white/5">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-orange-400 text-[18px]">
            local_fire_department
          </span>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
            {t('stats.heatmap.title')}
          </h3>
        </div>
        <p className="text-[9px] font-bold text-on-surface-variant/60 uppercase tracking-widest">
          {totalSessions} {t('stats.heatmap.total_sessions')}
        </p>
      </div>

      <div className="overflow-x-auto no-scrollbar">
        <div className="min-w-max">
          {/* Month labels — align với từng cột week */}
          <div className="flex gap-[3px] mb-1 pl-[28px]">
            {grid.map((week, wi) => {
              const found = monthLabels.find((m) => m.weekIdx === wi);
              return (
                <div key={wi} style={{ width: 11 }} className="overflow-visible">
                  {found && (
                    <span className="text-[8px] text-on-surface-variant/50 font-bold whitespace-nowrap">
                      {found.label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Grid body: day-labels + week columns */}
          <div className="flex gap-[3px]">
            {/* Day labels (Mon/Wed/Fri) */}
            <div className="flex flex-col gap-[3px] mr-1">
              {DAY_LABELS.map((label, i) => (
                <div
                  key={i}
                  style={{ height: 11, width: 22 }}
                  className="text-[8px] text-on-surface-variant/50 font-bold flex items-center justify-end pr-1"
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Week columns */}
            {grid.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((date, di) => {
                  if (!date) {
                    // Ô trống cho ngày tương lai hoặc padding
                    return <div key={di} style={{ width: 11, height: 11 }} />;
                  }
                  const count = dataMap.get(date) ?? 0;
                  return (
                    <div
                      key={di}
                      title={`${date}: ${count} session${count !== 1 ? 's' : ''}`}
                      style={{ width: 11, height: 11 }}
                      className={cn(
                        'rounded-[2px] transition-colors cursor-default hover:ring-1 hover:ring-white/20',
                        getIntensityClass(count),
                      )}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-1.5 mt-3 pl-[28px] justify-end">
            <span className="text-[8px] text-on-surface-variant/50 font-bold">
              {t('stats.heatmap.less')}
            </span>
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                style={{ width: 11, height: 11 }}
                className={cn('rounded-[2px]', getIntensityClass(level))}
              />
            ))}
            <span className="text-[8px] text-on-surface-variant/50 font-bold">
              {t('stats.heatmap.more')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityHeatmap;
