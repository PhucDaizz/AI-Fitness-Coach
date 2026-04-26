import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#b1ff24] selection:text-black">
      <Navbar />
      
      <main className="max-w-4xl mx-auto pt-32 pb-24 px-6">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#b1ff24]/10 flex items-center justify-center border border-[#b1ff24]/20 shadow-[0_0_15px_rgba(177,255,36,0.1)]">
            {/* SVG fallback if lucide is missing, but assuming I'll fix it or use SVGs */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#b1ff24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic">PRIVACY POLICY</h1>
        </div>

        <div className="space-y-12 text-[#adaaaa] font-['Inter'] leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-widest flex items-center gap-3">
              <span className="w-1 h-6 bg-[#b1ff24] rounded-full"></span>
              DATA KINETICISM
            </h2>
            <p className="mb-4">
              At KINETIC AI, we operate with maximum transparency. Your biometric data is encrypted via military-grade protocols and processed locally whenever possible to ensure extreme privacy.
            </p>
            <p>
              We collect data to optimize your performance. This includes heart rate variability, sleep patterns, and movement kinetics. We do not sell your personal data to Third-Party aggregators.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-widest flex items-center gap-3">
              <span className="w-1 h-6 bg-[#b1ff24] rounded-full"></span>
              SECURITY PROTOCOLS
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#111] p-6 rounded-3xl border border-white/5 hover:border-[#b1ff24]/30 transition-all duration-500">
                <h3 className="text-white font-bold mb-2">END-TO-END ENCRYPTION</h3>
                <p className="text-xs">All data transmitted between your device and KINETIC servers is shielded by AES-256 standards.</p>
              </div>
              <div className="bg-[#111] p-6 rounded-3xl border border-white/5 hover:border-[#b1ff24]/30 transition-all duration-500">
                <h3 className="text-white font-bold mb-2">ANONYMIZED ANALYTICS</h3>
                <p className="text-xs">Aggregated training data is stripped of PII (Personally Identifiable Information) before model refinement.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-widest flex items-center gap-3">
              <span className="w-1 h-6 bg-[#b1ff24] rounded-full"></span>
              USER RIGHTS
            </h2>
            <p className="mb-4">
              You retain 100% ownership of your kinetic data. You may request a full export of your data or complete deletion at any time through the Security Dashboard.
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Right to access personal training history</li>
              <li>Right to rectify biomechanical anomalies</li>
              <li>Right to object to algorithmic profiling</li>
              <li>Right to data portability</li>
            </ul>
          </section>

          <div className="pt-12 border-t border-white/5 italic text-[10px] uppercase tracking-[0.2em] font-bold">
            LAST SYNCED: OCTOBER 2026 // KINETIC PRIVACY CORE v4.0
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
