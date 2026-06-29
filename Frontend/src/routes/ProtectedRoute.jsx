import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400 font-medium tracking-wide">Syncing session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login page and save the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If email is not verified, redirect to verify-email
  if (user.emailVerified === false) {
    return <Navigate to={`/verify-email?email=${encodeURIComponent(user.email || '')}`} replace />;
  }

  return children;
};

export default ProtectedRoute;
