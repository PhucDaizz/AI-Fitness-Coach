import React, { useState } from 'react';
import { changePassword } from '../../services/api/auth.service';

const ChangePasswordForm = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const validatePassword = (pass) => {
    const hasUpperCase = /[A-Z]/.test(pass);
    const hasNumber = /\d/.test(pass);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    return hasUpperCase && hasNumber && hasSpecialChar;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (formData.newPassword !== formData.confirmNewPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (!validatePassword(formData.newPassword)) {
      setMessage({ type: 'error', text: 'Password must contain at least 1 uppercase letter, 1 special character, and 1 digit.' });
      return;
    }

    try {
      setLoading(true);
      const response = await changePassword(formData);
      if (response) {
        setMessage({ type: 'success', text: 'Password changed successfully' });
        setFormData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to change password' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-surface-container p-8 rounded-[2rem] relative overflow-hidden group border border-outline-variant/10">
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-primary/10 transition-colors duration-700"></div>
      
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center text-primary">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>password</span>
        </div>
        <h2 className="font-headline font-bold text-xl md:text-2xl text-on-surface">Change Password</h2>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-xl text-sm font-bold flex items-center gap-2 ${message.type === 'success' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-error/10 text-error border border-error/20'}`}>
          <span className="material-symbols-outlined">{message.type === 'success' ? 'check_circle' : 'error'}</span>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 relative z-10">
        <div className="flex flex-col gap-2">
          <label className="font-label text-[0.6875rem] uppercase tracking-widest text-on-surface-variant ml-2 font-bold">Current Password</label>
          <input 
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl px-4 py-4 text-on-surface placeholder:text-outline-variant focus:ring-1 focus:ring-primary focus:bg-surface-container-low transition-all text-base outline-none" 
            placeholder="••••••••" 
            type="password"
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="font-label text-[0.6875rem] uppercase tracking-widest text-on-surface-variant ml-2 font-bold">New Password</label>
            <input 
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl px-4 py-4 text-on-surface placeholder:text-outline-variant focus:ring-1 focus:ring-primary focus:bg-surface-container-low transition-colors text-base outline-none" 
              placeholder="••••••••" 
              type="password"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-label text-[0.6875rem] uppercase tracking-widest text-on-surface-variant ml-2 font-bold">Confirm New Password</label>
            <input 
              name="confirmNewPassword"
              value={formData.confirmNewPassword}
              onChange={handleChange}
              className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl px-4 py-4 text-on-surface placeholder:text-outline-variant focus:ring-1 focus:ring-primary focus:bg-surface-container-low transition-colors text-base outline-none" 
              placeholder="••••••••" 
              type="password"
              required
            />
          </div>
        </div>

        <div className="mt-4">
          <button 
            type="submit"
            disabled={loading}
            className="bg-primary text-on-primary font-bold px-8 py-4 rounded-full w-full md:w-auto hover:bg-primary-dim transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(177,255,36,0.15)] hover:shadow-[0_0_30px_rgba(177,255,36,0.25)] flex justify-center items-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
            ) : (
              'Save New Password'
            )}
          </button>
        </div>
      </form>
    </section>
  );
};

export default ChangePasswordForm;
