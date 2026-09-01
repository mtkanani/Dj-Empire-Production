import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { Loading } from '../components/common/Loading.jsx';

// Role-based Route Guard
export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, userRole, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading fullScreen text="Verifying authorization..." />;
  }

  if (!isAuthenticated) {
    const isOrganizerRoute = location.pathname.startsWith('/organizer') || location.pathname.startsWith('/client');
    const loginPath = isOrganizerRoute ? '/organizer/login' : '/login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole) && userRole !== 'SUPER_ADMIN' && userRole !== 'ADMIN') {
    // Role mismatch -> redirect to appropriate portal
    if (userRole === 'EVENT_ORGANIZER' || userRole === 'ORGANIZER') {
      return <Navigate to="/organizer/dashboard" replace />;
    }
    return <Navigate to="/events" replace />;
  }

  return children;
};

// Redirect already authenticated users away from /login & /register to their respective dashboard
export const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, userRole, loading } = useAuth();

  if (loading) return null;

  if (isAuthenticated) {
    if (userRole === 'SUPER_ADMIN' || userRole === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (userRole === 'EVENT_ORGANIZER' || userRole === 'ORGANIZER') {
      return <Navigate to="/organizer/dashboard" replace />;
    }
    return <Navigate to="/events" replace />;
  }

  return children;
};
