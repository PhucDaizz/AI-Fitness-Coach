import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { confirmEmail } from '../../services/api/auth.service';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('processing'); // 'processing', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const userId = searchParams.get('userId');
    const token = searchParams.get('token');

    if (userId && token) {
      handleVerification(userId, token);
    } else {
      setStatus('error');
      setErrorMessage('Missing verification parameters.');
    }
  }, [searchParams]);

  const handleVerification = async (userId, token) => {
    try {
      await confirmEmail(userId, token);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err.message || 'Verification failed. The link may be expired or invalid.');
    }
  };

  return (
    <div className="bg-background text-on-surface font-body selection:bg-primary selection:text-on-primary min-h-screen flex flex-col">
      <header className="flex justify-between items-center w-full px-6 py-8">
        <div className="text-2xl font-black italic tracking-tighter text-primary">KINETIC AI</div>
        <div className="hidden md:block">
          <span className="text-on-surface-variant text-xs font-label uppercase tracking-widest">High Performance Digital Cockpit</span>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-6 py-12 relative overflow-hidden">
        {/* Background Background Text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.03] select-none">
          <h1 className="text-[35vw] font-black italic tracking-tighter leading-none">
            {status === 'success' ? 'SENT' : status === 'error' ? 'FAIL' : 'AUTH'}
          </h1>
        </div>

        <div className="w-full max-w-md z-10 flex flex-col items-center text-center">
          {/* Visual Indicator Container */}
          <div className="relative mb-12 flex items-center justify-center">
            {/* Dynamic Velocity Lines */}
            <div className="absolute -left-24 top-0 space-y-4">
              <div className="bg-primary/20 h-[2px] w-16 -rotate-[30deg] rounded-full"></div>
              <div className="bg-primary/20 h-[2px] w-24 -rotate-[20deg] opacity-50 translate-x-4 rounded-full"></div>
              <div className="bg-primary/20 h-[2px] w-12 -rotate-[40deg] opacity-30 -translate-y-4 rounded-full"></div>
            </div>

            <div className="relative">
              {/* Glow effects */}
              <div className={`absolute inset-0 blur-[40px] rounded-full animate-pulse ${status === 'error' ? 'bg-error/30' : 'bg-primary/30'}`}></div>
              
              <div className="relative bg-surface-container w-28 h-28 rounded-full border border-primary/20 flex items-center justify-center shadow-[0_0_50px_rgba(177,255,36,0.3)]">
                {status === 'processing' ? (
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                ) : status === 'success' ? (
                  <span className="material-symbols-outlined text-primary text-6xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                ) : (
                  <span className="material-symbols-outlined text-error text-6xl" style={{ fontVariationSettings: "'FILL' 1" }}>cancel</span>
                )}
              </div>
            </div>

            <div className="absolute -right-24 top-0 space-y-4">
              <div className="bg-primary/20 h-[2px] w-20 rotate-[30deg] right-0 rounded-full"></div>
              <div className="bg-primary/20 h-[2px] w-14 rotate-[20deg] opacity-50 -translate-x-6 right-0 rounded-full"></div>
              <div className="bg-primary/20 h-[2px] w-28 rotate-[40deg] opacity-30 translate-y-6 right-0 rounded-full"></div>
            </div>
          </div>

          {/* Content Header */}
          <div className="mb-12">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4 leading-tight italic uppercase">
              {status === 'processing' ? 'Verifying...' : status === 'success' ? 'Email Verified' : 'Verification Failed'}
            </h2>
            <p className="text-on-surface-variant text-base leading-relaxed max-w-[320px] mx-auto">
              {status === 'processing' 
                ? 'Đang liên kết với cơ sỡ dữ liệu trung tâm...' 
                : status === 'success' 
                  ? 'Cảm ơn bạn đã xác nhận email. Tài khoản của bạn đã sẵn sàng.' 
                  : errorMessage}
            </p>
          </div>

          {/* Action Button */}
          {status !== 'processing' && (
            <div className="w-full space-y-6">
              <Link to="/login" className="block w-full bg-primary text-on-primary font-black italic uppercase tracking-wider py-5 rounded-full hover:opacity-90 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(177,255,36,0.2)]">
                {status === 'success' ? 'Back to Login' : 'Try Again'}
                <span className="material-symbols-outlined text-xl">
                  {status === 'success' ? 'login' : 'refresh'}
                </span>
              </Link>
            </div>
          )}
        </div>

        {/* Informative Footer */}
        <div className="absolute bottom-12 right-12 hidden lg:block">
          <div className="flex flex-col items-end">
            <div className="w-12 h-[2px] bg-primary mb-2"></div>
            <span className="text-[10px] font-label text-on-surface-variant uppercase tracking-[0.3em]">Module_048 // {status.toUpperCase()}</span>
          </div>
        </div>
      </main>

      {/* Confirmation visualizer */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-surface-container-highest/40 kinetic-blur px-4 py-2 rounded-full border border-outline-variant/10">
        <div className={`w-2 h-2 rounded-full animate-pulse shadow-[0_0_8px] ${status === 'error' ? 'bg-error shadow-error' : 'bg-primary shadow-primary'}`}></div>
        <span className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">
          {status === 'processing' ? 'Processing Transaction' : 'Action Confirmed'}
        </span>
      </div>

      {/* Atmospheric Layers */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2"></div>
      </div>
    </div>
  );
};

export default VerifyEmail;
