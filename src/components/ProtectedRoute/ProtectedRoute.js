// src/components/ProtectedRoute/ProtectedRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Container, CircularProgress, Box, Typography } from '@mui/material';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center"
          minHeight="400px"
        >
          <CircularProgress size={60} />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Verificando autenticación...
          </Typography>
        </Box>
      </Container>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si requiere admin y no es admin, redirigir al inicio
  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/" replace />;
  }

  // Si todo está bien, mostrar el componente
  return children;
};

export default ProtectedRoute;