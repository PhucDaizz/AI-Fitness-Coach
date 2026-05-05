import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const GeneratePlanModal = ({ isOpen, onClose, onGenerate, isGenerating }) => {
  const { t } = useTranslation();
  const [totalWeeks, setTotalWeeks] = useState(4);
  const [startsAt, setStartsAt] = useState(new Date().toISOString().split('T')[0]);
  const [statusIndex, setStatusIndex] = useState(0);
  const [successData, setSuccessData] = useState(null);

  const statusMessages = t('workout_plans.modal.status_messages', { returnObjects: true }) || [];

  React.useEffect(() => {
    let interval;
    if (isGenerating) {
      setSuccessData(null);
      interval = setInterval(() => {
        setStatusIndex((prev) => (prev + 1) % statusMessages.length);
      }, 15000); 
    } else {
      setStatusIndex(0);
    }
    return () => clearInterval(interval);
  }, [isGenerating, statusMessages.length]);

  const handleGenerate = async () => {
    const result = await onGenerate({ totalWeeks, startsAt });
    if (result && result.planIds) {
      setSuccessData(result);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-xl transition-opacity duration-300"
        onClick={isGenerating || successData ? undefined : onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-surface-container w-full max-w-md rounded-[2.5rem] border border-white/10 shadow-2xl p-8 md:p-10 animate-in fade-in zoom-in duration-300">
        
        {!successData ? (
          <>
            <header className="mb-8">
               <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                     <span className="material-symbols-outlined text-primary">auto_fix_high</span>
                  </div>
                  <h2 className="text-sm font-black uppercase tracking-[0.2em] text-primary">{t('workout_plans.modal.generator_title')}</h2>
               </div>
               <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">
                 {t('workout_plans.modal.title')} <span className="text-primary">{t('workout_plans.modal.title_highlight')}</span>
               </h3>
               <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest mt-2 opacity-60">
                 {t('workout_plans.modal.sync_status')}
               </p>
            </header>

            <div className="space-y-6">
              {/* Weeks Selector */}
              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-2">{t('workout_plans.modal.duration')}</label>
                 <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map(w => (
                      <button
                        key={w}
                        onClick={() => setTotalWeeks(w)}
                        disabled={isGenerating}
                        className={`py-3 rounded-2xl border text-xs font-black transition-all ${
                          totalWeeks === w 
                          ? 'bg-primary text-black border-primary shadow-[0_0_15px_rgba(177,255,36,0.2)]' 
                          : 'bg-white/5 border-white/5 text-on-surface-variant hover:border-white/10'
                        } disabled:opacity-50`}
                      >
                        {w}
                      </button>
                    ))}
                 </div>
              </div>

              {/* Date Picker */}
              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-2">{t('workout_plans.modal.start_date')}</label>
                 <input 
                   type="date"
                   value={startsAt}
                   disabled={isGenerating}
                   onChange={(e) => setStartsAt(e.target.value)}
                   className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-white text-sm font-bold focus:outline-none focus:border-primary/50 transition-all disabled:opacity-50"
                 />
              </div>

              {isGenerating && (
                <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 animate-pulse">
                   <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary animate-ping"></div>
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest">
                        {statusMessages[statusIndex]}
                      </p>
                   </div>
                   <p className="text-[8px] text-on-surface-variant mt-2 font-bold uppercase tracking-tighter opacity-50">
                     {t('workout_plans.modal.warning')}
                   </p>
                </div>
              )}

              <div className="pt-4">
                 <button
                   onClick={handleGenerate}
                   disabled={isGenerating}
                   className="w-full py-5 bg-primary text-black font-black uppercase tracking-[0.3em] text-[10px] rounded-full shadow-[0_0_30px_rgba(177,255,36,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        {t('workout_plans.modal.generating')}
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-sm">bolt</span>
                        {t('workout_plans.modal.gen_btn')}
                      </>
                    )}
                 </button>
                 {!isGenerating && (
                   <button
                     onClick={onClose}
                     className="w-full mt-3 py-3 text-[10px] font-black uppercase tracking-widest text-on-surface-variant hover:text-white transition-colors"
                   >
                     {t('workout_plans.modal.abort_btn')}
                   </button>
                 )}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-4 animate-in slide-in-from-bottom duration-500">
             <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center border border-primary/30 mx-auto mb-6 shadow-[0_0_40px_rgba(177,255,36,0.2)]">
                <span className="material-symbols-outlined text-4xl text-primary">check_circle</span>
             </div>
             <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4">
               {t('workout_plans.modal.success_title')} <span className="text-primary">{t('workout_plans.modal.success_title_highlight')}</span>
             </h3>
             <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-8">
                <p className="text-sm text-on-surface-variant font-medium leading-relaxed">
                  {successData.summary}
                </p>
             </div>
             <button
               onClick={() => {
                 setSuccessData(null);
                 onClose();
               }}
               className="w-full py-5 bg-white text-black font-black uppercase tracking-[0.3em] text-[10px] rounded-full hover:bg-primary transition-all shadow-xl"
             >
               {t('workout_plans.modal.access_btn')}
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeneratePlanModal;
