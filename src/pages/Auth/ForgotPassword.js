// src/pages/Auth/ForgotPassword.js
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
  CircularProgress
} from '@mui/material';
import {
  Email,
  ArrowBack,
  Pets,
  MailOutline
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email) {
      setError('Por favor ingresa tu correo electrónico');
      setLoading(false);
      return;
    }

    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor ingresa un correo electrónico válido');
      setLoading(false);
      return;
    }

    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      console.error('Error al recuperar contraseña:', err);
      setError(err.response?.data || 'Error al procesar la solicitud. Verifica que el correo esté registrado.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  if (success) {
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
              width: '100%',
              textAlign: 'center'
            }}
          >
            <MailOutline sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
            
            <Typography component="h1" variant="h4" gutterBottom color="success.main">
              ¡Correo Enviado!
            </Typography>
            
            <Typography variant="body1" paragraph>
              Hemos enviado una nueva contraseña a:
            </Typography>
            
            <Typography variant="h6" color="primary" gutterBottom>
              {email}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" paragraph>
              Revisa tu bandeja de entrada y sigue las instrucciones para acceder con tu nueva contraseña.
            </Typography>
            
            <Typography variant="body2" color="text.secondary" paragraph>
              Si no recibes el correo en unos minutos, revisa tu carpeta de spam o correo no deseado.
            </Typography>

            <Button
              variant="contained"
              component={Link}
              to="/login"
              sx={{ mt: 2 }}
              startIcon={<ArrowBack />}
            >
              Volver al Login
            </Button>
          </Paper>
        </Box>
      </Container>
    );
  }

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
            Recuperar Contraseña
          </Typography>
          
          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
            Ingresa tu correo electrónico y te enviaremos una nueva contraseña
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
              value={email}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 2, mb: 2, py: 1.5 }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                  Enviando...
                </>
              ) : (
                'Enviar Nueva Contraseña'
              )}
            </Button>

            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <MuiLink
                component={Link}
                to="/login"
                variant="body2"
                sx={{ 
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1
                }}
              >
                <ArrowBack fontSize="small" />
                Volver al Login
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

        {/* Info section */}
        <Paper
          elevation={2}
          sx={{
            mt: 3,
            p: 2,
            width: '100%',
            bgcolor: 'warning.light',
            color: 'warning.contrastText'
          }}
        >
          <Typography variant="body2" fontWeight="bold" gutterBottom>
            🔑 Proceso de recuperación:
          </Typography>
          <Typography variant="body2">
            • Genera automáticamente una nueva contraseña segura
          </Typography>
          <Typography variant="body2">
            • La envía directamente a tu correo electrónico
          </Typography>
          <Typography variant="body2">
            • Resetea el contador de intentos fallidos
          </Typography>
          <Typography variant="body2">
            • Puedes cambiar la contraseña después del login
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default ForgotPassword;