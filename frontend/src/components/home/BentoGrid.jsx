import React from 'react';

const BentoGrid = () => {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <div className="mb-16">
        <h2 className="text-primary font-black italic text-4xl mb-2 tracking-tighter">ENGINEERED FOR SUCCESS</h2>
        <div className="w-20 h-1 bg-primary"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Card 1 */}
        <div className="md:col-span-7 group relative overflow-hidden rounded-lg bg-surface-container border border-outline-variant/10 hover:border-primary/50 transition-all duration-500">
          <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity">
            <img 
              alt="Workout setup" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBN0binfsXGcM4BkGBU_p0366LRLDEhg3fdea0gpHSL1fyqTkJIZq88MA9UVt5GOUilXNnjuqJWCg8JdkqwDosdMMi7bpIOwGqfxMkZPsMRL5ZidrFLEEzKO5v9pptIsnlte3DWvZTKCuzSK43CJRLCG5LIi-t4vEe5IJk-TaM833QBP1NjyZOk3WLD2atmHD5z75WzT2swvCYQcefL1Dc_rG8QQ7la394l1DKyClhyDrq0Imnj1TazIBtc-iuFcV8P2Dhzv03X22_5" 
            />
          </div>
          <div className="relative p-10 h-full flex flex-col justify-end min-h-[400px]">
            <span className="material-symbols-outlined text-primary mb-4 text-4xl">fitness_center</span>
            <h3 className="text-3xl font-black italic tracking-tighter mb-4 text-white uppercase">Bespoke Lifestyles in 30 Seconds</h3>
            <p className="text-on-surface-variant max-w-md">Instead of a lifeless PDF, our system analyzes everything—from your biometrics to old injuries—to design a plan optimized for maximum results, whether you're in a world-class gym or at home.</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="md:col-span-5 bg-surface-container-highest p-10 rounded-lg border border-outline-variant/10 flex flex-col justify-center">
          <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-secondary">psychology</span>
          </div>
          <h3 className="text-2xl font-black italic tracking-tighter mb-4 text-white uppercase leading-tight">An AI That Takes Action</h3>
          <p className="text-on-surface-variant mb-8">Experience 'Active Intelligence'. Message the AI to move workouts or adjust intensity. It automatically reorganizes your entire schedule based on your actual strength and feedback.</p>
          <div className="mt-auto glass-panel p-4 rounded-lg flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-secondary animate-pulse"></div>
            <span className="text-xs font-bold text-secondary tracking-widest uppercase">Coach Pulse: Active</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="md:col-span-5 bg-surface-container p-10 rounded-lg border border-outline-variant/10 flex flex-col hover:bg-surface-container-highest transition-colors">
          <span className="material-symbols-outlined text-primary mb-6 text-3xl">verified</span>
          <h3 className="text-2xl font-black italic tracking-tighter mb-4 text-white uppercase leading-tight">Vast, Expert-Verified Knowledge</h3>
          <p className="text-on-surface-variant">Access a library of exercises strictly vetted for professional accuracy. Train correctly and safely with expert-backed data, never 'guessing' again.</p>
        </div>

        {/* Card 4 */}
        <div className="md:col-span-7 group relative overflow-hidden rounded-lg bg-surface-container border border-outline-variant/10 hover:border-primary/50 transition-all duration-500">
          <div className="absolute inset-0 opacity-10 group-hover:opacity-30 transition-opacity">
            <img 
              alt="Healthy food" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKXKpHVZS-QtTGm_7Qtte_1Q2PYZ60NHWQJJ3o_YjIcsgyL3i6SEfRorV_Zvi3iJBaG4YilcZGJwTYqK0j-ossz8WF1kRotcpXSGIJQquVJd0Z9xwjUUIL4F40m-2KxMuRFcyxLPMGjNFEfJtVcpo9oRvQvBmBBO0MQa5VD3_Pcd6KJh8VjMB60Z3USc0ZhueZNwsS0Aw-Iq01YfpISTLCCnl2fqDy1BOfHcw_xIS48mGC64sHozA4_7oIv-3UZBAAkgW6SkGcYEvX" 
            />
          </div>
          <div className="relative p-10 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <span className="material-symbols-outlined text-secondary mb-4 text-4xl">restaurant_menu</span>
              <h3 className="text-3xl font-black italic tracking-tighter mb-4 text-white uppercase leading-tight">Seamless Nutrition Mastery</h3>
              <p className="text-on-surface-variant max-w-sm">The system automatically determines your daily calorie and protein needs. From pho to salads, get perfect meal suggestions to build muscle or lose fat fast.</p>
            </div>
            <div className="w-full md:w-48 aspect-square rounded-full border-4 border-dashed border-primary/20 flex items-center justify-center relative">
              <div className="absolute inset-2 rounded-full border-2 border-primary flex flex-col items-center justify-center">
                <span className="text-primary font-black text-2xl">2400</span>
                <span className="text-[8px] uppercase tracking-widest">Kcal Goal</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BentoGrid;
