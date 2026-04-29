import React from 'react';

const ChatSidebar = ({ sessions, currentSessionId, onSelectSession, isOpen, onClose }) => {
  return (
    <>
      {/* Backdrop for mobile (hidden on PC) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] lg:hidden animate-in fade-in duration-300"
          onClick={onClose}
        />
      )}

      {/* The Sidebar - h-screen and fixed top-0 to take full height like GPT/Gemini */}
      <aside className={`fixed top-0 left-0 h-screen bg-[#0e0e0e] border-r border-white/5 z-[90] transition-all duration-500 ease-spring overflow-hidden ${
        isOpen ? 'translate-x-0 w-[280px]' : '-translate-x-full w-0'
      } lg:relative lg:translate-x-0 ${isOpen ? 'lg:min-w-[280px] lg:w-[280px] lg:opacity-100' : 'lg:min-w-0 lg:w-0 lg:opacity-0 lg:border-none'}`}>
        
        {/* Wrapper to prevent content shrinking during width animation */}
        <div className="w-[280px] flex flex-col h-full pt-20">
          <div className="p-6 border-b border-white/5">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-6 flex items-center justify-between">
              Conversations
              <button onClick={onClose} className="text-on-surface-variant hover:text-white transition-colors">
                 <span className="material-symbols-outlined">close</span>
              </button>
            </h2>
            
            <button 
              onClick={() => { onSelectSession(null); }}
              className="w-full bg-surface-container-highest hover:bg-white/5 text-on-surface border border-white/5 rounded-2xl p-4 flex items-center gap-3 transition-all active:scale-95 group"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary group-hover:text-on-primary transition-all">
                <span className="material-symbols-outlined text-sm">add</span>
              </div>
              <span className="text-xs font-bold uppercase tracking-widest">New Session</span>
            </button>
          </div>

          <div className="flex-grow overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => { onSelectSession(session.id); }}
                className={`w-full text-left p-4 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                  currentSessionId === session.id
                    ? 'bg-surface-container-highest border border-primary/20'
                    : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                {currentSessionId === session.id && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full shadow-[0_0_10px_rgba(177,255,36,0.5)]"></div>
                )}
                
                <h4 className={`text-xs font-bold truncate mb-1 ${currentSessionId === session.id ? 'text-primary' : 'text-on-surface'}`}>
                  {session.title || 'In-Progress Optimization'}
                </h4>
                <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-widest opacity-60">
                  {new Date(session.createdAt).toLocaleDateString()}
                </p>
              </button>
            ))}
            
            {sessions.length === 0 && (
              <div className="text-center py-12 opacity-30">
                <span className="material-symbols-outlined text-4xl mb-2">history</span>
                <p className="text-[10px] font-bold uppercase tracking-widest">No previous data</p>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-white/5 bg-surface-container-lowest/50">
             <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-secondary to-primary p-[1px]">
                   <div className="w-full h-full rounded-full bg-surface-container-low flex items-center justify-center">
                      <span className="material-symbols-outlined text-sm text-on-surface">person</span>
                   </div>
                </div>
                <div className="flex-grow min-w-0">
                   <p className="text-[10px] font-black uppercase text-on-surface truncate">Kinetic User</p>
                   <p className="text-[8px] text-primary font-bold uppercase tracking-[0.2em] animate-pulse">Synchronized</p>
                </div>
             </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default ChatSidebar;
