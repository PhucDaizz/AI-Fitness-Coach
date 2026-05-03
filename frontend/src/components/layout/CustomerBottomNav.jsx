import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const CustomerBottomNav = () => {
  const location = useLocation();
  const [showMore, setShowMore] = useState(false);

  const mainItems = [
    { label: 'Coach', icon: 'chat_bubble', path: '/chat' },
    { label: 'Plans', icon: 'fitness_center', path: '/plans' },
    { label: 'Meals', icon: 'restaurant', path: '/meals' },
    { label: 'Profile', icon: 'person', path: '/profile' },
  ];

  const moreItems = [
    { label: 'Stats', icon: 'monitoring', path: '/stats' },
    { label: 'Exercises', icon: 'exercise', path: '/exercises' },
  ];

  const isMoreActive = moreItems.some(i => location.pathname === i.path);

  return (
    <>
      {/* Backdrop khi mở More */}
      {showMore && (
        <div 
          className="fixed inset-0 z-[99] bg-black/60 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setShowMore(false)}
        />
      )}

      <div className="fixed bottom-8 left-0 right-0 z-[100] px-6 pointer-events-none md:hidden">
        
        {/* Popup More */}
        {showMore && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 pointer-events-auto animate-in slide-in-from-bottom-4 fade-in duration-300">
            <div className="bg-[#1a1919]/90 backdrop-blur-3xl border border-white/10 rounded-2xl p-2 shadow-2xl flex gap-2">
              {moreItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setShowMore(false)}
                    className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all active:scale-90 ${
                      isActive 
                        ? 'bg-[#b1ff24]/10 text-[#b1ff24] shadow-[0_0_20px_rgba(177,255,36,0.15)]' 
                        : 'text-[#adaaaa] active:bg-white/5'
                    }`}
                  >
                    <span className="material-symbols-outlined text-xl">{item.icon}</span>
                    <span className="text-[9px] font-black uppercase mt-1 tracking-wider">{item.label}</span>
                  </Link>
                );
              })}
            </div>
            {/* Mũi tên nhỏ chỉ xuống */}
            <div className="w-3 h-3 bg-[#1a1919]/90 border-r border-b border-white/10 rotate-45 mx-auto -mt-2 backdrop-blur-3xl"></div>
          </div>
        )}

        <nav className="max-w-md mx-auto pointer-events-auto">
          <div className="bg-[#1a1919]/70 backdrop-blur-3xl border border-white/10 rounded-full px-3 py-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex justify-between items-center relative overflow-hidden transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-t from-white/[0.02] to-transparent pointer-events-none" />
            
            {mainItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative flex flex-col items-center justify-center min-w-[60px] py-1.5 transition-all duration-500 ease-spring active:scale-90 group`}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-[#b1ff24]/10 rounded-full blur-md animate-pulse" />
                  )}
                  <span className={`material-symbols-outlined mb-0.5 relative z-10 transition-all duration-500 ${
                    isActive ? 'text-[#b1ff24] scale-110 fill-1' : 'text-[#adaaaa] group-hover:text-white'
                  }`} style={{ fontSize: '22px' }}>
                    {item.icon}
                  </span>
                  <span className={`text-[9px] font-black uppercase tracking-[0.15em] relative z-10 transition-all duration-500 ${
                    isActive ? 'text-[#b1ff24] opacity-100' : 'text-[#adaaaa] opacity-60 group-hover:opacity-100'
                  }`}>
                    {item.label}
                  </span>
                  {isActive && (
                    <div className="absolute -bottom-1 w-1 h-1 bg-[#b1ff24] rounded-full shadow-[0_0_8px_#b1ff24]" />
                  )}
                </Link>
              );
            })}

            {/* Nút More */}
            <button
              onClick={() => setShowMore(!showMore)}
              className={`relative flex flex-col items-center justify-center min-w-[60px] py-1.5 transition-all duration-500 active:scale-90 group`}
            >
              <span className={`material-symbols-outlined mb-0.5 relative z-10 transition-all duration-500 ${
                showMore || isMoreActive ? 'text-[#b1ff24] rotate-45 scale-110' : 'text-[#adaaaa] group-hover:text-white'
              }`} style={{ fontSize: '22px' }}>
                {showMore ? 'close' : 'apps'}
              </span>
              <span className={`text-[9px] font-black uppercase tracking-[0.15em] relative z-10 transition-all duration-500 ${
                isMoreActive ? 'text-[#b1ff24]' : 'text-[#adaaaa] opacity-60'
              }`}>
                More
              </span>
              {isMoreActive && !showMore && (
                <div className="absolute -bottom-1 w-1 h-1 bg-[#b1ff24] rounded-full shadow-[0_0_8px_#b1ff24]" />
              )}
            </button>
          </div>
        </nav>
      </div>
    </>
  );
};

export default CustomerBottomNav;