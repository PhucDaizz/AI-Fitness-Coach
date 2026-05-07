import React from 'react';

// ── Types ──────────────────────────────────────────────────────────────────────

interface ProfileStickyBarProps {
  isDirty: boolean;
  isSaving: boolean;
  onDiscard: () => void;
  onSave: () => void;
}

// ── Main Component ─────────────────────────────────────────────────────────────

const ProfileStickyBar: React.FC<ProfileStickyBarProps> = ({
  isDirty,
  isSaving,
  onDiscard,
  onSave,
}) => {
  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
        isDirty
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : 'translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      {/* Gradient fade trên cùng */}
      <div className="h-8 bg-gradient-to-t from-background to-transparent pointer-events-none" />

      {/* Bar chính */}
      <div className="bg-background/95 backdrop-blur-xl border-t border-white/8 px-4 py-4 md:py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          {/* Left: unsaved hint */}
          <div className="hidden sm:flex items-center gap-2">
            <span
              className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"
              style={{ boxShadow: '0 0 6px rgba(250,204,21,0.6)' }}
            />
            <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
              Có thay đổi chưa lưu
            </span>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-3 ml-auto">
            <button
              type="button"
              onClick={onDiscard}
              disabled={isSaving}
              className="h-10 px-5 rounded-full border border-white/15 text-on-surface-variant text-[11px] font-bold uppercase tracking-widest hover:border-white/30 hover:text-white transition-all disabled:opacity-40"
            >
              Discard
            </button>

            <button
              type="button"
              onClick={onSave}
              disabled={isSaving}
              className="h-10 px-7 rounded-full bg-primary text-on-primary text-[11px] font-black uppercase tracking-widest transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              style={{ boxShadow: '0 0 20px rgba(177,255,36,0.3)' }}
            >
              {isSaving ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">save</span>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileStickyBar;
