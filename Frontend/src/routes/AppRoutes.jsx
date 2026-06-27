import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from '../layouts/MainLayout.jsx';
import AuthLayout from '../layouts/AuthLayout.jsx';

// Pages
import Home from '../pages/Home/Home.jsx';
import Login from '../pages/Auth/Login.jsx';
import Register from '../pages/Auth/Register.jsx';
import Profile from '../pages/Profile/Profile.jsx';
import DashboardHome from '../pages/Dashboard/DashboardHome.jsx';
import VerifyEmailPage from '../pages/Auth/VerifyEmailPage.jsx';
import NotFound from '../pages/NotFound/NotFound.jsx';

// Gate
import ProtectedRoute from './ProtectedRoute.jsx';

const AppRoutes = () => {
  return (
    <Routes>
      {/* General Site Routes */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route 
          path="profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="dashboard" 
          element={
            <ProtectedRoute>
              <DashboardHome />
            </ProtectedRoute>
          } 
        />
      </Route>

      {/* Authentication Gateway Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Verification Route */}
      <Route path="/verify-email" element={<VerifyEmailPage />} />

      {/* Fallback 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
