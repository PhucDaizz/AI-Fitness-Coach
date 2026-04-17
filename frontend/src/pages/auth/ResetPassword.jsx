import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { resetPassword } from '../../services/api/auth.service';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const email = searchParams.get('email');
  const token = searchParams.get('token');

  // Requirement checks
  const checks = {
    length: formData.password.length >= 8,
    special: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
    number: /\d/.test(formData.password)
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !token) {
      setError("Invalid or missing reset token.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!Object.values(checks).every(Boolean)) {
      setError("Please meet all password requirements.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await resetPassword({
        ...formData,
        email,
        token
      });
      // Success - redirect to login
      navigate('/login', { state: { message: 'Password reset successful. Please login with your new password.' } });
    } catch (err) {
      setError(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-surface font-body selection:bg-primary selection:text-on-primary min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-5%] left-[-5%] w-[400px] h-[400px] rounded-full bg-secondary/5 blur-[100px] pointer-events-none"></div>

      <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center w-full px-6 py-8">
        <div className="text-2xl font-black italic tracking-tighter text-primary">KINETIC AI</div>
        <button className="text-zinc-500 hover:opacity-80 transition-opacity active:scale-95 duration-200">
          <span className="material-symbols-outlined">help_outline</span>
        </button>
      </header>

      <main className="w-full max-w-md px-6 relative z-10">
        <div className="mb-12 space-y-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-1 w-8 bg-primary rounded-full"></div>
            <span className="text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-primary">Security Protocol</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic text-on-surface leading-tight">
            Reset <br/> Password
          </h1>
          <p className="text-on-surface-variant text-lg font-medium leading-relaxed">
            Set your new secure password for <span className="text-white">{email}</span>.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm font-bold flex items-center gap-2">
            <span className="material-symbols-outlined">error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-6">
            {/* New Password Field */}
            <div className="group">
              <label className="block text-[0.6875rem] font-bold uppercase tracking-widest text-zinc-500 mb-2 ml-1">New Password</label>
              <div className="relative bg-[#1a1919]/60 backdrop-blur-[20px] rounded-2xl border border-outline-variant/10 focus-within:border-primary/30 transition-all duration-300">
                <div className="absolute inset-y-0 left-4 flex items-center text-zinc-600">
                  <span className="material-symbols-outlined text-[20px]">lock</span>
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-zinc-700 py-4 pl-12 pr-12 rounded-2xl text-lg font-medium outline-none" 
                  placeholder="••••••••" 
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-4 flex items-center text-zinc-600 hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="group">
              <label className="block text-[0.6875rem] font-bold uppercase tracking-widest text-zinc-500 mb-2 ml-1">Confirm New Password</label>
              <div className="relative bg-[#1a1919]/60 backdrop-blur-[20px] rounded-2xl border border-outline-variant/10 focus-within:border-primary/30 transition-all duration-300">
                <div className="absolute inset-y-0 left-4 flex items-center text-zinc-600">
                  <span className="material-symbols-outlined text-[20px]">verified_user</span>
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  className="w-full bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-zinc-700 py-4 pl-12 pr-4 rounded-2xl text-lg font-medium outline-none" 
                  placeholder="••••••••" 
                  required
                />
              </div>
            </div>
          </div>

          {/* Password Requirements Visualizer */}
          <div className="flex flex-wrap gap-2 mt-4">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors font-bold text-[0.6875rem] ${checks.length ? 'bg-primary/10 text-primary' : 'bg-surface-container text-zinc-500'}`}>
              <span className="material-symbols-outlined text-[14px]">check_circle</span> 8+ CHARS
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors font-bold text-[0.6875rem] ${checks.special ? 'bg-primary/10 text-primary' : 'bg-surface-container text-zinc-500'}`}>
              <span className="material-symbols-outlined text-[14px]">check_circle</span> 1 SPECIAL
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors font-bold text-[0.6875rem] ${checks.number ? 'bg-primary/10 text-primary' : 'bg-surface-container text-zinc-500'}`}>
              <span className="material-symbols-outlined text-[14px]">check_circle</span> 1 NUMBER
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full mt-8 bg-primary text-on-primary font-black py-5 rounded-full text-lg tracking-tight hover:opacity-90 active:scale-[0.98] transition-all duration-200 shadow-[0_0_20px_rgba(177,255,36,0.2)] flex justify-center items-center gap-2"
          >
            {loading ? (
              <span className="w-6 h-6 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
            ) : (
              'Update Password'
            )}
          </button>
        </form>

        <div className="mt-12 text-center">
          <Link 
            to="/login"
            className="text-on-surface-variant text-sm font-semibold hover:text-on-surface transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Return to Login
          </Link>
        </div>
      </main>

      <div className="fixed bottom-12 right-12 hidden lg:block opacity-10 select-none pointer-events-none">
        <span className="text-9xl font-black italic tracking-tighter uppercase leading-none">RESET</span>
      </div>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 bg-[#1a1919]/60 backdrop-blur-[20px] border border-outline-variant/10 rounded-full">
        <div className="w-2 h-2 rounded-full bg-secondary animate-pulse shadow-[0_0_8px_#6a9cff]"></div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Encrypted Security Tunnel</span>
      </div>
    </div>
  );
};

export default ResetPassword;
