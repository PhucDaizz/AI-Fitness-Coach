import React from 'react';
import { Link } from 'react-router-dom';

import AuthBackground from '../../components/auth/AuthBackground';
import LoginForm from '../../components/auth/LoginForm';

const Login = () => {
  return (
    <div className="bg-background text-on-surface font-body selection:bg-primary selection:text-on-primary min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      <AuthBackground />

      {/* Back to Home Button */}
      <div className="absolute top-8 left-8 z-20">
        <Link
          to="/"
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-bold uppercase tracking-widest text-xs"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Home
        </Link>
      </div>

      <main className="w-full max-w-md px-6 py-12 relative z-10">
        {/* Brand Identity */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-black italic tracking-tighter text-primary">KINETIC AI</h1>
          <p className="text-on-surface-variant text-sm mt-2 font-black tracking-wide uppercase">
            Performance Intelligence Dashboard
          </p>
        </div>

        <LoginForm />

        {/* Footer Link */}
        <p className="text-center mt-10 text-on-surface-variant text-sm font-black">
          Don't have an account?
          <Link
            to="/signup"
            className="text-primary hover:underline underline-offset-4 ml-1 uppercase italic tracking-tighter"
          >
            Sign Up
          </Link>
        </p>

        {/* Legal links */}
        <div className="mt-20 flex justify-center gap-8 opacity-40">
          <a
            className="text-[0.625rem] font-bold uppercase tracking-widest hover:text-white transition-colors"
            href="#"
          >
            Privacy Policy
          </a>
          <a
            className="text-[0.625rem] font-bold uppercase tracking-widest hover:text-white transition-colors"
            href="#"
          >
            Terms of Service
          </a>
        </div>
      </main>
    </div>
  );
};

export default Login;
