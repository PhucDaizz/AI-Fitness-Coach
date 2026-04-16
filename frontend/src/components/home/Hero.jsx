import React from 'react';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          alt="Athletic training background" 
          className="w-full h-full object-cover opacity-40" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBz32d6_cSrq1Uk-R2KURiaDtg30XVjkOqG9Or28nhQL5XlP7j3VNpbHCLHmsmkQzCMIu84n7O5I2VL4uE8dLBUq7ns1zsn5Dgao78Bsao99vV0iX5cxgHQEBReUC4ELdGWzC6ae1kgn-A24Rn4NUaHgcO4KgV7muPdXzgmpiSDlz7lhGqkpZNHan494VlVW2an7OvooXHU8fN7_IdM_z1-H0OdwXY2VK0rENrQF0mnAYo7E8IMsCi6mVYlTdCxR3_v2LXoP8t7u7YK" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        <div className="inline-block px-4 py-1 mb-6 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-md">
          <span className="text-primary text-xs font-bold tracking-[0.2em] uppercase">The Future of Human Performance</span>
        </div>
        <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter leading-[0.9] mb-8 uppercase max-w-5xl mx-auto">
          TRANSFORM YOUR BODY WITH <span className="kinetic-gradient-text">ACTIVE INTELLIGENCE</span>
        </h1>
        <p className="text-on-surface-variant text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Have you ever joined a gym only to quit after two weeks? KINETIC AI isn't just a chat app—it's a fully automated system designed to fit your life.
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
          <button className="bg-primary text-on-primary px-10 py-5 rounded-full font-black tracking-tight text-lg shadow-[0_0_20px_rgba(177,255,36,0.3)] hover:scale-105 active:scale-95 transition-all">
            START YOUR JOURNEY
          </button>
          <button className="flex items-center gap-2 text-on-surface hover:text-primary transition-colors font-bold px-8 py-5">
            <span className="material-symbols-outlined">play_circle</span>
            WATCH HOW IT WORKS
          </button>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
        <span className="text-[10px] uppercase tracking-widest text-[#ffffff]">Scroll to Explore</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-primary to-transparent"></div>
      </div>
    </section>
  );
};

export default Hero;
