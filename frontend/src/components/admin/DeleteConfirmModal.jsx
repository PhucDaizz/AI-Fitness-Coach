import React from 'react';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, title, message, itemName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md px-4">
      <div className="w-full max-w-sm bg-surface-container rounded-3xl shadow-2xl border border-error/20 overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8 text-center">
          {/* Warning Icon Container */}
          <div className="w-20 h-20 rounded-full bg-error/10 flex items-center justify-center text-error mx-auto mb-6 relative">
            <div className="absolute inset-0 rounded-full bg-error/20 animate-ping opacity-20"></div>
            <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
          </div>

          <h3 className="text-2xl font-black italic tracking-tighter text-white mb-2">{title || 'Confirm Deletion'}</h3>
          <p className="text-on-surface-variant text-sm leading-relaxed mb-8">
            {message || 'Are you sure you want to proceed? This action cannot be undone and will permanently remove'} 
            <span className="text-white font-bold ml-1">"{itemName}"</span>.
          </p>

          <div className="flex flex-col gap-3">
            <button 
              onClick={onConfirm}
              className="w-full py-4 rounded-full bg-error text-on-error font-black uppercase tracking-widest text-xs hover:bg-error-dim transition-all shadow-[0_0_20px_rgba(255,115,81,0.2)] active:scale-[0.98]"
            >
              Delete
            </button>
            <button 
              onClick={onClose}
              className="w-full py-4 rounded-full bg-surface-container-highest text-on-surface-variant font-bold uppercase tracking-widest text-xs hover:text-white transition-all underline-offset-4 hover:underline"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Decorative Kinetic Strip */}
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-error/50 to-transparent"></div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
