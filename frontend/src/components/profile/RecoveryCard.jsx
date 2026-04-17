import React from 'react';

const RecoveryCard = ({ isEmailVerified }) => {
  return (
    <section className="bg-surface-container-low p-8 rounded-[2rem] border border-outline-variant/15 backdrop-blur-md relative overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
        <div className="max-w-md">
          <h3 className="font-headline font-bold text-lg text-on-surface flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-secondary text-xl">mark_email_read</span>
            Password Recovery
          </h3>
          <p className="font-body text-sm text-on-surface-variant leading-relaxed">
            Ensure you never lose access. If you forget your password, we'll send a secure reset link to your verified email address.
          </p>
        </div>
        
        {isEmailVerified ? (
          <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold text-sm">
            <span className="material-symbols-outlined text-sm">verified</span>
            Email Verified
          </div>
        ) : (
          <button className="bg-surface-container-highest text-on-surface font-semibold px-6 py-3 rounded-full whitespace-nowrap hover:bg-surface-variant transition-colors border border-outline-variant/30 flex items-center gap-2 group hover:border-primary/50">
            Request Reset Email
            <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>
        )}
      </div>
      
      {!isEmailVerified && (
        <div className="mt-4 p-3 rounded-lg bg-error/5 border border-error/10 text-[0.7rem] text-error flex items-center gap-2">
          <span className="material-symbols-outlined text-xs">info</span>
          Recovery only available for non-verified profiles (System Policy)
        </div>
      )}
    </section>
  );
};

export default RecoveryCard;
