import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import ProfileSidebar from '../../../components/profile/ProfileSidebar';
import InjuriesSection from '../../../components/profile/fitness/InjuriesSection';
import PhysicalStatsSection from '../../../components/profile/fitness/PhysicalStatsSection';
import ProfileStickyBar from '../../../components/profile/fitness/ProfileStickyBar';
import TrainingSetupSection from '../../../components/profile/fitness/TrainingSection';
import ToastMessage from '../../../components/shared/ToastMessage';
import { getCurrentUser } from '../../../services/api/auth.service';
import { isAdmin } from '../../../utils/authUtils';
import { useFitnessProfile } from './useFitnessProfile';

// ── Loading skeleton ───────────────────────────────────────────────────────────

const LoadingSkeleton: React.FC = () => (
  <div className="space-y-8 animate-pulse">
    {[1, 2, 3].map((i) => (
      <div key={i} className="bg-surface-container rounded-2xl p-6 border border-white/5">
        <div className="h-4 w-1/4 bg-white/10 rounded mb-6" />
        <div className="grid grid-cols-3 gap-3">
          <div className="h-[52px] bg-white/5 rounded-xl" />
          <div className="h-[52px] bg-white/5 rounded-xl" />
          <div className="h-[52px] bg-white/5 rounded-xl" />
        </div>
      </div>
    ))}
  </div>
);

// ── Main Page ──────────────────────────────────────────────────────────────────

const FitnessProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  const token = localStorage.getItem('token');
  const isUserAdmin = isAdmin(token);

  useEffect(() => {
    getCurrentUser().then(setUser).catch(console.error);
  }, []);

  const {
    formData,
    errors,
    isLoading,
    isSaving,
    isDirty,
    toast,
    updateField,
    handleDiscard,
    handleSave,
    dismissToast,
  } = useFitnessProfile();

  return (
    <div className="bg-background text-on-background min-h-screen flex font-body">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 w-full h-16 bg-[#1a1919] border-b border-[#494847]/15 flex items-center px-6 z-50">
        <button onClick={() => setIsSidebarOpen(true)} className="text-white">
          <span className="material-symbols-outlined text-2xl">menu</span>
        </button>
        <span className="ml-4 font-black italic text-primary tracking-tighter">KINETIC AI</span>
      </div>

      {/* Sidebar */}
      <ProfileSidebar
        isAdmin={isUserAdmin}
        fullName={user?.fullName}
        avatarUrl={user?.avatarUrl}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab="fitness"
      />

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pt-24 md:pt-12 px-4 md:px-12 lg:px-24 pb-40 max-w-7xl mx-auto w-full">
        {/* Back link */}
        <Link
          to="/profile"
          className="inline-flex items-center gap-2 mb-6 text-on-surface-variant hover:text-primary transition-colors font-bold uppercase tracking-widest text-[10px]"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          {t('fitness_profile.back_to_profile')}
        </Link>

        {/* Page Header */}
        <header className="mb-10">
          <h1 className="text-[2.25rem] md:text-[3.5rem] font-headline font-bold tracking-[-0.04em] leading-tight mb-2">
            {t('fitness_profile.title')} <span className="text-primary italic">{t('fitness_profile.title_highlight')}</span>
          </h1>
          <p className="text-on-surface-variant font-medium text-sm">
            {t('fitness_profile.subtitle')}
          </p>
        </header>

        {/* Toast */}
        {toast && (
          <div className="mb-8">
            <ToastMessage type={toast.type} message={toast.message} onClose={dismissToast} />
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <div className="space-y-6">
            {/* Section 1 */}
            <div className="bg-surface-container rounded-2xl p-6 md:p-8 border border-white/5">
              <PhysicalStatsSection data={formData} errors={errors} onChange={updateField} />
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-white/5" />
              <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/30">
                02
              </span>
              <div className="flex-1 h-px bg-white/5" />
            </div>

            {/* Section 2 */}
            <div className="bg-surface-container rounded-2xl p-6 md:p-8 border border-white/5">
              <TrainingSetupSection data={formData} errors={errors} onChange={updateField} />
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-white/5" />
              <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/30">
                03
              </span>
              <div className="flex-1 h-px bg-white/5" />
            </div>

            {/* Section 3 */}
            <div className="bg-surface-container rounded-2xl p-6 md:p-8 border border-white/5">
              <InjuriesSection data={formData} onChange={updateField} />
            </div>

            {/* Bottom CTA sau khi save thành công */}
            {!isDirty && !isLoading && (
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">auto_fix_high</span>
                  <p className="text-[13px] font-bold text-on-surface">
                    {t('fitness_profile.updated_msg')}
                  </p>
                </div>
                <Link
                  to="/chat"
                  className="flex-shrink-0 px-5 py-2.5 rounded-full bg-primary text-on-primary text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all"
                >
                  {t('fitness_profile.chat_now')}
                </Link>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Sticky Save Bar */}
      <ProfileStickyBar
        isDirty={isDirty}
        isSaving={isSaving}
        onDiscard={handleDiscard}
        onSave={handleSave}
      />
    </div>
  );
};

export default FitnessProfilePage;
