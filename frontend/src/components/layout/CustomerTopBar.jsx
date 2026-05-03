import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const CustomerTopBar = ({ title = "KINETIC AI" }) => {
  const location = useLocation();

  const navItems = [
    { label: 'Coach', path: '/chat', icon: 'chat_bubble' },
    { label: 'Stats', path: '/stats', icon: 'monitoring' },
    { label: 'Plans', path: '/plans', icon: 'fitness_center' },
    { label: 'Exercises', path: '/exercises', icon: 'exercise' },
    { label: 'Meals', path: '/meals', icon: 'restaurant' },
    { label: 'Profile', path: '/profile', icon: 'person' },
  ];

  return (
    <header className="fixed top-0 w-full z-[100] bg-[#0e0e0e]/90 backdrop-blur-2xl border-b border-white/5 shadow-2xl shadow-black/50">
      <div className="flex justify-between items-center h-16 px-6 w-full mx-auto">
        {/* Left: Brand */}
        <div className="flex items-center gap-4 lg:min-w-[200px]">
          <Link to="/" className="text-2xl font-black italic text-[#b1ff24] tracking-tighter hover:opacity-80 transition-opacity">
            {title}
          </Link>
        </div>

        {/* Center: Navigation (Desktop Only) */}
        <nav className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                  isActive 
                    ? 'bg-[#b1ff24] text-[#0e0e0e] shadow-[0_0_20px_rgba(177,255,36,0.3)]' 
                    : 'text-[#adaaaa] hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-4 lg:min-w-[200px] justify-end">
          <button className="text-[#adaaaa] hover:text-[#b1ff24] transition-colors active:scale-95 transition-transform duration-200">
            <span className="material-symbols-outlined fill-1">notifications</span>
          </button>
          <Link to="/settings" className="text-[#adaaaa] hover:text-[#b1ff24] transition-colors active:scale-95 transition-transform duration-200">
            <span className="material-symbols-outlined fill-1">settings</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default CustomerTopBar;
