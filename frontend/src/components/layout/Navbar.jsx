import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLng = i18n.language === 'vi' ? 'en' : 'vi';
    i18n.changeLanguage(nextLng);
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#0e0e0e]/80 backdrop-blur-xl shadow-2xl shadow-black/50">
      <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
        <Link to="/" className="text-2xl font-black italic tracking-tighter text-[#b1ff24]">
          KINETIC AI
        </Link>
        <div className="hidden md:flex gap-8 items-center">
          <a
            className="text-[#b1ff24] border-b-2 border-[#b1ff24] pb-1 font-bold tracking-tight"
            href="#"
          >
            {t('common.features')}
          </a>
          <a
            className="text-[#adaaaa] hover:text-white transition-colors font-bold tracking-tight"
            href="#"
          >
            {t('common.methodology')}
          </a>
        </div>
        <div className="flex gap-4 items-center">
          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-1 rounded-full border border-outline-variant/30 text-xs font-bold hover:bg-white/5 transition-colors text-on-surface"
          >
            <span className="material-symbols-outlined text-sm">language</span>
            {i18n.language === 'vi' ? 'EN' : 'VI'}
          </button>

          <Link
            to="/login"
            className="text-[#adaaaa] hover:text-white transition-colors font-bold tracking-tight"
          >
            {t('common.login')}
          </Link>
          <Link
            to="/signup"
            className="bg-[#b1ff24] text-[#3e5e00] px-6 py-2 rounded-full font-bold scale-95 active:scale-90 transition-transform hover:opacity-80"
          >
            {t('common.get_started')}
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
