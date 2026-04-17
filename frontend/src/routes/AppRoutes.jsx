import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/auth/Login';
import SignUp from '../pages/auth/SignUp';
import OAuthCallback from '../pages/auth/OAuthCallback';
import SystemStatistics from '../pages/admin/SystemStatistics';
import ProfilePage from '../pages/auth/ProfilePage';
import SecurityPage from '../pages/auth/SecurityPage';
import ForgotPassword from '../pages/auth/ForgotPassword';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/oauth-callback" element={<OAuthCallback />} />
        <Route path="/admin" element={<SystemStatistics />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/security" element={<SecurityPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Wildcard to redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
