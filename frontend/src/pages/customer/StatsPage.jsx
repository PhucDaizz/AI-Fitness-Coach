import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import ActivityHeatmap from '../../components/dashboard/ActivityHeatmap';
import MetricCard from '../../components/dashboard/MetricCard';
import MuscleBarChart from '../../components/dashboard/MuscleBarChart';
import WorkoutLineChart from '../../components/dashboard/WorkoutLineChart';
import CustomerLayout from '../../components/layout/CustomerLayout';
import PageTitle from '../../components/shared/PageTitle';
import {
  getAnalyticsSummary,
  getHeatmapData,
  getMuscleVolume,
  getWeeklyData,
} from '../../services/api/analytics.service';

const StatsPage = () => {
  const { t } = useTranslation();

  const [summary, setSummary] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [muscleVolume, setMuscleVolume] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);

  const [loading, setLoading] = useState({
    summary: true,
    weekly: true,
    muscle: true,
    heatmap: true,
  });

  useEffect(() => {
    // Fetch tất cả 4 API song song — independent loading states
    getAnalyticsSummary()
      .then((data) => setSummary(data))
      .catch((err) => console.error('[StatsPage] summary:', err))
      .finally(() => setLoading((prev) => ({ ...prev, summary: false })));

    getWeeklyData()
      .then((data) => setWeeklyData(data || []))
      .catch((err) => console.error('[StatsPage] weekly:', err))
      .finally(() => setLoading((prev) => ({ ...prev, weekly: false })));

    getMuscleVolume()
      .then((data) => setMuscleVolume(data || []))
      .catch((err) => console.error('[StatsPage] muscle-volume:', err))
      .finally(() => setLoading((prev) => ({ ...prev, muscle: false })));

    getHeatmapData(365)
      .then((data) => setHeatmapData(data || []))
      .catch((err) => console.error('[StatsPage] heatmap:', err))
      .finally(() => setLoading((prev) => ({ ...prev, heatmap: false })));
  }, []);

  // ─── 4 Metric cards từ summary ─────────────────────────────────────────────
  const metrics = summary
    ? [
        {
          icon: 'local_fire_department',
          iconColor: 'text-orange-400',
          label: t('stats.metrics.current_streak'),
          value: summary.currentStreak,
          unit: t('stats.metrics.days'),
          subLabel: t('stats.metrics.longest'),
          subValue: `${summary.longestStreak} ${t('stats.metrics.days')}`,
        },
        {
          icon: 'calendar_month',
          iconColor: 'text-blue-400',
          label: t('stats.metrics.sessions_week'),
          value: summary.sessionsThisWeek,
          unit: t('stats.metrics.sessions'),
        },
        {
          icon: 'fitness_center',
          iconColor: 'text-secondary',
          label: t('stats.metrics.total_volume'),
          // BE trả về kg thô → chia 1000 để hiển thị tấn
          value: (summary.totalVolumeKg / 1000).toFixed(1),
          unit: t('stats.metrics.tons'),
        },
        {
          icon: 'done_all',
          iconColor: 'text-primary',
          label: t('stats.metrics.completion_rate'),
          value: summary.completionRate,
          unit: '%',
        },
      ]
    : [];

  return (
    <CustomerLayout title="KINETIC AI">
      <PageTitle
        title={t('stats.title')}
        highlight={t('stats.title_highlight')}
        subtitle={t('stats.subtitle')}
        className="mb-10"
      />

      {/* ── Row 1: 4 MetricCards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading.summary
          ? Array.from({ length: 4 }).map((_, i) => (
              <MetricCard key={i} loading icon="" iconColor="" label="" value="" />
            ))
          : metrics.map((m, i) => <MetricCard key={i} {...m} />)}
      </div>

      {/* ── Row 2: LineChart + BarChart ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <WorkoutLineChart data={weeklyData} loading={loading.weekly} />
        <MuscleBarChart data={muscleVolume} loading={loading.muscle} />
      </div>

      {/* ── Row 3: Activity Heatmap full-width ──────────────────────────────── */}
      <ActivityHeatmap data={heatmapData} loading={loading.heatmap} />
    </CustomerLayout>
  );
};

export default StatsPage;
