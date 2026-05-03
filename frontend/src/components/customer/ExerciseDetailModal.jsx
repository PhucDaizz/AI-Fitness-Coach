import React from 'react';

const ExerciseDetailModal = ({ exercise, isOpen, onClose }) => {
  if (!isOpen || !exercise) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-xl transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-surface-container w-full max-w-4xl max-h-[90vh] rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all z-20"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div className="flex flex-col md:flex-row h-full">
            
            {/* Visual Section */}
            <div className="w-full md:w-[45%] bg-[#0e0e0e] relative flex items-center justify-center min-h-[300px] md:min-h-0 border-b md:border-b-0 md:border-r border-white/5">
              {exercise.gifUrl || exercise.imageUrl || exercise.imageThumbnailUrl ? (
                <img 
                  src={exercise.gifUrl || exercise.imageUrl || exercise.imageThumbnailUrl} 
                  alt={exercise.name} 
                  className="w-full h-full object-contain p-8"
                />
              ) : (
                <span className="material-symbols-outlined text-[8rem] opacity-5 text-white">fitness_center</span>
              )}
              
              {/* Floating Muscle Tag */}
              <div className="absolute bottom-6 left-6 bg-primary/20 backdrop-blur-md border border-primary/30 px-4 py-2 rounded-2xl">
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Target: {exercise.category?.nameVN || exercise.category?.name || 'Full Body'}</p>
              </div>
            </div>

            {/* Info Section */}
            <div className="flex-1 p-8 md:p-12 space-y-10">
              {/* Header */}
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-white italic uppercase tracking-tighter mb-3 leading-none">
                  {exercise.name}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {exercise.equipments?.map(eq => (
                    <span key={eq.id} className="px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[8px] font-bold text-on-surface-variant uppercase tracking-widest">
                      {eq.nameVN || eq.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Muscles Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant">Primary Muscles</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {exercise.primaryMuscles?.map(m => (
                      <span key={m.id} className="text-sm font-bold text-white px-4 py-2 bg-white/5 rounded-2xl border border-white/5">
                        {m.nameVN || m.nameEN}
                      </span>
                    ))}
                  </div>
                </div>

                {exercise.secondaryMuscles?.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant">Assisting Muscles</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {exercise.secondaryMuscles?.map(m => (
                        <span key={m.id} className="text-[12px] font-bold text-white/70 px-3 py-1.5 bg-white/5 rounded-xl">
                          {m.nameVN || m.nameEN}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="space-y-4 pt-8 border-t border-white/5">
                <div className="flex items-center gap-2">
                   <span className="material-symbols-outlined text-primary text-lg">description</span>
                   <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant">Execution Protocol</h3>
                </div>
                <div className="text-on-surface-variant text-sm leading-relaxed font-medium space-y-4 opacity-80 whitespace-pre-line">
                  {exercise.description || 'No detailed instructions available for this movement.'}
                </div>
              </div>

              {/* Location Tag */}
              <div className="flex gap-4 pt-4">
                {exercise.locationTypes?.map(loc => (
                  <div key={loc} className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm">{loc === 'Gym' ? 'business' : 'home'}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">{loc} Ready</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseDetailModal;
