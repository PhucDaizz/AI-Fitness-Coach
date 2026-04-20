import React, { useState } from 'react';
import { sendConfirmEmail } from '../../services/api/auth.service';

const VerificationAlert = ({ email }) => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const handleVerify = async () => {
    try {
      setLoading(true);
      setError(null);
      await sendConfirmEmail();
      setSent(true);
    } catch (err) {
      setError(err.message || "Failed to send verification email");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="mb-12 bg-primary/10 border border-primary/30 rounded-lg p-6 flex items-center gap-4 relative overflow-hidden animate-fade-in">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-primary">mark_email_read</span>
        </div>
        <div>
          <h3 className="text-xl font-bold mb-1 text-primary">Verification Sent!</h3>
          <p className="text-on-surface-variant text-sm">A confirmation link has been sent to <span className="text-white font-bold">{email}</span>. Please check your inbox.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-12 bg-surface-container border border-error/30 rounded-lg p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-error/5 to-transparent pointer-events-none"></div>
      <div className="relative z-10 flex gap-4 items-start">
        <div className="w-10 h-10 rounded-full bg-error/20 flex items-center justify-center shrink-0 mt-1">
          <span className="material-symbols-outlined text-error">warning</span>
        </div>
        <div>
          <h3 className="text-xl font-bold mb-1 text-on-surface">Unverified Comms Channel</h3>
          <p className="text-on-surface-variant text-sm">{email} requires verification to unlock advanced coaching insights.</p>
          {error && <p className="text-error text-[10px] mt-2 font-bold uppercase tracking-widest">{error}</p>}
        </div>
      </div>
      <button 
        onClick={handleVerify}
        disabled={loading}
        className="relative z-10 shrink-0 bg-surface-container-highest text-on-surface hover:text-primary border border-outline-variant/30 px-6 py-3 rounded-full font-bold text-sm uppercase tracking-widest transition-all flex items-center gap-2 group disabled:opacity-50"
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
        ) : (
          <>
            Verify Now
            <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">send</span>
          </>
        )}
      </button>
    </div>
  );
};

export default VerificationAlert;
