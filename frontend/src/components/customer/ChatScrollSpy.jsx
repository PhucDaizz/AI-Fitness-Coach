import React from 'react';

const ChatScrollSpy = ({ messages, onScrollTo, onScrollTop }) => {
  // Only interested in user messages for navigation markers
  const userMessages = messages.filter(m => m.role === 'User');

  if (userMessages.length === 0) return null;

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-[100] hidden md:flex flex-col items-end gap-2 group/spy">
      {/* Scrollable Container for Markers */}
      <div className="max-h-[50vh] overflow-y-auto overflow-x-hidden no-scrollbar py-4 px-2 bg-[#0a0a0a]/60 backdrop-blur-md border border-white/5 shadow-2xl rounded-2xl flex flex-col items-center gap-3 w-[40px] hover:w-[280px] transition-all duration-300 ease-in-out group/container relative">
        {/* Subtle gradient to indicate more content above/below */}
        <div className="flex flex-col gap-3 relative w-full items-center">
          {/* Vertical Line - Only visible when collapsed or centered */}
          <div className="absolute top-0 bottom-0 left-[19px] w-[1px] bg-white/10 group-hover/container:opacity-0 transition-opacity"></div>
          
          {userMessages.map((msg, index) => {
            const uniqueId = msg.id || `msg-${msg.createdAt}-${messages.indexOf(msg)}`;
            return (
              <div key={uniqueId} className="relative flex items-center justify-end w-full h-4 pr-[11px] group/item">
                {/* Floating Tooltip - Now inside the expanded container to avoid clipping */}
                <div className="opacity-0 group-hover/item:opacity-100 transition-all duration-300 pointer-events-none absolute right-10 whitespace-nowrap">
                  <div className="bg-surface-container-highest border border-white/10 p-2 rounded-lg shadow-2xl flex items-center gap-3">
                    <span className="text-[9px] font-black text-primary px-1.5 py-0.5 rounded bg-primary/10">Q{index + 1}</span>
                    <span className="text-[11px] text-on-surface max-w-[180px] truncate italic opacity-80">
                      {msg.content}
                    </span>
                  </div>
                </div>

                {/* The Dot Marker */}
                <button
                  onClick={() => onScrollTo(uniqueId)}
                  className="w-4 h-4 flex items-center justify-center relative z-10 shrink-0"
                  title={`Jump to Q${index + 1}`}
                >
                  <div className="w-2 h-2 rounded-full bg-white/20 group-hover/item:bg-primary group-hover/item:scale-125 transition-all duration-300 shadow-[0_0_8px_rgba(255,255,255,0.05)]" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Bottom Controls */}
      <div className="flex flex-col items-center gap-2 mr-2">
         <div className="w-4 h-[1px] bg-white/10"></div>
         <button 
          onClick={onScrollTop}
          className="w-8 h-8 rounded-full bg-[#0a0a0a]/60 backdrop-blur-md border border-white/5 flex items-center justify-center text-on-surface-variant hover:text-primary transition-all shadow-lg active:scale-90"
          title="Scroll to Top"
        >
          <span className="material-symbols-outlined text-sm">north</span>
        </button>
      </div>
    </div>
  );
};

export default ChatScrollSpy;
