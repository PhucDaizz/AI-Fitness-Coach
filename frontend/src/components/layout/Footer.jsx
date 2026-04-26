import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="w-full py-16 px-6 bg-[#030303] border-t border-white/5 relative overflow-hidden">
      {/* Abstract Background Glow */}
      <div className="absolute -bottom-24 left-1/4 w-96 h-96 bg-[#b1ff24]/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-12">
          {/* Brand Identity */}
          <div className="md:col-span-5 flex flex-col gap-4">
            <Link to="/" className="text-2xl font-black text-[#b1ff24] italic tracking-tighter hover:opacity-80 transition-opacity w-fit">
              KINETIC AI
            </Link>
            <p className="text-sm font-['Inter'] text-[#adaaaa] leading-relaxed max-w-sm">
              The world's most advanced autonomous kinetic intelligence. Biomechanical optimization through real-time RAG processing.
            </p>
            <div className="flex gap-4 mt-2">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noreferrer" 
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:border-[#b1ff24]/50 hover:bg-[#b1ff24]/5 transition-all group"
                aria-label="Instagram"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#adaaaa] group-hover:text-[#b1ff24] transition-colors"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noreferrer" 
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:border-[#b1ff24]/50 hover:bg-[#b1ff24]/5 transition-all group"
                aria-label="Twitter"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#adaaaa] group-hover:text-[#b1ff24] transition-colors"><path d="M22 4s-1 2-2 3c1.25 10.5-8 19-20 18-3-1-10 1-13-2 3 0 6-2 9-5-2-1-4-3-4-6.5 1 .5 2 1 3 .5-3-3-4-9-2-12 3 3 7 5 12 5.5-1-4 3-9 8-8 1.5 0 3 .5 4 1.5 1.5-1 3.5-2 4-2.5z"></path></svg>
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noreferrer" 
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:border-[#b1ff24]/50 hover:bg-[#b1ff24]/5 transition-all group"
                aria-label="LinkedIn"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#adaaaa] group-hover:text-[#b1ff24] transition-colors"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3">
             <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white mb-6">SYSTEM CORE</h4>
             <ul className="space-y-4">
               <li><Link to="/exercises" className="text-xs font-bold text-[#adaaaa] hover:text-[#b1ff24] transition-colors uppercase tracking-widest">Training Module</Link></li>
               <li><Link to="/meals" className="text-xs font-bold text-[#adaaaa] hover:text-[#b1ff24] transition-colors uppercase tracking-widest">Nutrition Engine</Link></li>
               <li><Link to="/login" className="text-xs font-bold text-[#adaaaa] hover:text-[#b1ff24] transition-colors uppercase tracking-widest">Authentication</Link></li>
             </ul>
          </div>

          {/* Legal Identity */}
          <div className="md:col-span-4">
             <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white mb-6">LEGAL PROTOCOLS</h4>
             <ul className="space-y-4">
               <li><Link to="/privacy" className="text-xs font-bold text-[#adaaaa] hover:text-[#b1ff24] transition-colors uppercase tracking-widest">Privacy Policy</Link></li>
               <li><Link to="/terms" className="text-xs font-bold text-[#adaaaa] hover:text-[#b1ff24] transition-colors uppercase tracking-widest">Terms of Service</Link></li>
               <li><a href="mailto:contact@kineticai.fit" className="text-xs font-bold text-[#adaaaa] hover:text-[#b1ff24] transition-colors uppercase tracking-widest">Technical Support</a></li>
             </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#adaaaa]/40">
            © 2026 KINETIC AI
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
