import React from 'react';
import { Link } from 'react-router-dom';

import AuthBackground from '../../components/auth/AuthBackground';
import SignUpForm from '../../components/auth/SignUpForm';

const SignUp = () => {
  return (
    <div className="bg-background text-on-surface font-body selection:bg-primary selection:text-on-primary min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      <AuthBackground />

      {/* Main Navigation Shell */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-8 bg-transparent">
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-bold uppercase tracking-widest text-[10px]"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back
          </Link>
          <div className="h-4 w-[1px] bg-outline-variant/30 hidden md:block"></div>
          <Link to="/" className="text-2xl font-black italic tracking-tighter text-primary">
            KINETIC AI
          </Link>
        </div>

        <div className="hidden md:flex gap-8 items-center">
          <span className="text-on-surface-variant font-black text-[10px] uppercase tracking-[0.3em]">
            Digital Cockpit
          </span>
          <button className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors duration-200">
            <span className="material-symbols-outlined text-xl">help_outline</span>
          </button>
        </div>
      </header>

      <main className="relative z-10 w-full max-w-xl px-4 py-20 flex flex-col items-center">
        {/* Hero Branding */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight mb-4 uppercase">
            JOIN THE <span className="text-primary italic text-glow">ELITE</span>
          </h1>
          <p className="text-on-surface-variant text-[10px] font-black tracking-[0.4em] uppercase">
            Start your high-performance journey
          </p>
        </div>

        <SignUpForm />

        {/* Bottom Link */}
        <div className="mt-8 text-center relative z-10">
          <p className="text-sm text-on-surface-variant font-medium">
            Already have an account?
            <Link
              to="/login"
              className="text-primary font-black ml-1 hover:underline underline-offset-4 decoration-primary/30 transition-all uppercase italic tracking-tighter"
            >
              Log In
            </Link>
          </p>
        </div>

        {/* Footnote Metadata */}
        <div className="mt-8 flex flex-col md:flex-row items-center gap-4 text-center opacity-40 relative z-10">
          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
            Kinetic Protocol v2.4.0
          </p>
          <div className="hidden md:block w-1 h-1 rounded-full bg-outline-variant"></div>
          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
            Encrypted Body Data Stream
          </p>
        </div>
      </main>

      {/* Side Graphic Detail */}
      <div className="hidden xl:block fixed bottom-12 right-12 text-right pointer-events-none select-none z-0">
        <span className="block text-9xl font-black text-white/5 italic -mb-6">01</span>
        <span className="block text-[10px] font-black uppercase tracking-[0.4em] text-on-surface-variant/30">
          Initiate Performance Stream
        </span>
      </div>
    </div>
  );
};

export default SignUp;
