import React from 'react';

const CTASection = () => {
  return (
    <section className="relative py-32 px-6 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter mb-8 uppercase leading-[1.1]">
          NO MORE EXPENSIVE TRAINER FEES. <br />{' '}
          <span className="text-primary">NO MORE EXCUSES.</span>
        </h2>
        <p className="text-on-surface-variant text-xl mb-12 max-w-2xl mx-auto">
          Follow your personalized path and enjoy the results. Your high-performance journey starts
          with a single tap.
        </p>
        <div className="flex flex-col items-center gap-6">
          <button className="group relative px-12 py-6 bg-primary text-on-primary rounded-full font-black text-xl tracking-tight shadow-[0_0_30px_rgba(177,255,36,0.4)] hover:shadow-[0_0_50px_rgba(177,255,36,0.6)] transition-all overflow-hidden">
            <span className="relative z-10">GET KINETIC AI NOW</span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
          </button>
          <p className="text-xs uppercase tracking-[0.3em] text-[#adaaaa]">
            Available on iOS and Android
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
