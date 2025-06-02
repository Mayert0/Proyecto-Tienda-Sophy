// src/pages/Auth/Register.js
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
  CircularProgress,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import {
  Email,
  Person,
  Home,
  Phone,
  Pets,
  CheckCircle
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { clientService } from '../../services/api';

const Register = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    correoUsuario: '',
    nombreCliente: '',
    direccionCliente: '',
    telefono: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const steps = ['Crear Usuario', 'Información Personal', 'Confirmación'];

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone) => {
    const re = /^[0-9]{10}$/;
    return re.test(phone.replace(/\s/g, ''));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const validateStep = () => {
    switch (activeStep) {
      case 0:
        if (!formData.correoUsuario) {
          setError('El correo electrónico es requerido');
          return false;
        }
        if (!validateEmail(formData.correoUsuario)) {
          setError('Por favor ingresa un correo electrónico válido');
          return false;
        }
        break;
      case 1:
        if (!formData.nombreCliente || !formData.direccionCliente || !formData.telefono) {
          setError('Todos los campos son requeridos');
          return false;
        }
        if (!validatePhone(formData.telefono)) {
          setError('Por favor ingresa un número de teléfono válido (10 dígitos)');
          return false;
        }
        break;
      default:
        break;
    }
    setError('');
    return true;
  };

  const handleSubmit = async () => {
  if (!validateStep()) return;

  setLoading(true);
  setError('');

  try {
    // Paso 1: Registrar usuario y obtener credenciales por correo
    await register({ correoUsuario: formData.correoUsuario });
   
    // Paso 2: Crear perfil de cliente
    const clientData = {
      nombreCliente: formData.nombreCliente,
      correoCliente: formData.correoUsuario,
      direccionCliente: formData.direccionCliente,
      telefono: formData.telefono,
      estado: 1
    };
   
    await clientService.createClient(clientData);
   
    setSuccess(true);
    setActiveStep(2);
   
    setTimeout(() => {
      navigate('/login', { 
        state: { 
          message: 'Registro exitoso. Revisa tu correo para obtener tu contraseña.' 
        } 
      });
    }, 2000); // Reducir tiempo a 2 segundos
   
  } catch (err) {
    console.error('Error en registro:', err);
    setError(err.response?.data || 'Error al registrar usuario. Por favor intenta nuevamente.');
  } finally {
    setLoading(false);
  }
};

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Crear tu cuenta
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Ingresa tu correo electrónico para comenzar
            </Typography>
            <TextField
              fullWidth
              id="correoUsuario"
              label="Correo Electrónico"
              name="correoUsuario"
              type="email"
              autoComplete="email"
              autoFocus
              value={formData.correoUsuario}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
              helperText="Recibirás tu contraseña en este correo"
            />
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Información personal
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Completa tu perfil para una mejor experiencia
            </Typography>
            <TextField
              fullWidth
              id="nombreCliente"
              label="Nombre Completo"
              name="nombreCliente"
              autoComplete="name"
              value={formData.nombreCliente}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              id="direccionCliente"
              label="Dirección"
              name="direccionCliente"
              autoComplete="address-line1"
              value={formData.direccionCliente}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Home color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              id="telefono"
              label="Teléfono"
              name="telefono"
              autoComplete="tel"
              value={formData.telefono}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone color="action" />
                  </InputAdornment>
                ),
              }}
              helperText="10 dígitos sin espacios"
            />
          </Box>
        );
      case 2:
        return (
          <Box textAlign="center">
            <CheckCircle
              sx={{
                fontSize: 80,
                color: 'success.main',
                mb: 2
              }}
            />
            <Typography variant="h5" gutterBottom>
              ¡Registro Exitoso!
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Tu cuenta ha sido creada exitosamente.
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Hemos enviado tu contraseña a: <strong>{formData.correoUsuario}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Serás redirigido al login en unos segundos...
            </Typography>
          </Box>
        );
      default:
        return 'Paso desconocido';
    }
  };

  return (
    <Container component="main" maxWidth="md">
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
            Crear Nueva Cuenta
          </Typography>

          {/* Stepper */}
          <Stepper activeStep={activeStep} sx={{ width: '100%', mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
              ¡Registro completado! Revisa tu correo electrónico.
            </Alert>
          )}

          <Box sx={{ width: '100%', minHeight: 300 }}>
            {getStepContent(activeStep)}
          </Box>

          {/* Navigation buttons */}
          {activeStep < 2 && (
            <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2, width: '100%' }}>
              <Button
                color="inherit"
                disabled={activeStep === 0}
                onClick={handleBack}
                sx={{ mr: 1 }}
              >
                Atrás
              </Button>
              <Box sx={{ flex: '1 1 auto' }} />
              {activeStep === steps.length - 2 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                  sx={{ minWidth: 120 }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Registrarse'
                  )}
                </Button>
              ) : (
                <Button onClick={handleNext} variant="contained">
                  Siguiente
                </Button>
              )}
            </Box>
          )}

          {/* Login link */}
          {activeStep < 2 && (
            <Box sx={{ textAlign: 'center', mt: 3, width: '100%' }}>
              <Typography variant="body2">
                ¿Ya tienes una cuenta?{' '}
                <MuiLink
                  component={Link}
                  to="/login"
                  variant="body2"
                  sx={{ textDecoration: 'none', fontWeight: 'bold' }}
                >
                  Inicia sesión aquí
                </MuiLink>
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Info section */}
        <Paper
          elevation={2}
          sx={{
            mt: 3,
            p: 2,
            width: '100%',
            bgcolor: 'primary.light',
            color: 'primary.contrastText'
          }}
        >
          <Typography variant="body2" fontWeight="bold" gutterBottom>
            🔐 Proceso de registro seguro:
          </Typography>
          <Typography variant="body2">
            • Tu contraseña será generada automáticamente y enviada por correo
          </Typography>
          <Typography variant="body2">
            • Cumple con todos los estándares de seguridad (6-8 caracteres, mayúscula, minúscula, número)
          </Typography>
          <Typography variant="body2">
            • Podrás cambiar tu contraseña después del primer login
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;