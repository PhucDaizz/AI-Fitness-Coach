import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import GeneratePlanModal from '../../components/customer/GeneratePlanModal';
import CustomerLayout from '../../components/layout/CustomerLayout';
import useChatSignalR from '../../hooks/useChatSignalR';
import {
  generateWorkoutPlan,
  getLatestWorkoutPlanGenerationJob,
  getWorkoutPlans,
  renameWorkoutPlan,
} from '../../services/api/workoutPlan.service';

const RUNNING_JOB_STATUSES = ['Pending', 'InProgress'];
const isRunningJob = (job) => job && RUNNING_JOB_STATUSES.includes(job.status);

const WorkoutPlansPage = () => {
  const { t } = useTranslation();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('active'); // active, completed, archived, all
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [renamingPlanId, setRenamingPlanId] = useState(null);

  // Generation state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generationJob, setGenerationJob] = useState(null);
  const isGenerating = isRunningJob(generationJob);

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page: 1, limit: 30 };
      if (status !== 'all') {
        params.status = status;
      }
      const data = await getWorkoutPlans(params);
      setPlans(data || []);
    } catch (err) {
      console.error('Failed to fetch plans', err);
    } finally {
      setLoading(false);
    }
  }, [status]);

  const restoreLatestGenerationJob = useCallback(async () => {
    try {
      const latestJob = await getLatestWorkoutPlanGenerationJob();
      if (latestJob) {
        setGenerationJob(latestJob);
        if (latestJob.status === 'Completed') {
          setStatus('active');
          fetchPlans();
        }
      }
    } catch (err) {
      if (err.status !== 404) {
        console.error('Failed to restore latest generation job', err);
      }
    }
  }, [fetchPlans]);

  const signalRHandlers = useMemo(
    () => ({
      WorkoutPlanGenerationUpdated: (job) => {
        setGenerationJob(job);
        if (job?.status === 'Completed') {
          setStatus('active');
          fetchPlans();
        }
      },
      ConnectionReconnected: () => {
        restoreLatestGenerationJob();
      },
    }),
    [fetchPlans, restoreLatestGenerationJob],
  );

  useChatSignalR(signalRHandlers);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  useEffect(() => {
    restoreLatestGenerationJob();
  }, [restoreLatestGenerationJob]);

  useEffect(() => {
    const handleFocus = () => {
      if (isRunningJob(generationJob)) {
        restoreLatestGenerationJob();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [generationJob, restoreLatestGenerationJob]);

  const abortControllerRef = React.useRef(null);

  const handleGeneratePlan = async (data) => {
    try {
      // Initialize new AbortController
      abortControllerRef.current = new AbortController();

      const result = await generateWorkoutPlan(data, abortControllerRef.current.signal);
      setGenerationJob(result);

      if (result?.isExisting) {
        setIsModalOpen(true);
        return result;
      }

      if (result?.status === 'Completed') {
        setStatus('active');
        fetchPlans();
      }

      return result;
    } catch (err) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') {
        console.log('Generation aborted by user');
        return;
      }
      console.error('Failed to generate plan', err);
      alert(err.message || t('workout_plans.errors.generate_fail'));
      throw err;
    } finally {
      abortControllerRef.current = null;
    }
  };

  const handleAbortGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const startRename = (plan) => {
    setEditingPlanId(plan._id);
    setEditingTitle(plan.title || '');
  };

  const cancelRename = () => {
    setEditingPlanId(null);
    setEditingTitle('');
  };

  const handleRenamePlan = async (planId) => {
    const nextTitle = editingTitle.trim();
    if (!nextTitle) {
      alert(t('workout_plans.rename.required'));
      return;
    }

    try {
      setRenamingPlanId(planId);
      const updatedPlan = await renameWorkoutPlan(planId, nextTitle);
      setPlans((prev) =>
        prev.map((plan) =>
          plan._id === planId ? { ...plan, title: updatedPlan?.title || nextTitle } : plan,
        ),
      );
      cancelRename();
    } catch (err) {
      console.error('Failed to rename workout plan', err);
      alert(err.message || t('workout_plans.rename.error'));
    } finally {
      setRenamingPlanId(null);
    }
  };

  const getStatusColor = (s) => {
    switch (s) {
      case 'active':
        return 'text-primary border-primary/20 bg-primary/5';
      case 'completed':
        return 'text-secondary border-secondary/20 bg-secondary/5';
      case 'archived':
        return 'text-on-surface-variant border-white/10 bg-white/5';
      default:
        return 'text-white border-white/10 bg-white/5';
    }
  };

  const getGenerationStatusLabel = (job) =>
    t(`workout_plans.generation.status.${job.status}`, { defaultValue: job.status });

  const getGenerationMessage = (job) =>
    t(`workout_plans.generation.messages.${job.status}`, { defaultValue: job.message });

  return (
    <CustomerLayout title="KINETIC AI" fullWidth={false}>
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-[2.5rem] font-headline font-black italic tracking-tighter uppercase leading-none mb-2">
            {t('workout_plans.title')}{' '}
            <span className="text-primary">{t('workout_plans.title_highlight')}</span>
          </h1>
          <p className="text-on-surface-variant font-medium text-sm tracking-wide opacity-70">
            {t('workout_plans.subtitle')}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          disabled={isGenerating}
          className="bg-primary text-black px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(177,255,36,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">
            {isGenerating ? 'hourglass_top' : 'add'}
          </span>
          {isGenerating
            ? t('workout_plans.generation.generating_btn')
            : t('workout_plans.init_btn')}
        </button>
      </header>

      {generationJob && (
        <div className="mb-8 rounded-[2rem] border border-primary/20 bg-primary/5 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-lg">
                {generationJob.status === 'Completed'
                  ? 'check_circle'
                  : generationJob.status === 'Failed'
                    ? 'error'
                    : 'hourglass_top'}
              </span>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                {t('workout_plans.generation.job_label')}: {getGenerationStatusLabel(generationJob)}
              </p>
              <p className="text-xs text-on-surface-variant font-bold mt-1 opacity-80">
                {getGenerationMessage(generationJob)}
              </p>
              {generationJob.error && (
                <p className="text-[10px] text-red-300 font-bold mt-2 opacity-80">
                  {generationJob.error}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {generationJob.status === 'Completed' && generationJob.planIds?.[0] && (
              <Link
                to={`/plans/${generationJob.planIds[0]}`}
                className="px-5 py-3 bg-primary text-black rounded-full text-[10px] font-black uppercase tracking-widest"
              >
                {t('workout_plans.generation.open_plan')}
              </Link>
            )}
            {isRunningJob(generationJob) && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-5 py-3 bg-white/5 border border-white/10 text-white rounded-full text-[10px] font-black uppercase tracking-widest"
              >
                {t('workout_plans.generation.track')}
              </button>
            )}
            {!isRunningJob(generationJob) && (
              <button
                onClick={() => setGenerationJob(null)}
                className="px-5 py-3 bg-white/5 border border-white/10 text-on-surface-variant rounded-full text-[10px] font-black uppercase tracking-widest"
              >
                {t('workout_plans.generation.dismiss')}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Status Filters */}
      <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar pb-2">
        {['active', 'completed', 'archived', 'all'].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-6 py-2.5 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
              status === s
                ? 'bg-primary text-black border-primary shadow-[0_0_20px_rgba(177,255,36,0.3)]'
                : 'bg-white/5 border-white/10 text-on-surface-variant hover:border-white/20'
            }`}
          >
            {t(`workout_plans.filters.${s}`)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-30">
          <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-[10px] font-black uppercase tracking-widest">
            {t('workout_plans.loading')}
          </p>
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-[2rem] border border-dashed border-white/10">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-4 opacity-20">
            inventory_2
          </span>
          <p className="text-on-surface-variant font-bold text-sm">{t('workout_plans.empty')}</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-primary text-[10px] font-black uppercase tracking-widest mt-4 inline-block hover:underline"
          >
            {t('workout_plans.empty_action')}
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {plans.map((plan) => (
            <div
              key={plan._id}
              className="group relative bg-[#1a1919] border border-white/10 rounded-[2.5rem] p-8 transition-all hover:border-primary/30 hover:translate-y-[-4px] overflow-hidden"
            >
              {/* Background Accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl group-hover:bg-primary/10 transition-colors"></div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest ${getStatusColor(plan.status)}`}
                    >
                      {t(`workout_plans.filters.${plan.status}`)}
                    </span>
                    <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest opacity-50">
                      {plan.planType} • {plan.weekNumber} {t('workout_plans.card.weeks')}
                    </span>
                  </div>
                  {editingPlanId === plan._id ? (
                    <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                      <input
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleRenamePlan(plan._id);
                          }
                          if (e.key === 'Escape') {
                            cancelRename();
                          }
                        }}
                        disabled={renamingPlanId === plan._id}
                        maxLength={120}
                        autoFocus
                        className="w-full sm:max-w-md bg-white/5 border border-primary/30 rounded-2xl px-4 py-3 text-sm font-black text-white uppercase italic tracking-tight focus:outline-none focus:border-primary disabled:opacity-50"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleRenamePlan(plan._id)}
                          disabled={renamingPlanId === plan._id}
                          className="w-10 h-10 rounded-full bg-primary text-black flex items-center justify-center hover:scale-105 transition-all disabled:opacity-50"
                          title={t('workout_plans.rename.save')}
                        >
                          <span className="material-symbols-outlined text-sm">
                            {renamingPlanId === plan._id ? 'progress_activity' : 'check'}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={cancelRename}
                          disabled={renamingPlanId === plan._id}
                          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 text-on-surface-variant flex items-center justify-center hover:text-white transition-colors disabled:opacity-50"
                          title={t('workout_plans.rename.cancel')}
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <h3 className="text-2xl font-black text-white group-hover:text-primary transition-colors tracking-tight uppercase italic">
                        {plan.title}
                      </h3>
                      <button
                        type="button"
                        onClick={() => startRename(plan)}
                        className="mt-1 w-8 h-8 rounded-full bg-white/5 border border-white/10 text-on-surface-variant flex items-center justify-center hover:text-primary hover:border-primary/30 transition-all"
                        title={t('workout_plans.rename.edit')}
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-[10px] font-bold text-on-surface-variant opacity-60">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">calendar_today</span>
                      {t('workout_plans.card.starts')}{' '}
                      {new Date(plan.startsAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">smart_toy</span>
                      {plan.aiModelUsed}
                    </span>
                  </div>
                </div>

                <Link
                  to={`/plans/${plan._id}`}
                  className="flex items-center justify-center w-full md:w-auto px-10 py-4 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-white hover:bg-primary hover:text-black hover:border-primary transition-all shadow-xl group/btn"
                >
                  {t('workout_plans.card.load_btn')}
                  <span className="material-symbols-outlined ml-2 text-sm group-hover/btn:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Generation Modal */}
      <GeneratePlanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onGenerate={handleGeneratePlan}
        onAbort={handleAbortGeneration}
        isGenerating={isGenerating}
        generationJob={generationJob}
      />
    </CustomerLayout>
  );
};

export default WorkoutPlansPage;
