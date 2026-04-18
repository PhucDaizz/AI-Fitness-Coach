import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const AdminSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { icon: 'dashboard', label: 'Dashboard', path: '/admin' },
    { icon: 'category', label: 'Exercise Category', path: '/admin/exercise-category' },
    { icon: 'inventory_2', label: 'Equipment', path: '/admin/equipment' },
    { icon: 'build', label: 'Maintenance', path: '#' },
    { icon: 'group', label: 'User Management', path: '#' },
    { icon: 'restaurant', label: 'Meal Management', path: '#' },
    { icon: 'accessibility_new', label: 'Muscle Group', path: '/admin/muscle-group' },
    { icon: 'fitness_center', label: 'Exercises', path: '/admin/exercises' },
    { icon: 'assessment', label: 'Reports', path: '#' },
    { icon: 'settings', label: 'Settings', path: '#' },
  ];

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={toggleSidebar}
        className="md:hidden fixed bottom-6 right-6 z-[100] w-14 h-14 bg-primary text-on-primary rounded-full shadow-[0_0_20px_rgba(177,255,36,0.5)] flex items-center justify-center active:scale-90 transition-all"
      >
        <span className="material-symbols-outlined text-3xl">
          {isOpen ? 'close' : 'menu'}
        </span>
      </button>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[80]"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`h-screen w-64 fixed left-0 top-0 bg-[#000000] flex flex-col py-8 z-[90] transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="px-6 mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
            </div>
            <div>
              <h1 className="text-xl font-black text-[#b1ff24]">Kinetic Admin</h1>
              <p className="font-['Inter'] uppercase tracking-widest text-[0.6rem] font-bold text-on-surface-variant">Elite Performance Hub</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={index}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 py-4 px-6 duration-300 hover:translate-x-1 ${
                  isActive 
                  ? 'text-[#b1ff24] border-l-4 border-[#b1ff24] bg-gradient-to-r from-[#b1ff24]/10 to-transparent' 
                  : 'text-[#adaaaa] hover:bg-[#1a1919] hover:text-white transition-all'
                }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span className="font-['Inter'] uppercase tracking-widest text-[0.75rem] font-bold">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-6 mt-auto space-y-4 pt-6 border-t border-white/5">
          <button className="w-full py-3 rounded-full bg-error/10 border border-error/20 text-error font-bold text-xs uppercase tracking-widest hover:bg-error hover:text-white transition-colors">
            Emergency Shutdown
          </button>
          <div className="space-y-2">
            <Link to="#" className="flex items-center gap-3 text-[#adaaaa] text-[0.75rem] font-bold uppercase tracking-widest hover:text-white">
              <span className="material-symbols-outlined text-sm">help</span> Support
            </Link>
            <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }} className="w-full flex items-center gap-3 text-[#adaaaa] text-[0.75rem] font-bold uppercase tracking-widest hover:text-white">
              <span className="material-symbols-outlined text-sm">logout</span> Log Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
