import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#b1ff24] selection:text-black">
      <Navbar />
      
      <main className="max-w-4xl mx-auto pt-32 pb-24 px-6">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#b1ff24]/10 flex items-center justify-center border border-[#b1ff24]/20 shadow-[0_0_15px_rgba(177,255,36,0.1)]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#b1ff24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic">TERMS OF SERVICE</h1>
        </div>

        <div className="space-y-12 text-[#adaaaa] font-['Inter'] leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-widest flex items-center gap-3">
              <span className="w-1 h-6 bg-[#b1ff24] rounded-full"></span>
              AGREEMENT TO KINETICS
            </h2>
            <p className="mb-4">
              By accessing KINETIC AI, you enter a binding agreement to push your physical limits. You represent that you are at least 18 years of age and medically cleared for high-intensity physical exertion.
            </p>
            <p>
              Users must follow algorithmic safety prompts. KINETIC AI uses predictive modeling to prevent injury, but the ultimately liability for physical safety remains with the user.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-widest flex items-center gap-3">
              <span className="w-1 h-6 bg-[#b1ff24] rounded-full"></span>
              KINETIC ENGINE USAGE
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="bg-[#111] p-6 rounded-2xl border border-white/5">
                  <span className="text-[#b1ff24] font-black italic block mb-2">01. COMPLIANCE</span>
                  <p className="text-xs">Users shall not attempt to reverse-engineer the kinetic modeling engine or scrape training datasets.</p>
               </div>
               <div className="bg-[#111] p-6 rounded-2xl border border-white/5">
                  <span className="text-[#b1ff24] font-black italic block mb-2">02. PERFORMANCE</span>
                  <p className="text-xs">The AI provides optimization metrics; actual performance results depend on individual physiological adherence.</p>
               </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-widest flex items-center gap-3">
              <span className="w-1 h-6 bg-[#b1ff24] rounded-full"></span>
              SUBSCRIPTION & CREDITS
            </h2>
            <p>
              Subscribers gain access to unlimited RAG queries and custom kinetic profiles. Cancellation takes effect at the end of the current billing cycle. No partial refunds are issued for unused training tokens.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-widest flex items-center gap-3">
              <span className="w-1 h-6 bg-[#b1ff24] rounded-full"></span>
              GOVERNING KINETICS
            </h2>
            <p>
              These terms are governed by the laws of the Jurisdiction of High-Performance Systems. Any disputes shall be settled through binding biomechanical arbitration.
            </p>
          </section>

          <div className="pt-12 border-t border-white/5 italic text-[10px] uppercase tracking-[0.2em] font-bold text-right">
            AUTHORED BY: KINETIC LEGAL CORE // REV 8.2
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfService;
