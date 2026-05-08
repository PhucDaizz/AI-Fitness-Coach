import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

const ProfileSidebar = ({
  isAdmin: isUserAdmin,
  fullName,
  avatarUrl,
  isOpen,
  onClose,
  activeTab = 'profile',
}) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  const toggleLanguage = () => {
    const nextLng = i18n.language === 'vi' ? 'en' : 'vi';
    i18n.changeLanguage(nextLng);
  };

  const menuItems = [
    {
      id: 'profile',
      label: t('profile.sidebar.personal'),
      icon: 'person',
      path: '/profile',
    },
    {
      id: 'security',
      label: t('profile.sidebar.security'),
      icon: 'shield',
      path: '/security',
    },
    {
      id: 'fitness',
      label: t('profile.sidebar.fitness'),
      icon: 'fitness_center',
      path: '/fitness-profile',
    },
    {
      id: 'settings',
      label: t('profile.sidebar.settings'),
      icon: 'settings',
      path: '#',
    },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-surface-container border-r border-outline-variant/10 z-50 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} flex flex-col`}
      >
        {/* Profile Info Header */}
        <div className="p-8 border-b border-outline-variant/10">
          <div className="flex flex-col items-center">
            <div className="relative group mb-4">
              <div className="w-20 h-20 rounded-full bg-surface-container-highest border-2 border-primary/20 p-1 kinetic-glow overflow-hidden">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={fullName}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                    <span className="material-symbols-outlined text-4xl">account_circle</span>
                  </div>
                )}
              </div>
              <button className="absolute bottom-0 right-0 w-7 h-7 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-sm">edit</span>
              </button>
            </div>
            <h3 className="font-headline font-bold text-lg text-on-surface text-center line-clamp-1">
              {fullName || t('profile.bio.anonymous')}
            </h3>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mt-1">
              KINETIC_MEMBER
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={`flex items-center gap-4 px-4 py-3 rounded-lg font-bold text-sm transition-all duration-200 group ${activeTab === item.id ? 'bg-primary text-on-primary kinetic-glow' : 'text-on-surface-variant hover:bg-white/5 hover:text-white'}`}
            >
              <span
                className={`material-symbols-outlined text-xl ${activeTab === item.id ? 'text-on-primary' : 'group-hover:text-primary transition-colors'}`}
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}

          {isUserAdmin && (
            <Link
              to="/admin"
              className="flex items-center gap-4 px-4 py-3 rounded-lg font-bold text-sm text-secondary hover:bg-white/5 transition-all mt-8 group border border-secondary/10"
            >
              <span className="material-symbols-outlined text-xl group-hover:rotate-12 transition-transform">
                admin_panel_settings
              </span>
              {t('profile.sidebar.admin_panel')}
            </Link>
          )}
        </nav>

        {/* Bottom Actions */}
        <div className="p-6 border-t border-outline-variant/10 space-y-2">
          {/* Language Toggle in Sidebar */}
          <button
            onClick={toggleLanguage}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-bold text-on-surface-variant hover:text-white transition-all group"
          >
            <span className="material-symbols-outlined text-xl group-hover:text-primary transition-colors">
              language
            </span>
            {i18n.language === 'vi' ? 'English (EN)' : 'Tiếng Việt (VI)'}
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-bold text-error hover:bg-error/10 transition-all group"
          >
            <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">
              logout
            </span>
            {t('profile.sidebar.logout')}
          </button>
        </div>
      </aside>
    </>
  );
};

export default ProfileSidebar;
