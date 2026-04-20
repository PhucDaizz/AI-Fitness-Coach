import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../services/api/auth.service';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    
    try {
      setLoading(true);
      // Construct the client URL for password reset (adjust as needed)
      const clientUrl = `${window.location.origin}/auth/resetpass`;
      
      await forgotPassword(email, clientUrl);
      setMessage({ 
        type: 'success', 
        text: 'Request sent! Please check your email for the reset link.' 
      });
      setEmail('');
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.message || 'Failed to send reset link. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-surface font-body min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center w-full px-6 py-8">
        <div className="text-2xl font-black italic tracking-tighter text-primary">KINETIC AI</div>
        <div className="hidden md:block">
          <span className="text-on-surface-variant text-xs font-label uppercase tracking-widest leading-none">High Performance Digital Cockpit</span>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-6 py-12 relative overflow-hidden">
        {/* Editorial Background Element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.03] select-none">
          <h1 className="text-[25vw] font-black italic tracking-tighter leading-none">RESET</h1>
        </div>

        <div className="w-full max-w-md z-10">
          {/* Back Action */}
          <Link to="/login" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-12 group">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span className="text-xs font-label uppercase tracking-widest">Back to login</span>
          </Link>

          {/* Content Header */}
          <div className="mb-10">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4 leading-tight italic">Forgot Password?</h2>
            <p className="text-on-surface-variant text-base leading-relaxed max-w-[320px]">
              Enter your email and we'll send you a link to reset your password.
            </p>
          </div>

          {/* Messages */}
          {message.text && (
            <div className={`mb-8 p-4 rounded-xl text-sm font-bold flex items-center gap-2 ${message.type === 'success' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-error/10 text-error border border-error/20'}`}>
              <span className="material-symbols-outlined">{message.type === 'success' ? 'check_circle' : 'error'}</span>
              {message.text}
            </div>
          )}

          {/* Form Container */}
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-label uppercase tracking-[0.2em] text-primary block ml-1" htmlFor="email">Email Address</label>
              <div className="relative group">
                <input 
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface-container border-none rounded-lg px-5 py-4 text-on-surface placeholder:text-on-surface-variant/30 focus:ring-1 focus:ring-primary transition-all duration-300 outline-none" 
                  placeholder="athlete@kinetic.ai" 
                  required
                />
                <div className="absolute inset-0 rounded-lg pointer-events-none border border-primary/0 group-focus-within:border-primary/20 transition-all"></div>
              </div>
            </div>

            <div className="pt-2">
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-on-primary font-black italic uppercase tracking-wider py-5 rounded-full hover:opacity-90 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(177,255,36,0.2)] disabled:opacity-50"
              >
                {loading ? (
                  <span className="w-6 h-6 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    Send Reset Link
                    <span className="material-symbols-outlined text-xl">bolt</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Support Footer */}
          <div className="mt-16 text-center">
            <p className="text-xs text-on-surface-variant/60 font-label tracking-wide uppercase">
              Having trouble? <a href="#" className="text-secondary hover:underline underline-offset-4">Contact Support</a>
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-12 right-12 hidden lg:block">
          <div className="flex flex-col items-end">
            <div className="w-12 h-[2px] bg-primary mb-2"></div>
            <span className="text-[10px] font-label text-on-surface-variant uppercase tracking-[0.3em]">Module_048 // Auth</span>
          </div>
        </div>
      </main>

      {/* System Status Visualizer */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-surface-container-highest/40 backdrop-blur-md px-4 py-2 rounded-full border border-outline-variant/10">
        <div className="w-2 h-2 rounded-full bg-secondary animate-pulse shadow-[0_0_8px_#6a9cff]"></div>
        <span className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">System Ready</span>
      </div>

      {/* Background Layers */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2"></div>
      </div>
    </div>
  );
};

export default ForgotPassword;
