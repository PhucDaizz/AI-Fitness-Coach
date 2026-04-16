import React from 'react';

const AuthBackground = () => {
  return (
    <>
      {/* Dynamic atmospheric glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      {/* Texture Layer */}
      <div className="fixed inset-0 z-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      </div>
      
      {/* Decorative Text */}
      <div className="fixed bottom-10 left-10 z-0 hidden lg:block opacity-20 select-none">
        <div className="text-[10rem] font-black italic tracking-tighter text-outline-variant leading-none">FOCUS</div>
      </div>
      
      {/* High-performance Atmosphere Image */}
      <div className="fixed inset-0 z-[-1] overflow-hidden">
        <img 
          className="w-full h-full object-cover opacity-10 scale-110 blur-sm" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDHSHNO5I7fRoYY0osUXlJA9-MZ5fdKy1Uewff-Ptz0mqOuSblGGs-y0Xu_dS_sSRaRlNs-r3aeoGj2rNNje0GC2nIytVbbOsENdEr46eG8ETiEmAV5D-RXRKmZygfYluA5surHfEnSeyQdLvkwh3DeIWMCh6q97Tra3TOjNtS860cumYi5FOs6YvC7txujF3tYxr6uk6GFDHzSNYQQBEgWaXQMSq6K61Kw_q_zOy8uCN23oLy4f-Pd-6R4ipfJPHy7WLX2HsyadPJx" 
          alt="Atmospheric Background"
        />
      </div>
    </>
  );
};

export default AuthBackground;
