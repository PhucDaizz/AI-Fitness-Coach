import React, { useState } from 'react';
import { sendConfirmEmail } from '../../services/api/auth.service';

const RecoveryCard = ({ isEmailVerified, email }) => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const handleAction = async () => {
    if (!isEmailVerified) {
      // If not verified, the action is to send confirmation email
      try {
        setLoading(true);
        setError(null);
        await sendConfirmEmail();
        setSent(true);
      } catch (err) {
        setError(err.message || "Failed to send verification link");
      } finally {
        setLoading(false);
      }
    } else {
      // If already verified, maybe another action or just success notice
      console.log("Email already verified");
    }
  };

  return (
    <section className="bg-surface-container-low p-8 rounded-[2rem] border border-outline-variant/15 backdrop-blur-md relative overflow-hidden group">
      {/* Subtle background glow when active */}
      {!isEmailVerified && (
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-error/5 rounded-full blur-[60px] pointer-events-none group-hover:bg-error/10 transition-colors"></div>
      )}
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
        <div className="max-w-md">
          <h3 className="font-headline font-bold text-lg text-on-surface flex items-center gap-2 mb-2">
            <span className={`material-symbols-outlined text-xl ${isEmailVerified ? 'text-primary' : 'text-secondary'}`}>
              {isEmailVerified ? 'mark_email_read' : 'lock_reset'}
            </span>
            Password Recovery
          </h3>
          <p className="font-body text-sm text-on-surface-variant leading-relaxed">
            {isEmailVerified 
              ? "Your account is fully secured. You can reset your password using your verified email link."
              : "Email verification is required to enable secure password recovery. No reset links can be issued until your identity is confirmed."}
          </p>
          {error && <p className="text-error text-[10px] mt-2 font-bold uppercase tracking-widest leading-none">{error}</p>}
        </div>
        
        {sent ? (
          <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold text-sm animate-fade-in">
            <span className="material-symbols-outlined text-sm">send</span>
            Link Sent to Inbox
          </div>
        ) : isEmailVerified ? (
          <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold text-sm">
            <span className="material-symbols-outlined text-sm">verified</span>
            Email Verified
          </div>
        ) : (
          <button 
            onClick={handleAction}
            disabled={loading}
            className="bg-surface-container-highest text-on-surface font-semibold px-6 py-3 rounded-full whitespace-nowrap hover:bg-surface-variant transition-all border border-outline-variant/30 flex items-center gap-2 group hover:border-primary/50 relative overflow-hidden"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                Confirm Identity (Verify)
                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </>
            )}
          </button>
        )}
      </div>
      
      {!isEmailVerified && !sent && (
        <div className="mt-6 flex items-center gap-4 p-4 rounded-xl bg-error/10 border border-error/20">
          <div className="w-8 h-8 rounded-full bg-error/20 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-error text-lg">warning</span>
          </div>
          <p className="text-xs text-on-surface font-medium capitalize">
            {email} requires validation to unlock recovery features.
          </p>
        </div>
      )}
    </section>
  );
};

export default RecoveryCard;
