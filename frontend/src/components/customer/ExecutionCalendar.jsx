import React from 'react';
import { cn } from '../../lib/utils';

const ExecutionCalendar = ({ calendar, activeDayIndex, setActiveDayIndex, t, getStatusColor, getStatusIcon }) => {
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant">
          {t('workout_plans.details.calendar.title')}
        </h3>
      </div>
      
      <div className="flex gap-3 overflow-x-auto no-scrollbar pt-4 pb-6">
        {calendar.map((item, index) => {
          const isSelected = activeDayIndex === index;
          const isToday = item.scheduledDate === new Date().toISOString().split('T')[0];
          
          return (
            <button
              key={item.dayId + item.scheduledDate}
              onClick={() => setActiveDayIndex(index)}
              className={cn(
                "relative flex flex-col items-center min-w-[100px] p-5 rounded-[2rem] transition-all border group",
                isSelected 
                  ? "bg-primary/10 border-primary/40 shadow-[0_0_20px_rgba(177,255,36,0.1)]" 
                  : "bg-surface-container border-white/5 hover:border-white/10"
              )}
            >
              {isToday && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full text-black">
                  {t('workout_plans.details.calendar.today')}
                </span>
              )}
              
              <span className={cn(
                "text-[9px] font-black uppercase tracking-widest mb-2",
                isSelected ? "text-primary" : "text-on-surface-variant"
              )}>
                {item.dayOfWeek.substring(0, 3)}
              </span>
              
              <span className="text-lg font-black text-white mb-3">
                {new Date(item.scheduledDate).getDate()}
              </span>

              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-transform group-hover:scale-110",
                getStatusColor(item.status)
              )}>
                <span className="material-symbols-outlined text-sm">
                  {getStatusIcon(item.status)}
                </span>
              </div>

              {isSelected && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ExecutionCalendar;
