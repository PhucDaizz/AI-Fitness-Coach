import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const CustomerBottomNav = () => {
  const location = useLocation();

  const navItems = [
    { label: 'Coach', icon: 'chat_bubble', path: '/chat' },
    { label: 'Stats', icon: 'monitoring', path: '/stats' },
    { label: 'Plans', icon: 'fitness_center', path: '/plans' },
    { label: 'Profile', icon: 'person', path: '/profile' },
  ];

  return (
    <div className="fixed bottom-8 left-0 right-0 z-[100] px-6 pointer-events-none md:hidden">
      <nav className="max-w-md mx-auto pointer-events-auto">
        <div className="group/nav bg-[#1a1919]/70 backdrop-blur-3xl border border-white/10 rounded-full px-3 py-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex justify-between items-center relative overflow-hidden transition-all duration-500 ease-spring md:opacity-40 md:scale-90 md:hover:opacity-100 md:hover:scale-100 md:hover:py-3">
          
          {/* Subtle inner glow */}
          <div className="absolute inset-0 bg-gradient-to-t from-white/[0.02] to-transparent pointer-events-none"></div>
          
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex flex-col items-center justify-center min-w-[70px] py-1.5 transition-all duration-500 ease-spring active:scale-90 group`}
              >
                {/* Active Indicator Background */}
                {isActive && (
                  <div className="absolute inset-0 bg-[#b1ff24]/10 rounded-full blur-md animate-pulse"></div>
                )}
                
                <span className={`material-symbols-outlined mb-0.5 relative z-10 transition-all duration-500 ${
                  isActive ? 'text-[#b1ff24] scale-110 fill-1' : 'text-[#adaaaa] group-hover:text-white'
                }`} style={{ fontSize: '24px' }}>
                  {item.icon}
                </span>
                
                <span className={`font-['Inter'] text-[9px] font-black uppercase tracking-[0.15em] relative z-10 transition-all duration-500 overflow-hidden whitespace-nowrap ${
                  isActive 
                    ? 'text-[#b1ff24] opacity-100 max-h-4 mt-0.5' 
                    : 'text-[#adaaaa] opacity-60 group-hover:opacity-100 md:max-h-0 md:group-hover/nav:max-h-4 md:group-hover/nav:mt-0.5'
                }`}>
                  {item.label}
                </span>

                {/* iPhone style dot indicator */}
                {isActive && (
                  <div className="absolute -bottom-1 w-1 h-1 bg-[#b1ff24] rounded-full shadow-[0_0_8px_#b1ff24]"></div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default CustomerBottomNav;
