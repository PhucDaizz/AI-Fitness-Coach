import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ProfileSidebar = ({ isAdmin, fullName, avatarUrl, isOpen, onClose, activeTab = 'profile' }) => {
  const navigate = useNavigate();

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[65] md:hidden"
          onClick={onClose}
        ></div>
      )}

      <aside className={`fixed left-0 top-0 h-screen w-64 bg-[#1a1919] border-r border-[#494847]/15 flex flex-col pt-16 py-8 gap-4 z-[70] transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="px-8 mb-8">
          <div className="flex justify-between items-center mb-12">
            <div className="text-xl font-black text-white italic tracking-tighter">KINETIC AI</div>
            <button onClick={onClose} className="md:hidden text-white">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          
          <div className="flex items-center gap-4 mb-8">
            <img 
              alt="Athlete avatar" 
              className="w-12 h-12 rounded-full object-cover border-2 border-primary" 
              src={avatarUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuBor6rBEH2iA19JbFmpGI65HQfgXxl9JAsz54V7CJyBlO3sIrf0wf3GiN5jwnlW4Vzw_6jx2I3c_JUQHrW9ASxXLM5pvfuCHZbqTxxViVdcvN21N6Zvwxaf7ab1Y41o061gCagVNPiwz_W-Mz3zHMPe8-_HYNLeLGtFuXdRGOuWacmQErV1NCmII6QHrv5m2wDLbHEbDnikXMERgDkuVpQBQjl7BkaBEHsXyyT0rejwIGyMfjOYPKrOT-Bntzl8TcUaAHrER3FuwQ94"}
            />
            <div>
              <div className="font-bold text-on-surface truncate w-32">{fullName || 'Athlete'}</div>
              <div className="text-xs text-on-surface-variant uppercase tracking-widest font-bold">
                {isAdmin ? 'System Admin' : 'Elite Level'}
              </div>
            </div>
          </div>
          
          {!isAdmin && (
            <button className="w-full py-3 rounded-full bg-surface-container-highest text-primary font-bold text-xs uppercase tracking-widest hover:bg-surface-variant transition-colors border border-outline-variant/15 flex justify-center items-center gap-2 mb-8">
              <span className="material-symbols-outlined text-[18px]">bolt</span>
              UPGRADE TO PRO
            </button>
          )}
        </div>
        
        <div className="flex-1 px-4 flex flex-col gap-2 font-['Inter'] uppercase tracking-widest text-[0.75rem] font-bold">
          <Link to={isAdmin ? "/admin" : "/"} className="flex items-center gap-4 px-4 py-3 rounded-lg text-[#adaaaa] hover:bg-[#1a1919] hover:text-white transition-all">
            <span className="material-symbols-outlined">dashboard</span>
            Dashboard
          </Link>
          <Link to="/profile" className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${activeTab === 'profile' ? 'text-[#b1ff24] border-l-4 border-[#b1ff24] bg-gradient-to-r from-[#b1ff24]/10 to-transparent' : 'text-[#adaaaa] hover:bg-[#1a1919] hover:text-white'}`}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'profile' ? "'FILL' 1" : "''" }}>person</span>
            Profile
          </Link>
          <Link to="/security" className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${activeTab === 'security' ? 'text-[#b1ff24] border-l-4 border-[#b1ff24] bg-gradient-to-r from-[#b1ff24]/10 to-transparent' : 'text-[#adaaaa] hover:bg-[#1a1919] hover:text-white'}`}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'security' ? "'FILL' 1" : "''" }}>shield</span>
            Security
          </Link>
        </div>
        
        <div className="px-4 mt-auto flex flex-col gap-2 font-['Inter'] uppercase tracking-widest text-[0.75rem] font-bold">
          <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="flex items-center gap-4 px-4 py-3 rounded-lg text-error hover:bg-surface-container-highest transition-all">
            <span className="material-symbols-outlined">logout</span>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default ProfileSidebar;
