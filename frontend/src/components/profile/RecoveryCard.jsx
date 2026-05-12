import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { sendConfirmEmail } from '../../services/api/auth.service';

const RecoveryCard = ({ isEmailVerified, email }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const handleAction = async () => {
    if (!isEmailVerified) {
      try {
        setLoading(true);
        setError(null);
        await sendConfirmEmail();
        setSent(true);
      } catch (err) {
        setError(err.message || t('security.recovery.error_msg'));
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <section className="bg-surface-container-low p-8 rounded-[2rem] border border-outline-variant/15 backdrop-blur-md relative overflow-hidden group">
      {!isEmailVerified && (
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-error/5 rounded-full blur-[60px] pointer-events-none group-hover:bg-error/10 transition-colors"></div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
        <div className="max-w-md">
          <h3 className="font-headline font-bold text-lg text-on-surface flex items-center gap-2 mb-2">
            <span className={`material-symbols-outlined text-xl ${isEmailVerified ? 'text-primary' : 'text-secondary'}`}>
              {isEmailVerified ? 'mark_email_read' : 'lock_reset'}
            </span>
            {t('security.recovery.password_title')}
          </h3>
          <p className="font-body text-sm text-on-surface-variant leading-relaxed">
            {isEmailVerified
              ? t('security.recovery.password_desc_verified')
              : t('security.recovery.password_desc_unverified')}
          </p>
          {error && <p className="text-error text-[10px] mt-2 font-bold uppercase tracking-widest leading-none">{error}</p>}
        </div>

        {sent ? (
          <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold text-sm animate-fade-in">
            <span className="material-symbols-outlined text-sm">send</span>
            {t('security.recovery.link_sent')}
          </div>
        ) : isEmailVerified ? (
          <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 text-primary border border-primary/20 font-bold text-sm">
            <span className="material-symbols-outlined text-sm">verified</span>
            {t('security.recovery.email_verified')}
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
                {t('security.recovery.verify_now')}
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
            {t('security.verification_alert.unverified_desc', { email: email })}
          </p>
        </div>
      )}
    </section>
  );
};


export default RecoveryCard;
