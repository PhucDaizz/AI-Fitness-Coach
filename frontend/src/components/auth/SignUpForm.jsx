import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { register } from '../../services/api/auth.service';

const SignUpForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register(formData.fullName, formData.email, formData.password, formData.phoneNumber);
      navigate('/login'); // Redirect to login on success
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full glass-panel border border-outline-variant/10 rounded-lg p-8 md:p-12 shadow-2xl relative">
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/20 to-transparent blur-2xl rounded-tr-lg"></div>

      {error && (
        <div className="bg-error-container/20 border border-error/50 p-4 rounded-lg mb-6 text-error text-sm font-semibold relative z-10">
          {error}
        </div>
      )}

      <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Full Name */}
          <div className="relative group">
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 ml-1">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-lg group-focus-within:text-primary transition-colors pointer-events-none z-10">
                person
              </span>
              <input
                name="fullName"
                className="w-full bg-surface-container-lowest border-0 rounded-full py-4 pl-12 pr-6 text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary/50 transition-all font-bold tracking-tight outline-none relative z-0"
                placeholder="ALEX MERCER"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="relative group">
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 ml-1">
              Email
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-lg group-focus-within:text-primary transition-colors pointer-events-none z-10">
                alternate_email
              </span>
              <input
                name="email"
                className="w-full bg-surface-container-lowest border-0 rounded-full py-4 pl-12 pr-6 text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary/50 transition-all font-bold tracking-tight outline-none relative z-0"
                placeholder="ALEX@KINETIC.AI"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Password */}
            <div className="relative group">
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 ml-1">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-lg group-focus-within:text-primary transition-colors pointer-events-none z-10">
                  lock
                </span>
                <input
                  name="password"
                  className="w-full bg-surface-container-lowest border-0 rounded-full py-4 pl-12 pr-6 text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary/50 transition-all font-bold tracking-tight outline-none relative z-0"
                  placeholder="••••••••"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="relative group">
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 ml-1">
                Phone Number
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-lg group-focus-within:text-primary transition-colors pointer-events-none z-10">
                  phone_iphone
                </span>
                <input
                  name="phoneNumber"
                  className="w-full bg-surface-container-lowest border-0 rounded-full py-4 pl-12 pr-6 text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary/50 transition-all font-bold tracking-tight outline-none relative z-0"
                  placeholder="+1 (555) 000-0000"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Primary Action */}
        <div className="pt-4">
          <button
            className={`w-full bg-primary text-on-primary font-black italic text-lg py-5 rounded-full kinetic-pulse active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 group ${loading ? 'opacity-50' : ''}`}
            disabled={loading}
          >
            {loading ? 'INITIATING...' : 'CREATE ACCOUNT'}
            {!loading && (
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            )}
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-outline-variant/20"></div>
          <span className="flex-shrink mx-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
            Or sign up with
          </span>
          <div className="flex-grow border-t border-outline-variant/20"></div>
        </div>

        {/* Social Sign Up */}
        <button
          type="button"
          className="w-full flex items-center justify-center gap-3 bg-surface-container-highest border border-outline-variant/30 text-on-surface font-bold py-4 rounded-full hover:bg-surface-bright transition-all active:scale-[0.98]"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="currentColor"
            ></path>
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="currentColor"
            ></path>
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="currentColor"
            ></path>
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="currentColor"
            ></path>
          </svg>
          Sign up with Google
        </button>
      </form>
    </div>
  );
};

export default SignUpForm;
