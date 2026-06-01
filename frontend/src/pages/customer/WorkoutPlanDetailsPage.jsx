import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import ExecutionCalendar from '../../components/customer/ExecutionCalendar';
import ExerciseDetailModal from '../../components/customer/ExerciseDetailModal';
import TrainingSessionOverlay from '../../components/customer/TrainingSessionOverlay';
import WorkoutLogForm from '../../components/customer/WorkoutLogForm';
import CustomerLayout from '../../components/layout/CustomerLayout';
import { cn } from '../../lib/utils';
import { getExerciseById } from '../../services/api/exercise.service';
import {
  deleteWorkoutPlan,
  getWorkoutLogStatus,
  getWorkoutPlanCalendar,
  getWorkoutPlanDays,
} from '../../services/api/workoutPlan.service';

const WorkoutPlanDetailsPage = () => {
  const { t, i18n } = useTranslation();
  const { planId } = useParams();
  const navigate = useNavigate();
  const [days, setDays] = useState([]);
  const [calendar, setCalendar] = useState([]);
  const [exerciseDetails, setExerciseDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeDayIndex, setActiveDayIndex] = useState(0);

  // Training Session States
  const [isTraining, setIsTraining] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [timer, setTimer] = useState(0); // Total workout time
  const [restTimer, setRestTimer] = useState(0); // Current rest time
  const [showLogForm, setShowLogForm] = useState(false);
  const timerRef = useRef(null);
  const restTimerRef = useRef(null);

  // Modal states
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openExerciseDetail = (id) => {
    if (exerciseDetails[id]) {
      setSelectedExercise(exerciseDetails[id]);
      setIsModalOpen(true);
    }
  };

  useEffect(() => {
    fetchPlanDetails();
  }, [planId]);

  // Handle local storage for training state
  useEffect(() => {
    const savedState = localStorage.getItem(`training_state_${planId}`);
    if (savedState) {
      const parsed = JSON.parse(savedState);
      if (parsed.planId === planId && parsed.isTraining) {
        setIsTraining(true);
        setCurrentExerciseIndex(parsed.currentExerciseIndex);
        setTimer(parsed.timer);
      }
    }
  }, [planId]);

  useEffect(() => {
    if (isTraining) {
      localStorage.setItem(
        `training_state_${planId}`,
        JSON.stringify({
          planId,
          isTraining,
          currentExerciseIndex,
          timer,
        }),
      );
    } else if (!showLogForm) {
      localStorage.removeItem(`training_state_${planId}`);
    }
  }, [isTraining, currentExerciseIndex, timer, planId, showLogForm]);

  // Workout Timer
  useEffect(() => {
    if (isTraining && !showLogForm) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isTraining, showLogForm]);

  // Rest Timer
  useEffect(() => {
    if (isResting && restTimer > 0) {
      restTimerRef.current = setInterval(() => {
        setRestTimer((prev) => prev - 1);
      }, 1000);
    } else if (restTimer === 0) {
      setIsResting(false);
      clearInterval(restTimerRef.current);
    }
    return () => clearInterval(restTimerRef.current);
  }, [isResting, restTimer]);

  const fetchPlanDetails = async () => {
    try {
      setLoading(true);
      const [daysData, calendarData] = await Promise.all([
        getWorkoutPlanDays(planId),
        getWorkoutPlanCalendar(planId),
      ]);

      setDays(daysData || []);

      const logStatusEntries = await Promise.all(
        (calendarData || []).map(async (item) => {
          try {
            const status = await getWorkoutLogStatus(planId, item.dayId);
            return [item.dayId, status];
          } catch (err) {
            console.error(`Failed to fetch workout log status for day ${item.dayId}`, err);
            return [item.dayId, { isLogged: item.status === 'completed' }];
          }
        }),
      );
      const nextLogStatusByDayId = Object.fromEntries(logStatusEntries);

      const sortedCalendar = (calendarData || [])
        .map((item) => ({
          ...item,
          status: nextLogStatusByDayId[item.dayId]?.isLogged ? 'completed' : item.status,
          log: nextLogStatusByDayId[item.dayId]?.log,
        }))
        .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
      setCalendar(sortedCalendar);

      const exerciseIds = [
        ...new Set((daysData || []).flatMap((day) => day.exercises.map((ex) => ex.exerciseId))),
      ];

      const details = {};
      await Promise.all(
        exerciseIds.map(async (id) => {
          try {
            const exData = await getExerciseById(id);
            details[id] = exData;
          } catch (err) {
            console.error(`Failed to fetch exercise ${id}`, err);
          }
        }),
      );
      setExerciseDetails(details);

      const todayStr = new Date().toISOString().split('T')[0];
      const todayIndex = sortedCalendar.findIndex((item) => item.scheduledDate === todayStr);
      if (todayIndex !== -1) {
        setActiveDayIndex(todayIndex);
      } else {
        const nextIndex = sortedCalendar.findIndex(
          (item) => item.status === 'upcoming' || item.status === 'missed',
        );
        if (nextIndex !== -1) {
          setActiveDayIndex(nextIndex);
        }
      }
    } catch (err) {
      console.error('Failed to fetch plan details', err);
    } finally {
      setLoading(false);
    }
  };

  const markCurrentDayLogged = (log) => {
    if (!currentCalendarItem?.dayId) {
      return;
    }

    setCalendar((prev) =>
      prev.map((item) =>
        item.dayId === currentCalendarItem.dayId
          ? {
              ...item,
              status: 'completed',
              log,
            }
          : item,
      ),
    );
  };

  const handleDeletePlan = async () => {
    if (!window.confirm(t('workout_plans.details.confirm_delete'))) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteWorkoutPlan(planId);
      navigate('/plans?status=all', { replace: true });
    } catch (err) {
      console.error('Failed to delete plan', err);
      alert(err.message || 'Failed to delete plan');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStartTraining = () => {
    setIsTraining(true);
    setCurrentExerciseIndex(0);
    setTimer(0);
  };

  const handleNextExercise = () => {
    const currentDayItem = days.find((d) => d._id === calendar[activeDayIndex].dayId);
    if (currentExerciseIndex < currentDayItem.exercises.length - 1) {
      const restTime = currentDayItem.exercises[currentExerciseIndex].restSeconds || 60;
      setRestTimer(restTime);
      setIsResting(true);
      setCurrentExerciseIndex((prev) => prev + 1);
    } else {
      handleFinishTraining();
    }
  };

  const handleFinishTraining = () => {
    setIsTraining(false);
    setShowLogForm(true);
    localStorage.removeItem(`training_state_${planId}`);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-primary text-on-primary';
      case 'missed':
        return 'bg-error text-on-error';
      case 'upcoming':
        return 'bg-surface-container-highest text-on-surface-variant';
      default:
        return 'bg-surface-container text-on-surface-variant';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return 'check_circle';
      case 'missed':
        return 'cancel';
      case 'upcoming':
        return 'schedule';
      default:
        return 'event';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">
            {t('workout_plans.details.loading_data')}
          </p>
        </div>
      </div>
    );
  }

  const currentCalendarItem = calendar[activeDayIndex];
  const currentDay = currentCalendarItem
    ? days.find((d) => d._id === currentCalendarItem.dayId)
    : null;

  return (
    <CustomerLayout title="KINETIC AI" fullWidth={false}>
      <div className="flex justify-between items-start mb-8">
        <button
          onClick={() => navigate('/plans')}
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-black uppercase tracking-widest text-[10px]"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          {t('workout_plans.details.back')}
        </button>

        <div className="flex gap-3">
          {currentDay && currentCalendarItem?.status !== 'completed' && (
            <button
              onClick={handleStartTraining}
              className="flex items-center gap-2 bg-primary text-on-primary px-6 py-2.5 rounded-full hover:bg-primary/90 transition-all font-black uppercase tracking-widest text-[10px] shadow-[0_0_20px_rgba(177,255,36,0.3)]"
            >
              <span className="material-symbols-outlined text-sm">play_arrow</span>
              {t('workout_plans.details.training_session.start')}
            </button>
          )}

          <button
            onClick={handleDeletePlan}
            disabled={isDeleting}
            className="flex items-center gap-2 bg-error/10 border border-error/20 px-4 py-2 rounded-full text-error hover:bg-error hover:text-white transition-all font-black uppercase tracking-widest text-[8px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-xs">
              {isDeleting ? 'sync' : 'delete'}
            </span>
            {isDeleting
              ? t('workout_plans.details.terminating')
              : t('workout_plans.details.terminate')}
          </button>
        </div>
      </div>

      <header className="mb-10">
        <h1 className="text-[2.5rem] font-headline font-black italic tracking-tighter uppercase leading-none mb-2">
          {t('workout_plans.details.title')}{' '}
          <span className="text-primary">{t('workout_plans.details.title_highlight')}</span>
        </h1>
        <p className="text-on-surface-variant font-medium text-sm tracking-wide opacity-70">
          {t('workout_plans.details.subtitle')}
        </p>
      </header>

      {/* Execution Schedule / Calendar */}
      <ExecutionCalendar
        calendar={calendar}
        activeDayIndex={activeDayIndex}
        setActiveDayIndex={setActiveDayIndex}
        t={t}
        getStatusColor={getStatusColor}
        getStatusIcon={getStatusIcon}
      />

      {showLogForm && currentDay && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-500">
          <div className="relative w-full max-w-2xl bg-surface-container rounded-[2.5rem] border border-white/10 p-8 overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setShowLogForm(false)}
              className="absolute top-6 right-6 text-on-surface-variant hover:text-white"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <WorkoutLogForm
              planId={planId}
              dayId={currentDay._id}
              scheduledDate={currentCalendarItem.scheduledDate}
              onSubmitted={markCurrentDayLogged}
            />
          </div>
        </div>
      )}

      {isTraining && currentDay && (
        <TrainingSessionOverlay
          currentDay={currentDay}
          currentExerciseIndex={currentExerciseIndex}
          isResting={isResting}
          timer={timer}
          restTimer={restTimer}
          exerciseDetails={exerciseDetails}
          t={t}
          formatTime={formatTime}
          setRestTimer={setRestTimer}
          setIsTraining={setIsTraining}
          handleNextExercise={handleNextExercise}
          openExerciseDetail={openExerciseDetail}
        />
      )}

      {currentDay ? (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-surface-container rounded-[2.5rem] p-8 border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px]"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">target</span>
                  <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                    {t('workout_plans.details.bio_focus')}
                  </h2>
                </div>
                <div
                  className={cn(
                    'px-4 py-1.5 rounded-full flex items-center gap-2 border border-white/5',
                    getStatusColor(currentCalendarItem.status),
                  )}
                >
                  <span className="material-symbols-outlined text-xs">
                    {getStatusIcon(currentCalendarItem.status)}
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-widest">
                    {t(`workout_plans.details.calendar.${currentCalendarItem.status}`)}
                  </span>
                </div>
              </div>
              <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4">
                {currentDay.muscleFocus}
              </h3>
              <p className="text-on-surface-variant text-sm font-medium opacity-70 max-w-2xl leading-relaxed">
                {t('workout_plans.details.scheduled')}:{' '}
                {new Date(currentCalendarItem.scheduledDate).toLocaleDateString(
                  i18n.language === 'vi' ? 'vi-VN' : 'en-US',
                  { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
                )}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant mb-6 px-4">
              {t('workout_plans.details.required_movements')}
            </h4>
            {currentDay.exercises.map((ex, index) => {
              const details = exerciseDetails[ex.exerciseId];
              return (
                <div
                  key={ex._id}
                  onClick={() => openExerciseDetail(ex.exerciseId)}
                  className="group flex flex-col md:flex-row gap-6 bg-[#1a1919] border border-white/5 rounded-[2rem] p-6 hover:border-primary/20 transition-all cursor-pointer active:scale-[0.98]"
                >
                  <div className="w-full md:w-48 h-48 bg-white/5 rounded-3xl overflow-hidden flex items-center justify-center border border-white/5 relative">
                    {details?.gifUrl || details?.imageUrl || details?.imageThumbnailUrl ? (
                      <img
                        src={details.gifUrl || details.imageUrl || details.imageThumbnailUrl}
                        alt={details.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="material-symbols-outlined text-4xl opacity-10">
                        fitness_center
                      </span>
                    )}
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md w-8 h-8 rounded-lg flex items-center justify-center border border-white/10">
                      <span className="text-xs font-black text-primary">{index + 1}</span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div>
                      <h5 className="text-lg font-black text-white uppercase tracking-tight italic group-hover:text-primary transition-colors mb-1">
                        {details?.name || t('workout_plans.details.loading_exercise')}
                      </h5>
                      <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest opacity-50">
                        {details?.bodyPart} • {details?.equipment}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                        <p className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant mb-1">
                          {t('workout_plans.details.sets')}
                        </p>
                        <p className="text-sm font-black text-white">{ex.sets}</p>
                      </div>
                      <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                        <p className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant mb-1">
                          {t('workout_plans.details.reps')}
                        </p>
                        <p className="text-sm font-black text-white">{ex.reps}</p>
                      </div>
                      <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                        <p className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant mb-1">
                          {t('workout_plans.details.rest')}
                        </p>
                        <p className="text-sm font-black text-white">{ex.restSeconds}s</p>
                      </div>
                    </div>

                    {ex.notes && (
                      <div className="bg-secondary/5 border border-secondary/10 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="material-symbols-outlined text-xs text-secondary">
                            info
                          </span>
                          <span className="text-[8px] font-black uppercase tracking-widest text-secondary">
                            {t('workout_plans.details.ai_instruction')}
                          </span>
                        </div>
                        <p className="text-[0.7rem] text-on-surface-variant leading-relaxed">
                          {ex.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-on-surface-variant">{t('workout_plans.details.incomplete')}</p>
        </div>
      )}

      {/* Exercise Details Modal */}
      <ExerciseDetailModal
        exercise={selectedExercise}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </CustomerLayout>
  );
};

export default WorkoutPlanDetailsPage;
