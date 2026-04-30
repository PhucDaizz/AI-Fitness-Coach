import React from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import Home from '../pages/Home';
import Login from '../pages/auth/Login';
import SignUp from '../pages/auth/SignUp';
import OAuthCallback from '../pages/auth/OAuthCallback';
import SystemStatistics from '../pages/admin/SystemStatistics';
import ExerciseCategoryPage from '../pages/admin/ExerciseCategoryPage';
import MuscleGroupPage from '../pages/admin/MuscleGroupPage';
import EquipmentPage from '../pages/admin/EquipmentPage';
import ExercisePage from '../pages/admin/ExercisePage';
import MealPage from '../pages/admin/MealPage';
import ProfilePage from '../pages/auth/ProfilePage';
import SecurityPage from '../pages/auth/SecurityPage';
import ForgotPassword from '../pages/auth/ForgotPassword';
import VerifyEmail from '../pages/auth/VerifyEmail';
import ResetPassword from '../pages/auth/ResetPassword';
import PrivacyPolicy from '../pages/PrivacyPolicy';
import TermsOfService from '../pages/TermsOfService';
import ProtectedRoute from '../components/routes/ProtectedRoute';
import ChatPage from '../pages/customer/ChatPage';

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/oauth-callback" element={<OAuthCallback />} />
        
        {/* Customer Routes */}
        <Route 
          path="/chat/:sessionId?" 
          element={
            <ProtectedRoute allowedRoles={['Customer', 'SysAdmin', 'Admin']}>
              <ChatPage />
            </ProtectedRoute>
          } 
        />

        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={['SysAdmin', 'Admin']}>
              <SystemStatistics />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/exercise-category" 
          element={
            <ProtectedRoute allowedRoles={['SysAdmin', 'Admin']}>
              <ExerciseCategoryPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/muscle-group" 
          element={
            <ProtectedRoute allowedRoles={['SysAdmin', 'Admin']}>
              <MuscleGroupPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/equipment" 
          element={
            <ProtectedRoute allowedRoles={['SysAdmin', 'Admin']}>
              <EquipmentPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/exercises" 
          element={
            <ProtectedRoute allowedRoles={['SysAdmin', 'Admin']}>
              <ExercisePage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/meals" 
          element={
            <ProtectedRoute allowedRoles={['SysAdmin', 'Admin']}>
              <MealPage />
            </ProtectedRoute>
          } 
        />

        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/security" element={<SecurityPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/auth/resetpass" element={<ResetPassword />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        
        {/* Wildcard to redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
