import React, { useMemo } from 'react';
import { getDecodedToken } from '../../utils/authUtils';

const BioCard = ({ user, userId, isAdmin }) => {
  const token = localStorage.getItem('token');
  const decoded = useMemo(() => getDecodedToken(token), [token]);
  
  const email = decoded?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || 'N/A';
  const fullId = decoded?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || userId;

  // Random avatar on hover effect logic
  const randomAvatar = `https://loremflickr.com/300/300/fitness?lock=${fullId}`;

  return (
    <div className="bg-surface-container p-8 rounded-xl border border-outline-variant/15 flex flex-col items-center text-center relative overflow-hidden group">
      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-surface-container-highest relative mb-6">
        <img
          alt="Athlete avatar large"
          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
          src={user?.avatarUrl || randomAvatar}
        />
      </div>
      
      <h2 className="text-2xl font-bold mb-1">{user?.fullName || 'Anonymous'}</h2>

      <p className="text-primary font-bold uppercase tracking-widest text-[10px] mb-6">
        UUID: <span className="opacity-70">{fullId}</span>
      </p>

      <div className="w-full h-[1px] bg-outline-variant/20 mb-6"></div>

      <div className="w-full flex justify-between text-sm mb-2">
        <span className="text-on-surface-variant">Email Address</span>
        <span className="font-bold truncate ml-4 max-w-[180px]">{email}</span>
      </div>

      <div className="w-full flex justify-between text-sm">
        <span className="text-on-surface-variant">Access Level</span>
        <span className={isAdmin ? "text-primary font-black uppercase tracking-tighter" : "font-bold"}>
          {isAdmin ? 'System Administrator' : 'Standard Athlete'}
        </span>
      </div>
    </div>
  );
};

export default BioCard;
