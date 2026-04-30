import React from 'react';
import { getDecodedToken } from '../../utils/authUtils';

const ChatSidebar = ({ sessions, currentSessionId, onSelectSession, onRenameSession, onLogout, isOpen, onClose }) => {
  const [editingSessionId, setEditingSessionId] = React.useState(null);
  const [editTitle, setEditTitle] = React.useState('');
  const inputRef = React.useRef(null);

  // Get user info if available (Using same logic as ProfilePage)
  const token = localStorage.getItem('token');
  const user = getDecodedToken(token);
  const userName = user 
    ? user["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || user.unique_name || user.email 
    : 'Kinetic User';

  // Grouping logic
  const groupSessions = (items) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    return items.reduce((groups, session) => {
      const date = new Date(session.createdAt);
      if (date >= today) {
        groups.today.push(session);
      } else if (date >= sevenDaysAgo) {
        groups.sevenDays.push(session);
      } else {
        groups.older.push(session);
      }
      return groups;
    }, { today: [], sevenDays: [], older: [] });
  };

  const categorizedSessions = groupSessions(sessions);

  const handleEditStart = (e, session) => {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditTitle(session.title || 'New Conversation');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleEditSave = () => {
    if (editingSessionId && editTitle.trim() !== '') {
      onRenameSession(editingSessionId, editTitle.trim());
    }
    setEditingSessionId(null);
  };

  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleEditSave();
    } else if (e.key === 'Escape') {
      setEditingSessionId(null);
    }
  };

  const renderSessionItem = (session) => (
    <button
      key={session.id}
      onClick={() => { 
        if (editingSessionId !== session.id) onSelectSession(session.id); 
      }}
      className={`w-full text-left px-3 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden flex items-center gap-2 ${
        currentSessionId === session.id
          ? 'bg-white/10 text-primary'
          : 'hover:bg-white/5 text-on-surface-variant hover:text-on-surface'
      }`}
    >
      <span className="material-symbols-outlined text-[18px] opacity-50">chat_bubble</span>
      
      <div className="flex-grow min-w-0 flex items-center justify-between gap-2">
        {editingSessionId === session.id ? (
          <input
            ref={inputRef}
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleEditSave}
            onKeyDown={handleEditKeyDown}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-surface-container-low text-[13px] font-medium text-on-surface border border-primary/50 rounded px-2 py-0.5 outline-none"
          />
        ) : (
          <span className="text-[13px] font-medium truncate flex-grow">
            {session.title || 'New Conversation'}
          </span>
        )}

        {/* Edit button - Always visible for better mobile UX */}
        {editingSessionId !== session.id && (
          <div 
            className={`shrink-0 transition-opacity ${currentSessionId === session.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
            onClick={(e) => handleEditStart(e, session)}
          >
            <span className="material-symbols-outlined text-[16px] hover:text-primary">edit</span>
          </div>
        )}
      </div>
    </button>
  );

  return (
    <>
      {/* Backdrop for mobile (hidden on PC) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] lg:hidden animate-in fade-in duration-300"
          onClick={onClose}
        />
      )}

      {/* The Sidebar */}
      <aside className={`fixed top-0 left-0 h-screen bg-[#0e0e0e] border-r border-white/5 z-[90] transition-all duration-500 ease-spring overflow-hidden ${
        isOpen ? 'translate-x-0 w-[260px]' : '-translate-x-full w-0'
      } lg:relative lg:translate-x-0 ${isOpen ? 'lg:min-w-[260px] lg:w-[260px] lg:opacity-100' : 'lg:min-w-0 lg:w-0 lg:opacity-0 lg:border-none'}`}>
        
        <div className="w-[260px] flex flex-col h-full pt-16">
          <div className="p-4">
            <button 
              onClick={() => { onSelectSession(null); }}
              className="w-full bg-surface-container-highest hover:bg-white/10 text-on-surface border border-white/5 rounded-xl p-3 flex items-center gap-3 transition-all active:scale-95 group"
            >
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary group-hover:text-on-primary transition-all">
                <span className="material-symbols-outlined text-sm">add</span>
              </div>
              <span className="text-[13px] font-bold uppercase tracking-wider">New Chat</span>
            </button>
          </div>

          <div className="flex-grow overflow-y-auto px-2 py-2 space-y-6 custom-scrollbar">
            {categorizedSessions.today.length > 0 && (
              <div className="space-y-1">
                <h3 className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/50 mb-2">Today</h3>
                {categorizedSessions.today.map(renderSessionItem)}
              </div>
            )}

            {categorizedSessions.sevenDays.length > 0 && (
              <div className="space-y-1">
                <h3 className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/50 mb-2">Previous 7 Days</h3>
                {categorizedSessions.sevenDays.map(renderSessionItem)}
              </div>
            )}

            {categorizedSessions.older.length > 0 && (
              <div className="space-y-1">
                <h3 className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/50 mb-2">Older</h3>
                {categorizedSessions.older.map(renderSessionItem)}
              </div>
            )}
            
            {sessions.length === 0 && (
              <div className="text-center py-12 opacity-20">
                <span className="material-symbols-outlined text-3xl mb-2">history</span>
                <p className="text-[10px] font-bold uppercase tracking-widest">Empty</p>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-white/5 bg-surface-container-lowest/50">
             <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 group relative overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-secondary to-primary p-[1px] shrink-0">
                   <div className="w-full h-full rounded-full bg-surface-container-low flex items-center justify-center">
                      <span className="material-symbols-outlined text-sm text-on-surface">person</span>
                   </div>
                </div>
                <div className="flex-grow min-w-0">
                   <p className="text-[11px] font-bold text-on-surface truncate">{userName}</p>
                   <p className="text-[8px] text-primary font-black uppercase tracking-widest opacity-60">Verified</p>
                </div>
                <button 
                  onClick={onLogout}
                  className="p-1.5 rounded-lg hover:bg-error/10 text-on-surface-variant hover:text-error transition-all active:scale-90"
                  title="Logout"
                >
                   <span className="material-symbols-outlined text-lg">logout</span>
                </button>
             </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default ChatSidebar;
