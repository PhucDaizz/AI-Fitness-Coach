import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/oauth-callback" element={<OAuthCallback />} />
        <Route path="/admin" element={<SystemStatistics />} />
        <Route path="/admin/exercise-category" element={<ExerciseCategoryPage />} />
        <Route path="/admin/muscle-group" element={<MuscleGroupPage />} />
        <Route path="/admin/equipment" element={<EquipmentPage />} />
        <Route path="/admin/exercises" element={<ExercisePage />} />
        <Route path="/admin/meals" element={<MealPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/security" element={<SecurityPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/auth/resetpass" element={<ResetPassword />} />
        
        {/* Wildcard to redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
