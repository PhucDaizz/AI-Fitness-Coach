import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import AuthBackground from '../../components/auth/AuthBackground';
import LoginForm from '../../components/auth/LoginForm';

const Login = () => {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLng = i18n.language === 'vi' ? 'en' : 'vi';
    i18n.changeLanguage(nextLng);
  };

  return (
    <div className="bg-background text-on-surface font-body selection:bg-primary selection:text-on-primary min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      <AuthBackground />

      {/* Back to Home Button */}
      <div className="absolute top-8 left-8 z-20">
        <Link
          to="/"
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-bold uppercase tracking-widest text-xs"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          {t('auth.login.back_home')}
        </Link>
      </div>

      {/* Language Switcher */}
      <div className="absolute top-8 right-8 z-20">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-3 py-1 rounded-full border border-outline-variant/30 text-[10px] font-black hover:bg-white/5 transition-all text-on-surface-variant hover:text-primary uppercase tracking-widest"
        >
          <span className="material-symbols-outlined text-xs">language</span>
          {i18n.language === 'vi' ? 'EN' : 'VI'}
        </button>
      </div>

      <main className="w-full max-w-md px-6 py-12 relative z-10">
        {/* Brand Identity */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-black italic tracking-tighter text-primary">KINETIC AI</h1>
          <p className="text-on-surface-variant text-sm mt-2 font-black tracking-wide uppercase">
            {t('auth.login.brand_subtitle')}
          </p>
        </div>

        <LoginForm />

        {/* Footer Link */}
        <p className="text-center mt-10 text-on-surface-variant text-sm font-black">
          {t('auth.login.no_account')}
          <Link
            to="/signup"
            className="text-primary hover:underline underline-offset-4 ml-1 uppercase italic tracking-tighter"
          >
            {t('auth.login.sign_up_now')}
          </Link>
        </p>

        {/* Legal links */}
        <div className="mt-20 flex justify-center gap-8 opacity-40">
          <a
            className="text-[0.625rem] font-bold uppercase tracking-widest hover:text-white transition-colors"
            href="#"
          >
            {t('auth.login.privacy')}
          </a>
          <a
            className="text-[0.625rem] font-bold uppercase tracking-widest hover:text-white transition-colors"
            href="#"
          >
            {t('auth.login.terms')}
          </a>
        </div>
      </main>
    </div>
  );
};

export default Login;
