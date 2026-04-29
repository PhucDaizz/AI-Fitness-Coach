import React from 'react';

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

  return (
    <div className="flex-grow flex flex-col items-center justify-center px-4 md:px-8 max-w-4xl mx-auto w-full relative z-10 py-4">
      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[400px] max-h-[400px] bg-secondary/10 blur-[80px] rounded-full pointer-events-none -z-10"></div>
      
      {/* Central Coach Icon - Reduced size */}
      <div className="relative w-24 h-24 md:w-28 md:h-28 mb-6 flex items-center justify-center">
        {/* Pulsing Rings */}
        <div className="absolute inset-0 rounded-full border border-secondary/20 scale-110 opacity-50 animate-pulse"></div>
        <div className="absolute inset-0 rounded-full border border-secondary/40 scale-125 opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        {/* Core Orb */}
        <div className="w-full h-full rounded-full bg-gradient-to-br from-secondary-container to-surface-container-lowest shadow-[0_0_30px_rgba(106,156,255,0.2)] flex items-center justify-center relative z-10 backdrop-blur-xl border border-secondary/30">
          <span className="material-symbols-outlined text-4xl md:text-5xl text-secondary drop-shadow-[0_0_10px_rgba(106,156,255,0.8)] fill-1">
            smart_toy
          </span>
        </div>
      </div>

      {/* Headline - More compact */}
      <h2 className="text-2xl md:text-4xl font-headline font-bold tracking-tight text-center mb-2 leading-tight text-white">
        Ready for your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container">next session?</span>
      </h2>
      
      <p className="text-on-surface-variant font-body text-center mb-8 max-w-md text-sm opacity-80">
        I've analyzed your recovery metrics. Select a protocol to begin.
      </p>

      {/* Prompt Suggestions Grid - Compact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-xl">
        {suggestions.map((item, idx) => (
          <button 
            key={idx}
            onClick={() => onSelectPrompt(item.prompt)}
            className="group flex items-center gap-3 p-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container border border-white/5 hover:border-primary/50 transition-all text-left relative overflow-hidden shadow-[0_5px_15px_rgba(0,0,0,0.2)] active:scale-95"
          >
            <div className={`w-9 h-9 rounded-full bg-surface-container-highest flex items-center justify-center flex-shrink-0 group-hover:bg-${item.color}/20 transition-colors`}>
              <span className={`material-symbols-outlined text-lg text-${item.color}`}>
                {item.icon}
              </span>
            </div>
            <div className="min-w-0">
              <h3 className="font-headline font-bold text-on-surface group-hover:text-primary transition-colors text-[13px] truncate">
                {item.title}
              </h3>
              <p className="text-[11px] text-on-surface-variant font-body opacity-60 truncate">
                {item.desc}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChatWelcome;
