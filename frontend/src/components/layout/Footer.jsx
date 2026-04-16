import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full py-12 px-6 bg-[#000000] border-t border-outline-variant/10">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8 max-w-7xl mx-auto">
        <div className="flex flex-col gap-2">
          <span className="text-lg font-black text-[#b1ff24]">KINETIC AI</span>
          <p className="text-xs font-['Inter'] uppercase tracking-widest text-[#adaaaa]">© 2026 KINETIC AI. High-Performance Kineticism.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          <a className="text-xs font-['Inter'] uppercase tracking-widest text-[#adaaaa] hover:text-[#b1ff24] transition-colors" href="#">Privacy Policy</a>
          <a className="text-xs font-['Inter'] uppercase tracking-widest text-[#adaaaa] hover:text-[#b1ff24] transition-colors" href="#">Terms of Service</a>
          <a className="text-xs font-['Inter'] uppercase tracking-widest text-[#adaaaa] hover:text-[#b1ff24] transition-colors" href="#">Instagram</a>
          <a className="text-xs font-['Inter'] uppercase tracking-widest text-[#adaaaa] hover:text-[#b1ff24] transition-colors" href="#">Twitter</a>
          <a className="text-xs font-['Inter'] uppercase tracking-widest text-[#adaaaa] hover:text-[#b1ff24] transition-colors" href="#">LinkedIn</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
