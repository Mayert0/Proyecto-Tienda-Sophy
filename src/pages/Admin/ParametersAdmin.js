// src/pages/Admin/ParametersAdmin.js - CRUD COMPLETAMENTE FUNCIONAL
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Settings,
  Security,
  ShoppingCart,
  Percent,
  Save,
  Cancel
} from '@mui/icons-material';
import { parameterService } from '../../services/api';
import { validateParameters } from '../../utils/parameterValidator';
import { toast } from 'react-toastify';

const ParametersAdmin = () => {
  const [parameters, setParameters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingParameter, setEditingParameter] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [formData, setFormData] = useState({
    descripcion: '',
    valorTexto: '',
    valorNumero: '',
    fechaInicial: '',
    fechaFinal: '',
    estado: 1
  });

  // Parámetros críticos que DEBEN existir
  const requiredParameters = [
    {
      descripcion: 'Máximo productos por día por cliente',
      valorNumero: 3,
      valorTexto: '3',
      keyword: 'productos'
    },
    {
      descripcion: 'Máximo intentos fallidos de login',
      valorNumero: 3,
      valorTexto: '3',
      keyword: 'intentos'
    },
    {
      descripcion: 'Porcentaje de IVA (%)',
      valorNumero: 19,
      valorTexto: '19',
      keyword: 'iva'
    }
  ];

  useEffect(() => {
    loadParameters();
  }, []);

  const loadParameters = async () => {
    try {
      setLoading(true);
      const parametersData = await parameterService.getAllParameters();
      setParameters(parametersData);
      
      // Verificar y crear parámetros críticos faltantes silenciosamente
      await ensureCriticalParameters(parametersData);
      
    } catch (error) {
      console.error('Error al cargar parámetros:', error);
      toast.error('Error al cargar parámetros');
    } finally {
      setLoading(false);
    }
  };

  const ensureCriticalParameters = async (currentParams) => {
    try {
      let needsReload = false;
      
      for (const required of requiredParameters) {
        const exists = currentParams.some(p => 
          p.descripcion.toLowerCase().includes(required.keyword)
        );
        
        if (!exists) {
          try {
            const newParam = {
              descripcion: required.descripcion,
              valorNumero: required.valorNumero,
              valorTexto: required.valorTexto,
              fechaInicial: new Date().toISOString().split('T')[0],
              fechaFinal: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
              estado: 1
            };
            
            await parameterService.createParameter(newParam);
            needsReload = true;
          } catch (error) {
            console.error(`Error creando parámetro ${required.descripcion}:`, error);
          }
        }
      }
      
      if (needsReload) {
        // Recargar parámetros si se crearon nuevos
        const updatedParams = await parameterService.getAllParameters();
        setParameters(updatedParams);
      }
    } catch (error) {
      console.error('Error verificando parámetros críticos:', error);
    }
  };

  const validateForm = () => {
    if (!formData.descripcion.trim()) {
      toast.error('La descripción es requerida');
      return false;
    }

    if (!formData.valorNumero && !formData.valorTexto) {
      toast.error('Debe ingresar al menos un valor numérico o de texto');
      return false;
    }

    // Validaciones específicas
    const description = formData.descripcion.toLowerCase();
   
    if (description.includes('producto') && formData.valorNumero) {
      const validation = validateParameters.maxDailyProducts(formData.valorNumero);
      if (!validation.valid) {
        toast.error(validation.message);
        return false;
      }
    }
   
    if (description.includes('intento') && formData.valorNumero) {
      const validation = validateParameters.maxLoginAttempts(formData.valorNumero);
      if (!validation.valid) {
        toast.error(validation.message);
        return false;
      }
    }
   
    if (description.includes('iva') && formData.valorNumero) {
      const validation = validateParameters.ivaRate(formData.valorNumero);
      if (!validation.valid) {
        toast.error(validation.message);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);

      // Verificar duplicados antes de crear
      if (!editingParameter) {
        const description = formData.descripcion.toLowerCase();
        const duplicate = parameters.find(p => {
          const pDesc = p.descripcion.toLowerCase();
          return pDesc === description;
        });

        if (duplicate) {
          toast.error(`Ya existe un parámetro con esta descripción: ${duplicate.descripcion}`);
          setSubmitting(false);
          return;
        }
      }

      // Preparar datos para envío
      const submissionData = {
        ...formData,
        valorTexto: formData.valorNumero ? formData.valorNumero.toString() : formData.valorTexto,
        valorNumero: formData.valorNumero ? parseInt(formData.valorNumero) : (formData.valorTexto ? parseInt(formData.valorTexto) : 0),
        fechaInicial: formData.fechaInicial || new Date().toISOString().split('T')[0],
        fechaFinal: formData.fechaFinal || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
      };

      if (editingParameter) {
        await parameterService.updateParameter({ ...submissionData, id: editingParameter.id });
        toast.success('Parámetro actualizado exitosamente');
      } else {
        await parameterService.createParameter(submissionData);
        toast.success('Parámetro creado exitosamente');
      }
     
      handleCloseDialog();
      await loadParameters(); // Recargar después de crear/actualizar
    } catch (error) {
      console.error('Error al guardar parámetro:', error);
      toast.error('Error al guardar parámetro: ' + (error.response?.data || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const paramToDelete = parameters.find(p => p.id === id);
    
    if (!paramToDelete) {
      toast.error('Parámetro no encontrado');
      return;
    }

    // Confirmar eliminación
    const confirmMessage = `¿Estás seguro de eliminar el parámetro "${paramToDelete.descripcion}"?\n\nEsta acción no se puede deshacer.`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setDeleting(id);
      
      // Llamar al servicio de eliminación
      await parameterService.deleteParameter(id);
      
      toast.success('Parámetro eliminado exitosamente');
      
      // Recargar parámetros
      await loadParameters();
      
    } catch (error) {
      console.error('Error al eliminar parámetro:', error);
      
      // Mostrar error específico
      const errorMessage = error.response?.data || error.message || 'Error desconocido al eliminar parámetro';
      toast.error(`Error al eliminar parámetro: ${errorMessage}`);
    } finally {
      setDeleting(null);
    }
  };

  const handleEdit = (parameter) => {
    setEditingParameter(parameter);
    setFormData({
      descripcion: parameter.descripcion,
      valorTexto: parameter.valorTexto || '',
      valorNumero: parameter.valorNumero || '',
      fechaInicial: parameter.fechaInicial ? new Date(parameter.fechaInicial).toISOString().split('T')[0] : '',
      fechaFinal: parameter.fechaFinal ? new Date(parameter.fechaFinal).toISOString().split('T')[0] : '',
      estado: parameter.estado
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingParameter(null);
    setFormData({
      descripcion: '',
      valorTexto: '',
      valorNumero: '',
      fechaInicial: '',
      fechaFinal: '',
      estado: 1
    });
  };

  const getParameterIcon = (description) => {
    const desc = description.toLowerCase();
    if (desc.includes('producto')) return <ShoppingCart />;
    if (desc.includes('intento') || desc.includes('login')) return <Security />;
    if (desc.includes('iva')) return <Percent />;
    return <Settings />;
  };

  const getParameterColor = (description) => {
    const desc = description.toLowerCase();
    if (desc.includes('producto')) return 'primary';
    if (desc.includes('intento') || desc.includes('login')) return 'error';
    if (desc.includes('iva')) return 'warning';
    return 'default';
  };

  const isCriticalParameter = (description) => {
    return requiredParameters.some(req => 
      description.toLowerCase().includes(req.keyword)
    );
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Cargando parámetros del sistema...
          </Typography>
        </Box>
      </Container>
    );
  }

  // Filtrar para mostrar solo parámetros únicos
  const uniqueParameters = parameters.filter((param, index, arr) => {
    return arr.findIndex(p => 
      p.descripcion.toLowerCase() === param.descripcion.toLowerCase()
    ) === index;
  });

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Gestión de Parámetros del Sistema
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setDialogOpen(true)}
        >
          Agregar Parámetro
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          Los parámetros del sistema controlan el comportamiento de la aplicación.
          Debe haber exactamente 3 parámetros críticos: productos por día, intentos de login, e IVA.
        </Typography>
      </Alert>

      {/* Vista de tarjetas para parámetros críticos */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Parámetros Críticos del Sistema
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {uniqueParameters
          .filter(param => isCriticalParameter(param.descripcion))
          .map((parameter) => (
            <Grid item xs={12} sm={6} md={4} key={parameter.id}>
              <Card elevation={3}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ color: `${getParameterColor(parameter.descripcion)}.main`, mr: 1 }}>
                      {getParameterIcon(parameter.descripcion)}
                    </Box>
                    <Typography variant="h6" sx={{ flexGrow: 1, fontSize: '0.9rem' }}>
                      {parameter.descripcion}
                    </Typography>
                    <Chip
                      label={parameter.estado === 1 ? 'Activo' : 'Inactivo'}
                      color={parameter.estado === 1 ? 'success' : 'error'}
                      size="small"
                    />
                  </Box>
                 
                  <Typography variant="h4" color="primary" gutterBottom>
                    {parameter.valorNumero || parameter.valorTexto}
                    {parameter.descripcion.toLowerCase().includes('iva') && '%'}
                  </Typography>
                 
                  <Typography variant="body2" color="text.secondary">
                    ID: {parameter.id} | Vigencia: {parameter.fechaInicial ? new Date(parameter.fechaInicial).toLocaleDateString() : 'N/A'} - {parameter.fechaFinal ? new Date(parameter.fechaFinal).toLocaleDateString() : 'N/A'}
                  </Typography>
                </CardContent>
                <CardActions>
                  <IconButton 
                    onClick={() => handleEdit(parameter)} 
                    color="primary"
                    disabled={deleting === parameter.id}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton 
                    onClick={() => handleDelete(parameter.id)} 
                    color="error"
                    disabled={deleting === parameter.id}
                  >
                    {deleting === parameter.id ? <CircularProgress size={20} /> : <Delete />}
                  </IconButton>
                  <Chip label="Crítico" color="warning" size="small" />
                </CardActions>
              </Card>
            </Grid>
          ))}
      </Grid>

      {/* Tabla completa de parámetros */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        Todos los Parámetros ({uniqueParameters.length})
      </Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Valor Numérico</TableCell>
              <TableCell>Valor Texto</TableCell>
              <TableCell>Fecha Inicial</TableCell>
              <TableCell>Fecha Final</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {uniqueParameters.map((parameter) => (
              <TableRow key={parameter.id}>
                <TableCell>{parameter.id}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {getParameterIcon(parameter.descripcion)}
                    <Typography sx={{ ml: 1 }}>{parameter.descripcion}</Typography>
                    {isCriticalParameter(parameter.descripcion) && (
                      <Chip label="Crítico" color="warning" size="small" sx={{ ml: 1 }} />
                    )}
                  </Box>
                </TableCell>
                <TableCell>{parameter.valorNumero || '-'}</TableCell>
                <TableCell>{parameter.valorTexto || '-'}</TableCell>
                <TableCell>
                  {parameter.fechaInicial ? new Date(parameter.fechaInicial).toLocaleDateString() : '-'}
                </TableCell>
                <TableCell>
                  {parameter.fechaFinal ? new Date(parameter.fechaFinal).toLocaleDateString() : '-'}
                </TableCell>
                <TableCell>
                  <Chip
                    label={parameter.estado === 1 ? 'Activo' : 'Inactivo'}
                    color={parameter.estado === 1 ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton 
                    onClick={() => handleEdit(parameter)} 
                    color="primary"
                    disabled={deleting === parameter.id}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton 
                    onClick={() => handleDelete(parameter.id)} 
                    color="error"
                    disabled={deleting === parameter.id}
                  >
                    {deleting === parameter.id ? <CircularProgress size={20} /> : <Delete />}
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog para crear/editar parámetros */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingParameter ? 'Editar Parámetro' : 'Agregar Parámetro'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                required
                error={!formData.descripcion.trim()}
                helperText={!formData.descripcion.trim() ? "La descripción es requerida" : ""}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Valor Numérico"
                type="number"
                value={formData.valorNumero}
                onChange={(e) => setFormData({...formData, valorNumero: e.target.value})}
                helperText="Valor principal del parámetro"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Valor Texto"
                value={formData.valorTexto}
                onChange={(e) => setFormData({...formData, valorTexto: e.target.value})}
                helperText="Representación en texto"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Fecha Inicial"
                type="date"
                value={formData.fechaInicial}
                onChange={(e) => setFormData({...formData, fechaInicial: e.target.value})}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Fecha Final"
                type="date"
                value={formData.fechaFinal}
                onChange={(e) => setFormData({...formData, fechaFinal: e.target.value})}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={formData.estado}
                  onChange={(e) => setFormData({...formData, estado: e.target.value})}
                  label="Estado"
                >
                  <MenuItem value={1}>Activo</MenuItem>
                  <MenuItem value={0}>Inactivo</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} startIcon={<Cancel />}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} /> : <Save />}
          >
            {submitting ? 'Guardando...' : (editingParameter ? 'Actualizar' : 'Crear')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ParametersAdmin;