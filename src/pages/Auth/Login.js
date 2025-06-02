// src/pages/Auth/Login.js
import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Link as MuiLink,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress
} from '@mui/material';
import {
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Pets
} from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/catalog';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Error en login:', err);
      setError(err.response?.data || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={6}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%'
          }}
        >
          {/* Logo */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mb: 3,
              color: 'primary.main'
            }}
          >
            <Pets sx={{ fontSize: 40, mr: 1 }} />
            <Typography component="h1" variant="h4" fontWeight="bold">
              Tienda Mascotas
            </Typography>
          </Box>

          <Typography component="h2" variant="h5" gutterBottom>
            Iniciar Sesión
          </Typography>
          
          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
            Ingresa tus credenciales para acceder a tu cuenta
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Correo Electrónico"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={togglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Iniciar Sesión'
              )}
            </Button>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <MuiLink
                component={Link}
                to="/forgot-password"
                variant="body2"
                sx={{ textDecoration: 'none' }}
              >
                ¿Olvidaste tu contraseña?
              </MuiLink>
            </Box>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Typography variant="body2">
                ¿No tienes una cuenta?{' '}
                <MuiLink
                  component={Link}
                  to="/register"
                  variant="body2"
                  sx={{ textDecoration: 'none', fontWeight: 'bold' }}
                >
                  Regístrate aquí
                </MuiLink>
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Demo credentials info */}
        <Paper
          elevation={2}
          sx={{
            mt: 3,
            p: 2,
            width: '100%',
            bgcolor: 'info.light',
            color: 'info.contrastText'
          }}
        >
          <Typography variant="body2" fontWeight="bold" gutterBottom>
            💡 Información para pruebas:
          </Typography>
          <Typography variant="body2">
            • Regístrate con tu correo para recibir credenciales automáticamente
          </Typography>
          <Typography variant="body2">
            • El sistema genera contraseñas seguras de 6-8 caracteres
          </Typography>
          <Typography variant="body2">
            • Máximo 3 intentos de login antes del bloqueo
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;