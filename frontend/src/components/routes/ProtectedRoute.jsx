import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAdmin, getUserRole } from '../../utils/authUtils';

/**
 * A component to protect routes based on authentication and roles.
 * @param {Object} props
 * @param {React.ReactNode} props.children The component to render if authorized
 * @param {Array<string>} props.allowedRoles List of roles allowed to access this route
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const location = useLocation();
  const token = localStorage.getItem('token');

  if (!token) {
    // Redirect to login but save the current location to redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0) {
    const role = getUserRole(token);
    const isAuthorized = allowedRoles.includes(role);

    if (!isAuthorized) {
      // If user is authenticated but doesn't have the right role
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
