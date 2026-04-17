import React, { useState, useEffect } from 'react';
import { updateProfile } from '../../services/api/auth.service';

const BiometricsForm = ({ user, userId, onUpdateSuccess }) => {
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phoneNumber: user?.phoneNumber || '',
    gender: user?.gender === null ? true : user?.gender,
    address: user?.address || ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Sync state if user prop changes
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        phoneNumber: user.phoneNumber || '',
        gender: user.gender === null ? true : user.gender,
        address: user.address || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenderChange = (val) => {
    setFormData(prev => ({ ...prev, gender: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      const profilePayload = {
        userId: userId,
        gender: formData.gender,
        address: formData.address,
        phoneNumber: formData.phoneNumber
      };

      await updateProfile(profilePayload);
      // Gửi toàn bộ dữ liệu đã cập nhật lên trang cha để update State ngay lập tức
      onUpdateSuccess(formData);
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-surface-container rounded-xl p-8 lg:p-10 border border-outline-variant/15 shadow-2xl shadow-black/40">
      <h3 className="text-xl font-bold mb-8 border-b border-outline-variant/15 pb-4">Core Biometrics</h3>
      
      {error && (
        <div className="mb-6 bg-error/10 border border-error/20 p-4 rounded-lg text-error text-sm font-bold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Full Name */}
        <div className="flex flex-col gap-2 relative opacity-60">
          <label className="text-xs uppercase tracking-[0.05em] text-on-surface-variant font-bold flex items-center gap-1">
            Full Name <span className="material-symbols-outlined text-[10px]">lock</span>
          </label>
          <div className="relative rounded-lg border border-outline-variant/30 bg-surface-container/50">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">person</span>
            <input 
              name="fullName"
              className="w-full bg-transparent border-none text-on-surface-variant pl-12 pr-4 py-4 rounded-lg cursor-not-allowed outline-none" 
              type="text" 
              value={formData.fullName}
              readOnly
            />
          </div>
        </div>

        {/* Phone Number */}
        <div className="flex flex-col gap-2 relative">
          <label className="text-xs uppercase tracking-[0.05em] text-on-surface-variant font-bold">Comms Link (Phone)</label>
          <div className="relative rounded-lg transition-all border border-outline-variant/30 bg-surface-container-lowest focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">call</span>
            <input 
              name="phoneNumber"
              className="w-full bg-transparent border-none text-on-surface pl-12 pr-4 py-4 rounded-lg focus:ring-0 outline-none" 
              type="tel" 
              value={formData.phoneNumber}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      <div className="mb-8">
        <label className="text-xs uppercase tracking-[0.05em] text-on-surface-variant font-bold block mb-4">Biological Anchor (Gender)</label>
        <div className="flex bg-surface-container-lowest p-1 rounded-lg border border-outline-variant/20 inline-flex w-full sm:w-auto">
          <button 
            type="button"
            onClick={() => handleGenderChange(true)}
            className={`flex-1 sm:px-8 py-3 rounded-md text-sm font-bold transition-all text-center ${formData.gender === true ? 'bg-surface-container-highest text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            Male
          </button>
          <button 
            type="button"
            onClick={() => handleGenderChange(false)}
            className={`flex-1 sm:px-8 py-3 rounded-md text-sm font-bold transition-all text-center ${formData.gender === false ? 'bg-surface-container-highest text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            Female
          </button>
        </div>
      </div>

      <div className="mb-12">
        <label className="text-xs uppercase tracking-[0.05em] text-on-surface-variant font-bold block mb-2">Base of Operations (Address)</label>
        <div className="relative rounded-lg transition-all border border-outline-variant/30 bg-surface-container-lowest focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
          <span className="material-symbols-outlined absolute left-4 top-4 text-on-surface-variant">location_on</span>
          <textarea 
            name="address"
            className="w-full bg-transparent border-none text-on-surface pl-12 pr-4 py-4 rounded-lg focus:ring-0 outline-none resize-none" 
            rows="3"
            value={formData.address}
            onChange={handleChange}
          ></textarea>
        </div>
      </div>

      <div className="flex justify-end gap-4 border-t border-outline-variant/15 pt-8 mt-4">
        <button 
          type="button"
          onClick={() => onUpdateSuccess(null)} // Trigger re-fetch
          className="px-8 py-4 rounded-full font-bold text-sm text-on-surface hover:bg-surface-container-highest transition-colors uppercase tracking-widest"
        >
          Discard
        </button>
        <button 
          type="submit"
          disabled={saving}
          className="px-10 py-4 rounded-full font-bold text-sm bg-primary text-on-primary shadow-[0_10px_30px_rgba(177,255,36,0.3)] hover:shadow-[0_15px_40px_rgba(177,255,36,0.5)] transition-all uppercase tracking-widest hover:-translate-y-1 flex items-center gap-2"
        >
          {saving ? (
            <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </form>
  );
};

export default BiometricsForm;
