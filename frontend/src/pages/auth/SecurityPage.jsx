import React, { useState, useEffect } from 'react';
import { getCurrentUser } from '../../services/api/auth.service';
import { isAdmin } from '../../utils/authUtils';
import ProfileSidebar from '../../components/profile/ProfileSidebar';
import ChangePasswordForm from '../../components/profile/ChangePasswordForm';
import RecoveryCard from '../../components/profile/RecoveryCard';

const SecurityPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const token = localStorage.getItem('token');
  const isUserAdmin = isAdmin(token);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const data = await getCurrentUser();
      setUser(data);
    } catch (err) {
      console.error("Failed to load user data", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex font-body">
      {/* Mobile Header Toggle */}
      <div className="md:hidden fixed top-0 left-0 w-full h-16 bg-[#1a1919] border-b border-[#494847]/15 flex items-center px-6 z-50">
        <button onClick={() => setIsSidebarOpen(true)} className="text-white">
          <span className="material-symbols-outlined text-2xl">menu</span>
        </button>
        <span className="ml-4 font-black italic text-primary tracking-tighter">KINETIC AI</span>
      </div>

      <ProfileSidebar 
        isAdmin={isUserAdmin} 
        fullName={user?.fullName} 
        avatarUrl={user?.avatarUrl} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab="security"
      />

      <main className="flex-1 md:ml-64 pt-24 md:pt-12 pb-24 max-w-7xl mx-auto w-full">
        {/* Header Section */}
        <div className="px-6 md:px-12 pt-4 pb-8 relative z-10">
          <h1 className="font-headline font-bold text-[2.25rem] md:text-[3.5rem] tracking-tight leading-none text-on-surface relative">
            Account Security
            <span className="absolute -z-10 right-0 top-0 text-[8rem] font-black text-surface-container-highest/10 select-none hidden md:block">02</span>
          </h1>
          <p className="font-body text-on-surface-variant text-base mt-4 max-w-2xl">
            Manage your credentials, monitor active sessions, and reinforce your account defenses.
          </p>
        </div>

        {/* Content Area */}
        <div className="px-6 md:px-12 flex flex-col gap-10 justify-center items-center">
          <div className="max-w-4xl w-full">
            <ChangePasswordForm />
          </div>
          
          <div className="max-w-4xl w-full">
            <RecoveryCard isEmailVerified={user?.emailConfirmed} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default SecurityPage;
