import React from 'react';
import { getDecodedToken } from '../../utils/authUtils';

const ChatWelcome = ({ onSelectPrompt }) => {
  const suggestions = [
    {
      title: "Leg Day Protocol",
      desc: "Focus on explosive power.",
      icon: "fitness_center",
      color: "primary",
      prompt: "Generate a high-intensity Leg Day protocol focused on explosive power and high volume."
    },
    {
      title: "Nutrition Review",
      desc: "Analyze yesterday's macros.",
      icon: "restaurant_menu",
      color: "secondary",
      prompt: "Can you review my nutrition and analyze my macros based on my activity yesterday?"
    },
    {
      title: "Sleep Quality",
      desc: "Check recovery scores.",
      icon: "bedtime",
      color: "tertiary-fixed",
      prompt: "How was my sleep quality? Please check my recovery pulse and readiness score."
    },
    {
      title: "Stretch Routine",
      desc: "10-min mobility flow.",
      icon: "bolt",
      color: "primary",
      prompt: "Show me a quick 10-minute dynamic mobility stretching routine."
    }
  ];

  // Get user info dynamically
  const token = localStorage.getItem('token');
  const user = getDecodedToken(token);
  const userName = user 
    ? user["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || user.unique_name || user.email 
    : 'User';

  const firstName = userName.split(' ')[0];

  return (
    <div className="flex-grow flex flex-col items-center justify-center px-4 md:px-8 max-w-4xl mx-auto w-full relative z-10 py-4 overflow-hidden">
      
      {/* Central Coach Icon - Floating Animation */}
      <div className="relative w-24 h-24 md:w-32 md:h-32 mb-8 flex items-center justify-center animate-float">
        {/* Pulsing Rings */}
        <div className="absolute inset-0 rounded-full border border-primary/20 scale-110 opacity-40 animate-ping" style={{ animationDuration: '3s' }}></div>
        <div className="absolute inset-0 rounded-full border border-secondary/20 scale-125 opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        {/* Core Orb with Gradient & Glow */}
        <div className="relative z-10 w-full h-full flex items-center justify-center rounded-full bg-surface-container/30 backdrop-blur-md border border-white/10 shadow-[0_0_50px_rgba(177,255,36,0.15)] group transition-transform hover:scale-110 duration-500">
          <span className="material-symbols-outlined text-5xl md:text-6xl 
            text-transparent bg-clip-text 
            bg-gradient-to-br from-primary via-secondary to-primary-container
            fill-1 drop-shadow-[0_0_15px_rgba(177,255,36,0.5)]">
            fitness_center
          </span>
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>
      </div>

      {/* Headline Reveal */}
      <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <h2 className="text-3xl md:text-5xl font-headline font-black tracking-tight text-center mb-3 leading-tight text-white drop-shadow-sm">
          Hello {firstName}, <span className="kinetic-gradient-text text-glow">time to train!</span>
        </h2>
      </div>
      
      <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <p className="text-on-surface-variant font-body text-center mb-10 max-w-lg text-sm md:text-base opacity-70">
          Your physique is ready. Let me know your goals for today so I can design the best schedule for you.
        </p>
      </div>

      {/* Prompt Suggestions Grid - Staggered Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
        {suggestions.map((item, idx) => (
          <button 
            key={idx}
            onClick={() => onSelectPrompt(item.prompt)}
            style={{ animationDelay: `${0.3 + idx * 0.1}s` }}
            className="group relative flex items-center gap-4 p-4 rounded-2xl bg-surface-container-low/40 backdrop-blur-sm hover:bg-surface-container border border-white/5 hover:border-primary/40 transition-all text-left overflow-hidden shadow-lg hover:shadow-primary/5 active:scale-95 animate-fade-in-up opacity-0"
          >
            {/* Hover light effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            
            <div className={`w-11 h-11 rounded-xl bg-surface-container-highest flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 relative z-10`}>
              <span className={`material-symbols-outlined text-2xl text-${item.color} drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]`}>
                {item.icon}
              </span>
              <div className={`absolute inset-0 bg-${item.color}/10 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity`}></div>
            </div>

            <div className="min-w-0 relative z-10">
              <h3 className="font-headline font-bold text-on-surface group-hover:text-primary transition-colors text-sm md:text-base truncate">
                {item.title}
              </h3>
              <p className="text-xs text-on-surface-variant font-body opacity-60 truncate">
                {item.desc}
              </p>
            </div>

            <div className="ml-auto opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all">
              <span className="material-symbols-outlined text-primary text-sm">arrow_forward_ios</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChatWelcome;
