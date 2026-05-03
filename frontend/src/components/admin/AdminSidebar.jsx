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
    { icon: 'restaurant', label: 'Meal Management', path: '/admin/meals' },
    { icon: 'accessibility_new', label: 'Muscle Group', path: '/admin/muscle-group' },
    { icon: 'fitness_center', label: 'Exercises', path: '/admin/exercises' },
    { icon: 'assessment', label: 'Reports', path: '#' },
    { icon: 'settings', label: 'Settings', path: '#' },
  ];

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#0e0e0e]/90 backdrop-blur-xl flex justify-around items-center py-4 z-[100] border-t border-white/5">
        <Link to="/admin" className={`flex flex-col items-center ${location.pathname === '/admin' ? 'text-primary' : 'text-on-surface-variant'}`}>
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-[8px] font-bold uppercase tracking-tighter mt-1">Dash</span>
        </Link>
        <Link to="/admin/exercises" className={`flex flex-col items-center ${location.pathname === '/admin/exercises' ? 'text-primary' : 'text-on-surface-variant'}`}>
          <span className="material-symbols-outlined">monitoring</span>
          <span className="text-[8px] font-bold uppercase tracking-tighter mt-1">Metrics</span>
        </Link>
        
        {/* Central Toggle Button */}
        <div 
          onClick={toggleSidebar}
          className="bg-primary text-on-primary w-12 h-12 rounded-full flex items-center justify-center -translate-y-6 shadow-lg shadow-primary/30 cursor-pointer active:scale-90 transition-all"
        >
          <span className="material-symbols-outlined">{isOpen ? 'close' : 'add'}</span>
        </div>

        <Link to="#" className="flex flex-col items-center text-on-surface-variant opacity-50">
          <span className="material-symbols-outlined">group</span>
          <span className="text-[8px] font-bold uppercase tracking-tighter mt-1">Users</span>
        </Link>
        <Link to="#" className="flex flex-col items-center text-on-surface-variant opacity-50">
          <span className="material-symbols-outlined">settings</span>
          <span className="text-[8px] font-bold uppercase tracking-tighter mt-1">Admin</span>
        </Link>
      </nav>

      {/* Mobile Command Center (Modern Drawer) */}
      <div 
        className={`md:hidden fixed inset-0 z-[120] transition-all duration-500 ${
          isOpen ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
      >
        {/* Backdrop with extreme blur */}
        <div className="absolute inset-0 bg-[#000000]/80 backdrop-blur-2xl" onClick={() => setIsOpen(false)} />
        
        {/* Mobile Menu Content */}
        <div className={`absolute inset-x-0 bottom-0 top-20 bg-surface-container rounded-t-[3rem] border-t border-white/10 p-8 transform transition-transform duration-500 ease-out flex flex-col ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}>
          {/* Header in Drawer */}
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Command <span className="text-primary">Center</span></h2>
              <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mt-1">Select Operations Module</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Intelligent Grid of Links */}
          <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
            <div className="grid grid-cols-2 gap-4">
              {navItems.map((item, index) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link 
                    key={index}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex flex-col items-start p-5 rounded-3xl border transition-all active:scale-95 ${
                      isActive 
                      ? 'bg-primary/10 border-primary/30 text-primary shadow-[0_0_20px_rgba(177,255,36,0.1)]' 
                      : 'bg-white/5 border-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    <span className="material-symbols-outlined mb-3 text-2xl">{item.icon}</span>
                    <span className="text-[9px] font-black uppercase tracking-widest leading-tight">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Additional Actions */}
            <div className="mt-8 space-y-4 pt-8 border-t border-white/5">
              <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }} className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-white/5 text-[#adaaaa] text-[10px] font-black uppercase tracking-widest">
                    <span className="material-symbols-outlined text-sm">logout</span> Log Out
                 </button>
                 <Link to="#" className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-white/5 text-[#adaaaa] text-[10px] font-black uppercase tracking-widest">
                    <span className="material-symbols-outlined text-sm">help</span> Support
                 </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar Container (Hidden on mobile) */}
      <aside className={`hidden md:flex h-screen w-64 fixed left-0 top-0 bg-[#000000] flex-col py-8 z-[90] border-r border-white/5`}>
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
