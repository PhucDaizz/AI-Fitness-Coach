import React, { useState, useEffect } from 'react';
import { getWorkoutPlanDays, submitWorkoutLog } from '../../services/api/workoutPlan.service';
import { getExerciseById } from '../../services/api/exercise.service';

const WorkoutLogForm = ({ planId, dayId, scheduledDate }) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [dayData, setDayData] = useState(null);
  const [exercisesInfo, setExercisesInfo] = useState({});
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    durationMinutes: 0,
    difficultyFeedback: 'ok',
    notes: '',
    exercises: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 1. Fetch days for plan
        const days = await getWorkoutPlanDays(planId);
        
        // 2. Find specific day
        const day = days.find(d => d._id === dayId);
        if (!day) {
          throw new Error('Day not found in this plan');
        }
        setDayData(day);

        // Initialize form data for exercises
        const initialExercises = day.exercises.map(ex => ({
          exerciseId: ex.exerciseId,
          setsDone: ex.sets || 0,
          repsDone: '', // User will input comma separated like '12,10,8'
          weightKg: 0,
          isCompleted: true
        }));
        
        setFormData(prev => ({ ...prev, exercises: initialExercises }));

        // 3. Fetch exercise details (names, media)
        const info = {};
        await Promise.all(
          day.exercises.map(async (ex) => {
            try {
              const exDetails = await getExerciseById(ex.exerciseId);
              info[ex.exerciseId] = exDetails;
            } catch (err) {
              console.error(`Failed to fetch exercise ${ex.exerciseId}`, err);
            }
          })
        );
        setExercisesInfo(info);
      } catch (err) {
        console.error('Error fetching workout data:', err);
        setError(err.message || 'Failed to load workout details.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [planId, dayId]);

  const handleExerciseChange = (index, field, value) => {
    setFormData(prev => {
      const newExercises = [...prev.exercises];
      newExercises[index] = { ...newExercises[index], [field]: value };
      return { ...prev, exercises: newExercises };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      
      const logData = {
        planId,
        dayId,
        loggedDate: scheduledDate,
        durationMinutes: parseInt(formData.durationMinutes) || 0,
        difficultyFeedback: formData.difficultyFeedback,
        notes: formData.notes,
        exercises: formData.exercises.map(ex => ({
          ...ex,
          setsDone: parseInt(ex.setsDone) || 0,
          weightKg: parseFloat(ex.weightKg) || 0,
        }))
      };

      await submitWorkoutLog(logData);
      setSubmitted(true);
    } catch (err) {
      console.error('Error submitting log:', err);
      setError(err.message || 'Failed to save workout log.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 rounded-2xl bg-surface-container border border-white/5 shadow-xl animate-pulse flex flex-col gap-4">
        <div className="h-4 w-1/3 bg-white/10 rounded"></div>
        <div className="h-20 w-full bg-white/10 rounded"></div>
        <div className="h-10 w-full bg-white/10 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm flex items-center gap-2">
        <span className="material-symbols-outlined">error</span>
        <span>{error}</span>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="p-6 rounded-2xl bg-primary/10 border border-primary/20 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto mb-2">
          <span className="material-symbols-outlined text-2xl">check_circle</span>
        </div>
        <h4 className="text-primary font-bold text-lg">Workout Logged!</h4>
        <p className="text-sm text-on-surface-variant">Great job completing your workout. Your data has been synchronized.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md sm:max-w-lg lg:max-w-xl mt-3 bg-surface-container rounded-xl border border-white/10 shadow-lg overflow-hidden font-body text-xs">
      <div className="p-3 bg-white/5 border-b border-white/10 flex justify-between items-center">
        <div>
          <h3 className="text-sm font-bold text-primary flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">fitness_center</span>
            Log Workout
          </h3>
          {dayData && (
            <p className="text-[9px] text-on-surface-variant mt-0.5">
              <strong className="text-on-surface">{dayData.dayOfWeek}</strong> • {dayData.muscleFocus}
            </p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-3 space-y-4">
        
        {/* General Info */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">Duration (mins)</label>
            <input 
              type="number" 
              value={formData.durationMinutes}
              onChange={(e) => setFormData({...formData, durationMinutes: e.target.value})}
              className="w-full bg-surface-container-high border border-white/10 rounded-md p-1.5 text-xs text-on-surface focus:outline-none focus:border-primary/50"
              placeholder="e.g. 45"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">Difficulty</label>
            <select 
              value={formData.difficultyFeedback}
              onChange={(e) => setFormData({...formData, difficultyFeedback: e.target.value})}
              className="w-full bg-surface-container-high border border-white/10 rounded-md p-1.5 text-xs text-on-surface focus:outline-none focus:border-primary/50"
            >
              <option value="easy">Easy</option>
              <option value="ok">OK</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        {/* Exercises List */}
        <div className="space-y-2">
          
          {formData.exercises.map((ex, index) => {
            const info = exercisesInfo[ex.exerciseId];
            const planEx = dayData.exercises.find(e => e.exerciseId === ex.exerciseId);

            return (
              <div key={index} className="p-2 bg-surface-container-low rounded-lg border border-white/5 space-y-2">
                
                {/* Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 overflow-hidden">
                    {info?.mediaUrl ? (
                      <img src={info.mediaUrl} alt={info.name} className="w-6 h-6 object-cover rounded bg-white/5" />
                    ) : (
                      <div className="w-6 h-6 rounded bg-white/5 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[12px] text-on-surface-variant/50">image</span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-on-surface truncate">{info?.name || 'Loading...'}</p>
                      <p className="text-[9px] text-primary truncate">Target: {planEx?.sets}x{planEx?.reps}</p>
                    </div>
                  </div>
                  <label className="flex items-center gap-1 cursor-pointer shrink-0">
                    <span className="text-[10px] text-on-surface-variant">Done</span>
                    <input 
                      type="checkbox"
                      checked={ex.isCompleted}
                      onChange={(e) => handleExerciseChange(index, 'isCompleted', e.target.checked)}
                      className="w-3 h-3 accent-primary"
                    />
                  </label>
                </div>

                {/* Inputs */}
                {ex.isCompleted && (
                  <div className="flex gap-2 items-center pl-8">
                    <div className="flex items-center gap-1">
                      <label className="text-[9px] text-on-surface-variant w-6">Sets</label>
                      <input 
                        type="number" 
                        value={ex.setsDone}
                        onChange={(e) => handleExerciseChange(index, 'setsDone', e.target.value)}
                        className="w-10 bg-surface-container border border-white/5 rounded px-1 py-0.5 text-[10px] text-on-surface text-center"
                      />
                    </div>
                    <div className="flex items-center gap-1 flex-grow">
                      <label className="text-[9px] text-on-surface-variant shrink-0">Reps</label>
                      <input 
                        type="text" 
                        value={ex.repsDone}
                        onChange={(e) => handleExerciseChange(index, 'repsDone', e.target.value)}
                        placeholder="e.g. 10,8,8"
                        className="w-full min-w-[50px] bg-surface-container border border-white/5 rounded px-1.5 py-0.5 text-[10px] text-on-surface"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <label className="text-[9px] text-on-surface-variant shrink-0">Wt (kg)</label>
                      <input 
                        type="number" 
                        value={ex.weightKg}
                        onChange={(e) => handleExerciseChange(index, 'weightKg', e.target.value)}
                        className="w-12 bg-surface-container border border-white/5 rounded px-1 py-0.5 text-[10px] text-on-surface text-center"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Notes */}
        <div className="space-y-1">
          <label className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">Notes</label>
          <textarea 
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            className="w-full bg-surface-container-high border border-white/10 rounded-md p-2 text-xs text-on-surface focus:outline-none focus:border-primary/50 resize-y min-h-[40px]"
            placeholder="How did you feel?"
          ></textarea>
        </div>

        <button 
          type="submit" 
          disabled={submitting}
          className="w-full py-2 rounded-lg font-bold uppercase tracking-wider text-[10px] transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-1.5 bg-primary text-on-primary hover:bg-primary/90"
        >
          {submitting ? (
            <>
              <span className="material-symbols-outlined animate-spin text-[14px]">progress_activity</span>
              Saving...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[14px]">check_circle</span>
              Submit Workout Log
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default WorkoutLogForm;
