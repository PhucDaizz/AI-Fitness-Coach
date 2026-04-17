import React from 'react';

const VerificationAlert = ({ email }) => {
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
        </div>
      </div>
      <button className="relative z-10 shrink-0 bg-surface-container-highest text-on-surface hover:text-primary border border-outline-variant/30 px-6 py-3 rounded-full font-bold text-sm uppercase tracking-widest transition-all">
        Verify Now
      </button>
    </div>
  );
};

export default VerificationAlert;
