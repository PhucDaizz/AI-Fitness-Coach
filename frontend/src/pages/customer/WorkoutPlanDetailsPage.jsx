import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getWorkoutPlanDays, deleteWorkoutPlan } from '../../services/api/workoutPlan.service';
import { getExerciseById } from '../../services/api/exercise.service';
import CustomerLayout from '../../components/layout/CustomerLayout';
import ExerciseDetailModal from '../../components/customer/ExerciseDetailModal';

const WorkoutPlanDetailsPage = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [days, setDays] = useState([]);
  const [exerciseDetails, setExerciseDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeDayIndex, setActiveDayIndex] = useState(0);

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

  const handleDeletePlan = async () => {
    if (!window.confirm("Are you sure you want to permanently terminate this protocol? This action cannot be undone.")) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteWorkoutPlan(planId);
      navigate('/plans');
    } catch (err) {
      console.error("Failed to delete plan", err);
      alert(err.message || "Failed to delete plan");
    } finally {
      setIsDeleting(false);
    }
  };

  const fetchPlanDetails = async () => {
    try {
      setLoading(true);
      const daysData = await getWorkoutPlanDays(planId);
      setDays(daysData || []);

      const exerciseIds = [...new Set(
        (daysData || []).flatMap(day => day.exercises.map(ex => ex.exerciseId))
      )];

      const details = {};
      await Promise.all(exerciseIds.map(async (id) => {
        try {
          const exData = await getExerciseById(id);
          details[id] = exData;
        } catch (err) {
          console.error(`Failed to fetch exercise ${id}`, err);
        }
      }));
      setExerciseDetails(details);
    } catch (err) {
      console.error("Failed to fetch plan details", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Deciphering Protocol Data...</p>
        </div>
      </div>
    );
  }

  const currentDay = days[activeDayIndex];

  return (
    <CustomerLayout title="KINETIC AI" fullWidth={false}>
      <div className="flex justify-between items-start mb-8">
        <button
          onClick={() => navigate('/plans')}
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-black uppercase tracking-widest text-[10px]"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Protocols
        </button>

        <button
          onClick={handleDeletePlan}
          disabled={isDeleting}
          className="flex items-center gap-2 bg-error/10 border border-error/20 px-4 py-2 rounded-full text-error hover:bg-error hover:text-white transition-all font-black uppercase tracking-widest text-[8px] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-xs">
            {isDeleting ? 'sync' : 'delete'}
          </span>
          {isDeleting ? 'Terminating...' : 'Terminate Protocol'}
        </button>
      </div>

      <header className="mb-10">
        <h1 className="text-[2.5rem] font-headline font-black italic tracking-tighter uppercase leading-none mb-2">
          Protocol <span className="text-primary">Timeline</span>
        </h1>
        <p className="text-on-surface-variant font-medium text-sm tracking-wide opacity-70">
          Phased execution strategy for optimal physiological adaptation.
        </p>
      </header>

      {/* Day Navigation */}
      <div className="flex gap-3 mb-10 overflow-x-auto no-scrollbar pb-4 border-b border-white/5">
        {days.map((day, index) => (
          <button
            key={day._id}
            onClick={() => setActiveDayIndex(index)}
            className={`flex flex-col items-start min-w-[120px] p-4 rounded-2xl transition-all border ${activeDayIndex === index
              ? 'bg-primary/10 border-primary/30 text-primary'
              : 'bg-white/5 border-white/5 text-on-surface-variant hover:border-white/10'
              }`}
          >
            <span className="text-[10px] font-black uppercase tracking-widest mb-1">
              Day {day.orderIndex}
            </span>
            <span className="text-sm font-bold truncate w-full">{day.dayOfWeek}</span>
          </button>
        ))}
      </div>

      {currentDay ? (
        <div className="space-y-10">
          <div className="bg-surface-container rounded-[2.5rem] p-8 border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px]"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-primary">target</span>
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Biological Focus</h2>
              </div>
              <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4">
                {currentDay.muscleFocus}
              </h3>
              <p className="text-on-surface-variant text-sm font-medium opacity-70 max-w-2xl leading-relaxed">
                Scheduled for: {new Date(currentDay.scheduledDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant mb-6 px-4">Required Movements</h4>
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
                      <span className="material-symbols-outlined text-4xl opacity-10">fitness_center</span>
                    )}
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md w-8 h-8 rounded-lg flex items-center justify-center border border-white/10">
                      <span className="text-xs font-black text-primary">{index + 1}</span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div>
                      <h5 className="text-lg font-black text-white uppercase tracking-tight italic group-hover:text-primary transition-colors mb-1">
                        {details?.name || 'Loading Exercise...'}
                      </h5>
                      <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest opacity-50">
                        {details?.bodyPart} • {details?.equipment}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                        <p className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Sets</p>
                        <p className="text-sm font-black text-white">{ex.sets}</p>
                      </div>
                      <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                        <p className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Reps</p>
                        <p className="text-sm font-black text-white">{ex.reps}</p>
                      </div>
                      <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                        <p className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Rest</p>
                        <p className="text-sm font-black text-white">{ex.restSeconds}s</p>
                      </div>
                    </div>

                    {ex.notes && (
                      <div className="bg-secondary/5 border border-secondary/10 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="material-symbols-outlined text-xs text-secondary">info</span>
                          <span className="text-[8px] font-black uppercase tracking-widest text-secondary">AI Instruction</span>
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
          <p className="text-on-surface-variant">Protocol structure incomplete.</p>
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
