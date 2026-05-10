import React from 'react';
import { cn } from '../../lib/utils';

const TrainingSessionOverlay = ({ 
  currentDay, 
  currentExerciseIndex, 
  isResting, 
  timer, 
  restTimer, 
  exerciseDetails, 
  t, 
  formatTime, 
  setRestTimer, 
  setIsTraining, 
  handleNextExercise,
  openExerciseDetail // New prop
}) => {
  const activeEx = currentDay.exercises[currentExerciseIndex];
  const details = exerciseDetails[activeEx.exerciseId];

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col animate-in fade-in duration-300">
      {/* Training Header */}
      <div className="h-20 border-b border-white/5 flex items-center justify-between px-6 bg-surface-container/50 backdrop-blur-xl">
         <div className="flex items-center gap-4">
           <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
             <span className="material-symbols-outlined text-primary">timer</span>
           </div>
           <div>
             <p className="text-[10px] font-black uppercase tracking-widest text-primary">{t('workout_plans.details.training_session.timer')}</p>
             <p className="text-xl font-headline font-black italic text-white tracking-tight">{formatTime(timer)}</p>
           </div>
         </div>

         <div className="flex flex-col items-end">
           <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">{t('workout_plans.details.training_session.exercise')}</p>
           <p className="text-sm font-bold text-white">
             {currentExerciseIndex + 1} <span className="text-on-surface-variant/40">/ {currentDay.exercises.length}</span>
           </p>
         </div>
      </div>

      {/* Training Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center">
         {/* Exercise Card */}
         <div className="w-full max-w-4xl bg-surface-container rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border border-white/5 relative flex flex-col md:flex-row min-h-[500px]">
            {/* Media Section */}
            <div className="w-full md:w-1/2 bg-black/20 flex items-center justify-center relative overflow-hidden aspect-video md:aspect-auto p-4">
               {details?.gifUrl || details?.imageUrl ? (
                 <img src={details.gifUrl || details.imageUrl} alt={details.name} className="w-full h-full object-contain drop-shadow-2xl" />
               ) : (
                 <span className="material-symbols-outlined text-6xl opacity-10">fitness_center</span>
               )}

               {isResting && (
                 <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center animate-in zoom-in duration-300 z-20">
                    <p className="text-primary text-[10px] font-black uppercase tracking-[0.4em] mb-4">{t('workout_plans.details.training_session.rest_timer')}</p>
                    <p className="text-8xl font-headline font-black italic text-white tracking-tighter mb-8">{restTimer}</p>
                    <button 
                      onClick={() => setRestTimer(0)}
                      className="px-8 py-3 rounded-full bg-white/10 border border-white/10 text-white font-black uppercase tracking-widest text-[10px] hover:bg-white/20 transition-all"
                    >
                      Skip Rest
                    </button>
                 </div>
               )}
            </div>

            {/* Info & Actions Section */}
            <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-between">
               <div>
                  <div className="flex items-center justify-between gap-4 mb-6">
                     <div>
                        <div className="flex items-center gap-3 mb-1">
                           <h2 className="text-2xl md:text-3xl font-headline font-black italic uppercase tracking-tighter text-white">{details?.name}</h2>
                           <button 
                             onClick={() => openExerciseDetail(activeEx.exerciseId)}
                             className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors border border-white/5"
                             title="View Details"
                           >
                              <span className="material-symbols-outlined text-sm">info</span>
                           </button>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary">{details?.bodyPart} • {details?.equipment}</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                     <div className="bg-white/5 rounded-2xl px-6 py-3 border border-white/5 text-center">
                        <p className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant mb-1">{t('workout_plans.details.sets')}</p>
                        <p className="text-xl font-black text-white">{activeEx.sets}</p>
                     </div>
                     <div className="bg-white/5 rounded-2xl px-6 py-3 border border-white/5 text-center">
                        <p className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant mb-1">{t('workout_plans.details.reps')}</p>
                        <p className="text-xl font-black text-white">{activeEx.reps}</p>
                     </div>
                  </div>

                  {activeEx.notes && (
                    <div className="bg-secondary/5 border border-secondary/10 rounded-[1.5rem] p-5 mb-8">
                       <div className="flex items-center gap-2 mb-2">
                          <span className="material-symbols-outlined text-secondary text-sm">info</span>
                          <span className="text-[9px] font-black uppercase tracking-widest text-secondary">{t('workout_plans.details.ai_instruction')}</span>
                       </div>
                       <p className="text-[0.75rem] text-on-surface-variant leading-relaxed font-medium line-clamp-4">
                          {activeEx.notes}
                       </p>
                    </div>
                  )}
               </div>

               {/* Action Buttons */}
               <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                  <button 
                    onClick={() => setIsTraining(false)}
                    className="flex-1 py-4 rounded-[1.2rem] bg-surface-container-highest border border-white/5 text-on-surface-variant font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all"
                  >
                    {t('workout_plans.details.training_session.quit')}
                  </button>
                  <button 
                    onClick={handleNextExercise}
                    disabled={isResting}
                    className="flex-[2] py-4 rounded-[1.2rem] bg-primary text-on-primary font-black uppercase tracking-widest text-xs hover:bg-primary/90 transition-all disabled:opacity-50"
                  >
                    {currentExerciseIndex === currentDay.exercises.length - 1 
                      ? t('workout_plans.details.training_session.finish') 
                      : t('workout_plans.details.training_session.next')}
                  </button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default TrainingSessionOverlay;
