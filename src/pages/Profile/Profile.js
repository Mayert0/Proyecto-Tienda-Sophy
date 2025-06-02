// src/pages/Profile/Profile.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Divider,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  Home,
  Edit,
  Save,
  Cancel,
  Security,
  Visibility,
  VisibilityOff,
  AccountCircle
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { clientService } from '../../services/api';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    nombreCliente: '',
    correoCliente: '',
    direccionCliente: '',
    telefono: ''
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadClientData();
  }, [user]);

  const loadClientData = async () => {
    try {
      setLoading(true);
      const clients = await clientService.getAllClients();
      const client = clients.find(c => c.correoCliente === user.correoUsuario);
      
      if (client) {
        setClientData(client);
        setFormData({
          nombreCliente: client.nombreCliente || '',
          correoCliente: client.correoCliente || '',
          direccionCliente: client.direccionCliente || '',
          telefono: client.telefono || ''
        });
      }
    } catch (error) {
      console.error('Error al cargar datos del cliente:', error);
      toast.error('Error al cargar información del perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.nombreCliente || !formData.correoCliente || 
        !formData.direccionCliente || !formData.telefono) {
      setError('Todos los campos son requeridos');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.correoCliente)) {
      setError('Por favor ingresa un correo electrónico válido');
      return false;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.telefono.replace(/\s/g, ''))) {
      setError('Por favor ingresa un número de teléfono válido (10 dígitos)');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError('');

      const updatedClientData = {
        ...clientData,
        ...formData
      };

      await clientService.updateClient(updatedClientData);
      setClientData(updatedClientData);
      setEditing(false);
      setSuccess('Perfil actualizado exitosamente');
      toast.success('Perfil actualizado exitosamente');
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      setError('Error al actualizar el perfil. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      setError('Todos los campos de contraseña son requeridos');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    // Validar formato de contraseña
    if (passwordData.newPassword.length < 6 || passwordData.newPassword.length > 8) {
      setError('La contraseña debe tener entre 6 y 8 caracteres');
      return;
    }

    const hasUpperCase = /[A-Z]/.test(passwordData.newPassword);
    const hasLowerCase = /[a-z]/.test(passwordData.newPassword);
    const hasNumbers = /\d/.test(passwordData.newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      setError('La contraseña debe contener al menos una mayúscula, una minúscula y un número');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const updatedUserData = {
        ...user,
        clave: passwordData.newPassword // El backend se encarga del hash
      };

      await updateProfile(updatedUserData);
      setPasswordDialogOpen(false);
      setPasswordData({ newPassword: '', confirmPassword: '' });
      toast.success('Contraseña actualizada exitosamente');
    } catch (error) {
      console.error('Error al actualizar contraseña:', error);
      setError('Error al actualizar la contraseña. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      nombreCliente: clientData?.nombreCliente || '',
      correoCliente: clientData?.correoCliente || '',
      direccionCliente: clientData?.direccionCliente || '',
      telefono: clientData?.telefono || ''
    });
    setEditing(false);
    setError('');
  };

  if (loading && !clientData) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Mi Perfil
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Información del usuario */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  margin: 'auto',
                  mb: 2,
                  bgcolor: 'primary.main'
                }}
              >
                <AccountCircle sx={{ fontSize: 60 }} />
              </Avatar>
              
              <Typography variant="h6" gutterBottom>
                {user.login}
              </Typography>
              
              <Chip
                label={user.idTipoUsuario}
                color="primary"
                variant="outlined"
                sx={{ mb: 2 }}
              />
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Miembro desde: {new Date(user.fchaUltmaClave).toLocaleDateString()}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Estado: <Chip 
                  label={user.estado === 1 ? 'Activo' : 'Inactivo'} 
                  color={user.estado === 1 ? 'success' : 'error'}
                  size="small"
                />
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Formulario de perfil */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                Información Personal
              </Typography>
              {!editing ? (
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={() => setEditing(true)}
                >
                  Editar
                </Button>
              ) : (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSave}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={20} /> : 'Guardar'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={handleCancel}
                  >
                    Cancelar
                  </Button>
                </Box>
              )}
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nombre Completo"
                  name="nombreCliente"
                  value={formData.nombreCliente}
                  onChange={handleChange}
                  disabled={!editing}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Correo Electrónico"
                  name="correoCliente"
                  type="email"
                  value={formData.correoCliente}
                  onChange={handleChange}
                  disabled={!editing}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Dirección"
                  name="direccionCliente"
                  value={formData.direccionCliente}
                  onChange={handleChange}
                  disabled={!editing}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Home color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Teléfono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  disabled={!editing}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Seguridad */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Seguridad
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Última actualización de contraseña: {new Date(user.fchaUltmaClave).toLocaleDateString()}
                </Typography>
              </Box>
              <Button
                variant="outlined"
                startIcon={<Security />}
                onClick={() => setPasswordDialogOpen(true)}
              >
                Cambiar Contraseña
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Dialog para cambio de contraseña */}
      <Dialog 
        open={passwordDialogOpen} 
        onClose={() => setPasswordDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Cambiar Contraseña</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Nueva Contraseña"
              name="newPassword"
              type={showNewPassword ? 'text' : 'password'}
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      edge="end"
                    >
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              helperText="6-8 caracteres, debe incluir mayúscula, minúscula y número"
            />
            
            <TextField
              fullWidth
              label="Confirmar Nueva Contraseña"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handlePasswordUpdate}
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Actualizar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile;