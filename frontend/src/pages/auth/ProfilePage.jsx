import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentUser } from '../../services/api/auth.service';
import { getDecodedToken, isAdmin } from '../../utils/authUtils';
import ProfileSidebar from '../../components/profile/ProfileSidebar';
import BioCard from '../../components/profile/BioCard';
import BiometricsForm from '../../components/profile/BiometricsForm';
import VerificationAlert from '../../components/profile/VerificationAlert';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const token = localStorage.getItem('token');
  const isUserAdmin = isAdmin(token);
  const decoded = getDecodedToken(token);
  const userId = decoded?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const data = await getCurrentUser();
      setUser(data);
    } catch (err) {
      console.error("Failed to load profile data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSuccess = (updatedData) => {
    if (updatedData) {
      setSuccess(true);
      setUser(prev => ({ 
        ...prev, 
        ...updatedData 
      }));
      setTimeout(() => setSuccess(false), 5000);
    } else {
      fetchUser();
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
      />

      <main className="flex-1 md:ml-64 pt-24 md:pt-12 px-4 md:px-12 lg:px-24 pb-24 max-w-7xl mx-auto w-full">
        {!isUserAdmin && (
          <Link 
            to="/chat" 
            className="inline-flex items-center gap-2 mb-6 text-on-surface-variant hover:text-primary transition-colors font-bold uppercase tracking-widest text-[10px]"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back
          </Link>
        )}
        <header className="mb-12">
          <h1 className="text-[2.25rem] md:text-[3.5rem] font-headline font-bold tracking-[-0.04em] leading-tight mb-2">Profile Details</h1>
          <p className="text-on-surface-variant font-body font-medium">Manage your identity and biometric anchor points.</p>
        </header>

        {success && (
          <div className="mb-6 bg-primary/10 border border-primary/20 p-4 rounded-lg text-primary text-sm font-bold flex items-center gap-2">
            <span className="material-symbols-outlined">check_circle</span> Profile updated successfully!
          </div>
        )}

        {!user?.emailConfirmed && <VerificationAlert email={user?.email} />}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-4">
            <BioCard user={user} userId={userId} isAdmin={isUserAdmin} />
          </div>

          <div className="lg:col-span-8">
            <BiometricsForm 
              user={user} 
              userId={userId} 
              onUpdateSuccess={handleUpdateSuccess} 
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
