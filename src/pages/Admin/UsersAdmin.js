//UsersAdmin.js - CORREGIDO
// src/pages/Admin/UsersAdmin.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Search,
  LockOpen,
  Block,
  Person,
  Email
} from '@mui/icons-material';
import { userService } from '../../services/api';
import { parameterService } from '../../services/api';
import { toast } from 'react-toastify';

const UsersAdmin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [searchTerm, setSearchTerm] = useState('');
  const [unblockingUserId, setUnblockingUserId] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    user: null,
    action: ''
  });

  useEffect(() => {
    loadUsers();
    loadMaxAttempts();
  }, []);

  // ✅ FUNCIÓN loadUsers DEFINIDA CORRECTAMENTE
  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await userService.getAllUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const loadMaxAttempts = async () => {
    try {
      const max = await parameterService.getMaxLoginAttempts();
      setMaxAttempts(max);
    } catch (error) {
      console.error('Error cargando máximo de intentos:', error);
      setMaxAttempts(3);
    }
  };

  const handleUnblockAccount = async (user) => {
    try {
      setUnblockingUserId(user.id); // Mostrar loading
     
      const response = await userService.unblockAccount(user.id);
     
      if (response.success) {
        // Éxito
        toast.success(
          `✅ Cuenta desbloqueada: ${response.details.usuario}\n📧 Nueva contraseña enviada a: ${response.details.correo}`,
          { autoClose: 5000 }
        );
       
        loadUsers(); // Recargar lista
        setConfirmDialog({ open: false, user: null, action: '' }); // Cerrar modal
      } else {
        // Error controlado del backend
        toast.error(`❌ ${response.message}`);
      }
     
    } catch (error) {
      // Error de conexión o no controlado
      console.error('Error:', error);
      const errorMsg = error.response?.data?.message || 'Error al desbloquear cuenta';
      toast.error(`❌ ${errorMsg}`);
    } finally {
      setUnblockingUserId(null); // Quitar loading
    }
  };

  const openConfirmDialog = (user, action) => {
    setConfirmDialog({ open: true, user, action });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({ open: false, user: null, action: '' });
  };

  const getStatusChip = (user) => {
    if (user.intentos >= maxAttempts) {
      return <Chip label="BLOQUEADA" color="error" icon={<Block />} />;
    } else if (user.estado === 1) {
      return <Chip label="ACTIVA" color="success" icon={<Person />} />;
    } else {
      return <Chip label="INACTIVA" color="default" />;
    }
  };

  const getUserTypeLabel = (idTipoUsuario) => {
    switch (idTipoUsuario) {
      case '1':
        return 'Administrador';
      case '2':
        return 'Cliente';
      default:
        return 'Desconocido';
    }
  };

  const filteredUsers = users.filter(user =>
    user.login?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.correoUsuario?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const blockedUsersCount = users.filter(u => u.intentos >= maxAttempts).length;

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Cargando usuarios...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Gestión de Usuarios
      </Typography>

      {blockedUsersCount > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>⚠️ Atención:</strong> Hay {blockedUsersCount} cuenta(s) bloqueada(s) que requieren atención.
            (Límite actual: {maxAttempts} intentos fallidos)
          </Typography>
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Buscar usuarios por login o correo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1 }} />
          }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Login</TableCell>
              <TableCell>Correo</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Intentos</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Última Clave</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow
                key={user.id}
                sx={{
                  backgroundColor: user.intentos >= 3 ? 'error.light' : 'inherit',
                  '&:hover': { backgroundColor: user.intentos >= 3 ? 'error.main' : 'action.hover' }
                }}
              >
                <TableCell>{user.id}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Person sx={{ mr: 1 }} />
                    {user.login}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Email sx={{ mr: 1 }} />
                    {user.correoUsuario}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getUserTypeLabel(user.idTipoUsuario)}
                    color={user.idTipoUsuario === '1' ? 'primary' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.intentos}
                    color={user.intentos >= 3 ? 'error' : user.intentos > 0 ? 'warning' : 'success'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{getStatusChip(user)}</TableCell>
                <TableCell>
                  {user.fchaUltmaClave ? new Date(user.fchaUltmaClave).toLocaleDateString() : 'N/A'}
                </TableCell>
                <TableCell>
                  {user.intentos >= maxAttempts && user.idTipoUsuario !== '1' && (
                    <Button
                      size="small"
                      variant="contained"
                      color="warning"
                      startIcon={unblockingUserId === user.id ? <CircularProgress size={16} /> : <LockOpen />}
                      onClick={() => openConfirmDialog(user, 'unblock')}
                      disabled={unblockingUserId === user.id}
                      sx={{ mr: 1 }}
                    >
                      {unblockingUserId === user.id ? 'Desbloqueando...' : 'Desbloquear'}
                    </Button>
                  )}
                 
                  {user.idTipoUsuario === '1' && (
                    <Chip label="ADMIN - Sin límite" color="primary" size="small" />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog de Confirmación */}
      <Dialog
        open={confirmDialog.open}
        onClose={closeConfirmDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Confirmar Desbloqueo de Cuenta
        </DialogTitle>
        <DialogContent>
          {confirmDialog.user && (
            <Box>
              <Typography variant="body1" paragraph>
                ¿Estás seguro de que deseas desbloquear la cuenta del siguiente usuario?
              </Typography>
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="body2">
                  <strong>Usuario:</strong> {confirmDialog.user.login}
                </Typography>
                <Typography variant="body2">
                  <strong>Correo:</strong> {confirmDialog.user.correoUsuario}
                </Typography>
                <Typography variant="body2">
                  <strong>Intentos fallidos:</strong> {confirmDialog.user.intentos}
                </Typography>
              </Paper>
             
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2" component="div">
                  <strong>⚠️ Al desbloquear la cuenta:</strong>
                  <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                    <li>Se generará una <strong>nueva contraseña automáticamente</strong></li>
                    <li>La nueva contraseña será enviada al correo del usuario</li>
                    <li>El contador de intentos fallidos se reiniciará a 0</li>
                    <li>El usuario podrá iniciar sesión inmediatamente</li>
                  </ul>
                </Typography>
              </Alert>
             
              <Alert severity="info" sx={{ mt: 1 }}>
                <Typography variant="body2">
                  📧 Se enviará un correo a <strong>{confirmDialog.user.correoUsuario}</strong> con las nuevas credenciales.
                </Typography>
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmDialog}>
            Cancelar
          </Button>
          <Button
            onClick={() => handleUnblockAccount(confirmDialog.user)}
            variant="contained"
            color="warning"
            startIcon={unblockingUserId ? <CircularProgress size={16} /> : <LockOpen />}
            disabled={unblockingUserId !== null}
          >
            {unblockingUserId ? 'Desbloqueando...' : 'Desbloquear Cuenta'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UsersAdmin;