import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full z-50 bg-[#0e0e0e]/80 backdrop-blur-xl shadow-2xl shadow-black/50">
      <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
        <Link to="/" className="text-2xl font-black italic tracking-tighter text-[#b1ff24]">KINETIC AI</Link>
        <div className="hidden md:flex gap-8 items-center">
          <a className="text-[#b1ff24] border-b-2 border-[#b1ff24] pb-1 font-bold tracking-tight" href="#">Features</a>
          <a className="text-[#adaaaa] hover:text-white transition-colors font-bold tracking-tight" href="#">Methodology</a>
        </div>
        <div className="flex gap-4 items-center">
          <Link to="/login" className="text-[#adaaaa] hover:text-white transition-colors font-bold tracking-tight">Login</Link>
          <button className="bg-[#b1ff24] text-[#3e5e00] px-6 py-2 rounded-full font-bold scale-95 active:scale-90 transition-transform hover:opacity-80">
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
