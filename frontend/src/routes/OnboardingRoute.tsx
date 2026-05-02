import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

import { checkProfileExists } from '../services/profile.service';

/**
 * OnboardingRoute guard
 *
 * - User must be logged in (has token)
 * - If profile already exists → redirect to /chat
 * - If no profile → render onboarding
 */
const OnboardingRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<'loading' | 'ok' | 'redirect'>('loading');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setStatus('redirect'); // no auth → redirect handled by PrivateRoute upstream
      return;
    }

    checkProfileExists()
      .then((exists) => {
        setStatus(exists ? 'redirect' : 'ok');
      })
      .catch(() => {
        // On error, allow access (profile check is non-blocking)
        setStatus('ok');
      });
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div
          className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"
          style={{ boxShadow: '0 0 12px rgba(177,255,36,0.2)' }}
        />
      </div>
    );
  }

  if (status === 'redirect') {
    return <Navigate to="/chat" replace />;
  }

  return <>{children}</>;
};

export default OnboardingRoute;
