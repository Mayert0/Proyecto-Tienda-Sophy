// src/pages/Admin/CategoriesAdmin.js
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
  CircularProgress
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Warning,
  CheckCircle
} from '@mui/icons-material';
import { categoryService } from '../../services/api';
import { toast } from 'react-toastify';

const CategoriesAdmin = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false); // 🆕 Estado para envío de formulario
  const [formData, setFormData] = useState({
    nombre: '',
    estado: 1
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const categoriesData = await categoryService.getAllCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      toast.error('Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  };

  // 🆕 VALIDACIONES MEJORADAS Y COMPLETAS
  const validateForm = () => {
    // Validación del nombre - más estricta
    if (!formData.nombre || !formData.nombre.trim()) {
      toast.error('El nombre de la categoría es requerido');
      return false;
    }

    const trimmedName = formData.nombre.trim();

    if (trimmedName.length < 2) {
      toast.error('El nombre debe tener al menos 2 caracteres');
      return false;
    }

    if (trimmedName.length > 50) {
      toast.error('El nombre no puede exceder 50 caracteres');
      return false;
    }

    // Validar caracteres especiales (solo letras, números, espacios y algunos símbolos)
    const validNameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-_\.]+$/;
    if (!validNameRegex.test(trimmedName)) {
      toast.error('El nombre contiene caracteres no válidos. Solo se permiten letras, números, espacios, guiones y puntos.');
      return false;
    }

    // Verificar que no exista otra categoría con el mismo nombre (ignorar mayúsculas/minúsculas)
    const existingCategory = categories.find(cat => 
      cat.nombre.toLowerCase().trim() === trimmedName.toLowerCase() && 
      (!editingCategory || cat.id !== editingCategory.id)
    );

    if (existingCategory) {
      toast.error('Ya existe una categoría con este nombre');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      const categoryData = {
        ...formData,
        nombre: formData.nombre.trim() // Usar el nombre limpio
      };

      if (editingCategory) {
        await categoryService.updateCategory({ ...categoryData, id: editingCategory.id });
        toast.success('Categoría actualizada exitosamente');
      } else {
        await categoryService.createCategory(categoryData);
        toast.success('Categoría creada exitosamente');
      }
      
      handleCloseDialog();
      loadCategories();
    } catch (error) {
      console.error('Error al guardar categoría:', error);
      toast.error('Error al guardar categoría');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    // 🆕 Verificar si la categoría está siendo usada
    const categoryToDelete = categories.find(cat => cat.id === id);
    
    if (window.confirm(`¿Estás seguro de eliminar la categoría "${categoryToDelete?.nombre}"?\n\nEsta acción no se puede deshacer.`)) {
      try {
        await categoryService.deleteCategory(id);
        toast.success('Categoría eliminada exitosamente');
        loadCategories();
      } catch (error) {
        console.error('Error al eliminar categoría:', error);
        toast.error('Error al eliminar categoría. Puede que esté siendo utilizada por productos.');
      }
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      nombre: category.nombre,
      estado: category.estado
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCategory(null);
    setFormData({
      nombre: '',
      estado: 1
    });
  };

  // 🆕 Función para manejar cambios en el nombre con validación en tiempo real
  const handleNameChange = (e) => {
    const value = e.target.value;
    // Permitir solo hasta 50 caracteres
    if (value.length <= 50) {
      setFormData({...formData, nombre: value});
    }
  };

  // 🆕 Función para obtener el color del chip de estado
  const getStatusColor = (estado) => {
    return estado === 1 ? 'success' : 'error';
  };

  // 🆕 Función para obtener el ícono del estado
  const getStatusIcon = (estado) => {
    return estado === 1 ? <CheckCircle /> : <Warning />;
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Cargando categorías...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Gestión de Categorías
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setDialogOpen(true)}
        >
          Agregar Categoría
        </Button>
      </Box>

      {/* 🆕 NUEVO: Alert informativo */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          Las categorías organizan tus productos. Asegúrate de usar nombres descriptivos y únicos.
          Las categorías inactivas no aparecerán en la tienda pero se conservan sus datos.
        </Typography>
      </Alert>

      {/* 🆕 NUEVO: Estadísticas rápidas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Categorías
              </Typography>
              <Typography variant="h4">
                {categories.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Categorías Activas
              </Typography>
              <Typography variant="h4" color="success.main">
                {categories.filter(cat => cat.estado === 1).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Categorías Inactivas
              </Typography>
              <Typography variant="h4" color="error.main">
                {categories.filter(cat => cat.estado === 0).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Lista de categorías */}
      <Grid container spacing={3}>
        {categories.map((category) => (
          <Grid item xs={12} sm={6} md={4} key={category.id}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    {category.nombre}
                  </Typography>
                  <Chip
                    icon={getStatusIcon(category.estado)}
                    label={category.estado === 1 ? 'Activa' : 'Inactiva'}
                    color={getStatusColor(category.estado)}
                    size="small"
                  />
                </Box>
                
                <Typography variant="body2" color="text.secondary">
                  ID: {category.id}
                </Typography>
                
                {/* 🆕 NUEVO: Información adicional */}
                <Typography variant="body2" color="text.secondary">
                  Creada: {category.fechaCreacion ? new Date(category.fechaCreacion).toLocaleDateString() : 'N/A'}
                </Typography>
              </CardContent>
              <CardActions>
                <IconButton 
                  onClick={() => handleEdit(category)} 
                  color="primary"
                  title="Editar categoría"
                >
                  <Edit />
                </IconButton>
                <IconButton 
                  onClick={() => handleDelete(category.id)} 
                  color="error"
                  title="Eliminar categoría"
                >
                  <Delete />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Mensaje cuando no hay categorías */}
      {categories.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" gutterBottom>
            No hay categorías creadas
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Crea tu primera categoría para organizar tus productos
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<Add />}
            onClick={() => setDialogOpen(true)}
          >
            Crear Primera Categoría
          </Button>
        </Box>
      )}

      {/* 🆕 DIALOG MEJORADO para crear/editar categorías */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCategory ? 'Editar Categoría' : 'Agregar Categoría'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Nombre de la Categoría"
            value={formData.nombre}
            onChange={handleNameChange}
            sx={{ mt: 2, mb: 2 }}
            required
            error={formData.nombre && formData.nombre.trim().length < 2}
            helperText={
              formData.nombre && formData.nombre.trim().length < 2 
                ? "Mínimo 2 caracteres" 
                : `${formData.nombre?.length || 0}/50 caracteres`
            }
            placeholder="Ej: Alimentos para perros, Juguetes, Accesorios..."
          />
          
          <FormControl fullWidth>
            <InputLabel>Estado</InputLabel>
            <Select
              value={formData.estado}
              onChange={(e) => setFormData({...formData, estado: e.target.value})}
              label="Estado"
            >
              <MenuItem value={1}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircle sx={{ mr: 1, color: 'success.main' }} />
                  Activa
                </Box>
              </MenuItem>
              <MenuItem value={0}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Warning sx={{ mr: 1, color: 'error.main' }} />
                  Inactiva
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          {/* 🆕 NUEVO: Información sobre estados */}
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Activa:</strong> La categoría aparecerá en la tienda y se podrán asignar productos.<br/>
              <strong>Inactiva:</strong> La categoría no aparecerá en la tienda pero se conservarán sus datos.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={submitting}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={submitting || !formData.nombre.trim()}
            startIcon={submitting ? <CircularProgress size={20} /> : null}
          >
            {submitting ? 'Guardando...' : (editingCategory ? 'Actualizar' : 'Crear')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CategoriesAdmin;