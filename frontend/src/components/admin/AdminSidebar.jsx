import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const AdminSidebar = () => {
  const location = useLocation();

  const navItems = [
    { icon: 'dashboard', label: 'Dashboard', path: '/admin' },
    { icon: 'category', label: 'Exercise Category', path: '/admin/exercise-category' },
    { icon: 'fitness_center', label: 'Equipment', path: '#' },
    { icon: 'build', label: 'Maintenance', path: '#' },
    { icon: 'group', label: 'User Management', path: '#' },
    { icon: 'restaurant', label: 'Meal Management', path: '#' },
    { icon: 'accessibility_new', label: 'Muscle Group', path: '/admin/muscle-group' },
    { icon: 'assessment', label: 'Reports', path: '#' },
    { icon: 'settings', label: 'Settings', path: '#' },
  ];

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-[#000000] flex flex-col py-8 z-[60] hidden md:flex">
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
      
      <nav className="flex-1 space-y-1">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={index}
              to={item.path}
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

      <div className="px-6 mt-auto space-y-4">
        <button className="w-full py-3 rounded-full bg-error/10 border border-error/20 text-error font-bold text-xs uppercase tracking-widest hover:bg-error hover:text-white transition-colors">
          Emergency Shutdown
        </button>
        <div className="pt-6 space-y-2 border-t border-white/5">
          <Link to="#" className="flex items-center gap-3 text-[#adaaaa] text-[0.75rem] font-bold uppercase tracking-widest hover:text-white">
            <span className="material-symbols-outlined text-sm">help</span> Support
          </Link>
          <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }} className="w-full flex items-center gap-3 text-[#adaaaa] text-[0.75rem] font-bold uppercase tracking-widest hover:text-white">
            <span className="material-symbols-outlined text-sm">logout</span> Log Out
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
