import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { isAdmin } from '../../utils/authUtils';
import { checkProfileExists } from '../../services/profile.service';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const refreshToken = params.get('refreshToken');

    if (token && refreshToken) {
      console.log('OAuth transformation complete. Saving tokens...');
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      
      const handleRedirect = async () => {
        if (isAdmin(token)) {
          navigate('/admin');
          return;
        }

        try {
          const exists = await checkProfileExists();
          navigate(exists ? '/chat' : '/onboarding');
        } catch (error) {
          console.error('Error checking profile existence in OAuth callback:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          navigate('/login');
        }
      };

      // Redirect based on role and profile existence
      setTimeout(() => {
        handleRedirect();
      }, 500);
    } else {
      console.error('Missing tokens in OAuth callback');
      navigate('/login');
    }
  }, [location, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-8 text-primary font-black italic tracking-tighter uppercase animate-pulse">
        Synchronizing Performance Stream...
      </p>
    </div>
  );
};

export default OAuthCallback;

