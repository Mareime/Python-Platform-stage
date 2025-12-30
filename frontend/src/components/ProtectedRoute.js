import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

const ProtectedRoute = ({ children, allowedRoles = [], redirectIfAuthenticated = false }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  // Si redirectIfAuthenticated est true et que l'utilisateur est authentifié, rediriger vers son dashboard
  if (redirectIfAuthenticated && isAuthenticated && user) {
    const dashboardRoutes = {
      'STAGIAIRE': '/dashboard/stagiaire',
      'ENTREPRISE': '/dashboard/entreprise',
      'ADMIN': '/dashboard/admin'
    };
    return <Navigate to={dashboardRoutes[user.role] || '/dashboard'} replace />;
  }

  if (!isAuthenticated && !redirectIfAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si des rôles sont spécifiés et que l'utilisateur n'a pas le bon rôle
  if (allowedRoles.length > 0 && isAuthenticated && !allowedRoles.includes(user?.role)) {
    // Rediriger vers le dashboard approprié selon le rôle
    const dashboardRoutes = {
      'STAGIAIRE': '/dashboard/stagiaire',
      'ENTREPRISE': '/dashboard/entreprise',
      'ADMIN': '/dashboard/admin'
    };
    
    return <Navigate to={dashboardRoutes[user?.role] || '/'} replace />;
  }

  return children;
};

export default ProtectedRoute;