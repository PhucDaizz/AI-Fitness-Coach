import React, { useState, useRef } from 'react';

const ChatInput = ({ onSend, isLoading, isWelcome }) => {
  const [message, setMessage] = useState('');
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!message.trim() || isLoading) return;
    
    onSend(message);
    setMessage('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={`absolute transition-all duration-1000 ease-spring z-30 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 w-auto md:w-full md:max-w-2xl ${
      isWelcome 
        ? 'bottom-6 md:bottom-[20vh]' 
        : 'bottom-6'
    }`}>
      <form 
        onSubmit={handleSubmit}
        className={`bg-surface-container-highest/80 rounded-full p-1.5 flex items-center gap-2 border shadow-[0_10px_40px_rgba(0,0,0,0.6)] backdrop-blur-2xl transition-all duration-500 ${
          isWelcome ? 'md:border-primary/20 md:p-2.5 md:scale-105' : 'border-white/10 p-1.5 scale-100'
        } focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20`}
      >
        <button 
          type="button"
          className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors active:scale-90"
        >
          <span className="material-symbols-outlined">add</span>
        </button>
        
        <input 
          ref={inputRef}
          className="flex-grow bg-transparent border-none text-on-surface focus:ring-0 focus:outline-none font-body text-sm placeholder:text-on-surface-variant py-2 px-2"
          placeholder={isWelcome ? "Ask me anything to begin..." : "Type a message..."}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        
        <button 
          type="submit"
          disabled={!message.trim() || isLoading}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-[0_0_15px_rgba(177,255,36,0.3)] active:scale-90 ${
            !message.trim() || isLoading 
              ? 'bg-surface-container-highest text-on-surface-variant' 
              : 'bg-primary text-on-primary hover:opacity-90'
          }`}
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <span className="material-symbols-outlined font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>arrow_upward</span>
          )}
        </button>
      </form>
    </div>
  );
};

export default ChatInput;
