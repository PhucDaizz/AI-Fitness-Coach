import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';

import useChatSignalR from '../../hooks/useChatSignalR';

const CustomerTopBar = ({ title = 'KINETIC AI' }) => {
  const location = useLocation();
  const { t } = useTranslation();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [planNotification, setPlanNotification] = useState(null);

  const navItems = [
    { label: 'Coach', path: '/chat', icon: 'chat_bubble' },
    { label: 'Stats', path: '/stats', icon: 'monitoring' },
    { label: 'Plans', path: '/plans', icon: 'fitness_center' },
    { label: 'Exercises', path: '/exercises', icon: 'exercise' },
    { label: 'Meals', path: '/meals', icon: 'restaurant' },
    { label: 'Profile', path: '/profile', icon: 'person' },
  ];

  const signalRHandlers = useMemo(
    () => ({
      WorkoutPlanGenerationUpdated: (job) => {
        if (job?.status === 'Completed' || job?.status === 'Failed') {
          setPlanNotification(job);
        }
      },
    }),
    [],
  );

  useChatSignalR(signalRHandlers);

  const hasUnreadNotification = Boolean(planNotification);
  const notificationMessage = planNotification
    ? t(`workout_plans.generation.notifications.${planNotification.status}`, {
        defaultValue: planNotification.message,
      })
    : t('workout_plans.generation.notifications.empty');

  return (
    <header className="fixed top-0 w-full z-[100] bg-[#0e0e0e]/90 backdrop-blur-2xl border-b border-white/5 shadow-2xl shadow-black/50">
      <div className="flex justify-between items-center h-16 px-6 w-full mx-auto">
        {/* Left: Brand */}
        <div className="flex items-center gap-4 lg:min-w-[200px]">
          <Link
            to="/"
            className="text-2xl font-black italic text-[#b1ff24] tracking-tighter hover:opacity-80 transition-opacity"
          >
            {title}
          </Link>
        </div>

        {/* Center: Navigation (Desktop Only) */}
        <nav className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                  isActive
                    ? 'bg-[#b1ff24] text-[#0e0e0e] shadow-[0_0_20px_rgba(177,255,36,0.3)]'
                    : 'text-[#adaaaa] hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-4 lg:min-w-[200px] justify-end">
          <div className="relative">
            <button
              onClick={() => setIsNotificationOpen((prev) => !prev)}
              className="relative text-[#adaaaa] hover:text-[#b1ff24] transition-colors active:scale-95 transition-transform duration-200"
            >
              <span className="material-symbols-outlined fill-1">notifications</span>
              {hasUnreadNotification && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#b1ff24] shadow-[0_0_10px_rgba(177,255,36,0.8)]"></span>
              )}
            </button>

            {isNotificationOpen && (
              <div className="absolute right-0 top-10 w-80 rounded-3xl border border-white/10 bg-[#151515] shadow-2xl shadow-black/60 p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#b1ff24]">
                    {t('workout_plans.generation.notifications.title')}
                  </p>
                  {hasUnreadNotification && (
                    <button
                      onClick={() => setPlanNotification(null)}
                      className="text-[9px] font-black uppercase tracking-widest text-[#adaaaa] hover:text-white"
                    >
                      {t('workout_plans.generation.notifications.clear')}
                    </button>
                  )}
                </div>

                <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                  <div className="flex gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#b1ff24]/10 border border-[#b1ff24]/20 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[#b1ff24] text-lg">
                        {planNotification?.status === 'Failed' ? 'error' : 'fitness_center'}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-white uppercase tracking-wide">
                        {hasUnreadNotification
                          ? t('workout_plans.generation.notifications.plan_title')
                          : t('workout_plans.generation.notifications.empty_title')}
                      </p>
                      <p className="text-[11px] font-bold text-[#adaaaa] mt-1 leading-relaxed">
                        {notificationMessage}
                      </p>

                      {planNotification?.status === 'Completed' &&
                        planNotification.planIds?.[0] && (
                          <Link
                            to={`/plans/${planNotification.planIds[0]}`}
                            onClick={() => {
                              setIsNotificationOpen(false);
                              setPlanNotification(null);
                            }}
                            className="inline-flex mt-4 px-4 py-2 rounded-full bg-[#b1ff24] text-black text-[9px] font-black uppercase tracking-widest"
                          >
                            {t('workout_plans.generation.open_plan')}
                          </Link>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <Link
            to="/settings"
            className="text-[#adaaaa] hover:text-[#b1ff24] transition-colors active:scale-95 transition-transform duration-200"
          >
            <span className="material-symbols-outlined fill-1">settings</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default CustomerTopBar;
