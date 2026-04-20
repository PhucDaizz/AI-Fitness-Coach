import React from 'react';

const BioCard = ({ user, userId, isAdmin }) => {
  return (
    <div className="bg-surface-container p-8 rounded-xl border border-outline-variant/15 flex flex-col items-center text-center relative overflow-hidden group">
      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-surface-container-highest relative mb-6">
        <img 
          alt="Athlete avatar large" 
          className="w-full h-full object-cover" 
          src={user?.avatarUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuBor6rBEH2iA19JbFmpGI65HQfgXxl9JAsz54V7CJyBlO3sIrf0wf3GiN5jwnlW4Vzw_6jx2I3c_JUQHrW9ASxXLM5pvfuCHZbqTxxViVdcvN21N6Zvwxaf7ab1Y41o061gCagVNPiwz_W-Mz3zHMPe8-_HYNLeLGtFuXdRGOuWacmQErV1NCmII6QHrv5m2wDLbHEbDnikXMERgDkuVpQBQjl7BkaBEHsXyyT0rejwIGyMfjOYPKrOT-Bntzl8TcUaAHrER3FuwQ94"}
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
          <span className="material-symbols-outlined text-white">photo_camera</span>
        </div>
      </div>
      <h2 className="text-2xl font-bold mb-1">{user?.fullName || 'Anonymous'}</h2>
      <p className="text-primary font-bold uppercase tracking-widest text-xs mb-6">ID: {userId?.substring(0, 8).toUpperCase()}</p>
      
      <div className="w-full h-[1px] bg-outline-variant/20 mb-6"></div>
      
      <div className="w-full flex justify-between text-sm mb-2">
        <span className="text-on-surface-variant">Member Since</span>
        <span className="font-bold">2024</span>
      </div>
      
      {!isAdmin && (
        <div className="w-full flex justify-between text-sm">
          <span className="text-on-surface-variant">Training Phase</span>
          <span className="font-bold text-secondary">Hypertrophy</span>
        </div>
      )}
    </div>
  );
};

export default BioCard;
