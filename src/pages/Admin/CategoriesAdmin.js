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
  MenuItem
} from '@mui/material';
import {
  Add,
  Edit,
  Delete
} from '@mui/icons-material';
import { categoryService } from '../../services/api';
import { toast } from 'react-toastify';

const CategoriesAdmin = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
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

  const handleSubmit = async () => {
    try {
      if (editingCategory) {
        await categoryService.updateCategory({ ...formData, id: editingCategory.id });
        toast.success('Categoría actualizada exitosamente');
      } else {
        await categoryService.createCategory(formData);
        toast.success('Categoría creada exitosamente');
      }
      handleCloseDialog();
      loadCategories();
    } catch (error) {
      console.error('Error al guardar categoría:', error);
      toast.error('Error al guardar categoría');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta categoría?')) {
      try {
        await categoryService.deleteCategory(id);
        toast.success('Categoría eliminada exitosamente');
        loadCategories();
      } catch (error) {
        console.error('Error al eliminar categoría:', error);
        toast.error('Error al eliminar categoría');
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

      <Grid container spacing={3}>
        {categories.map((category) => (
          <Grid item xs={12} sm={6} md={4} key={category.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {category.nombre}
                </Typography>
                <Chip
                  label={category.estado === 1 ? 'Activa' : 'Inactiva'}
                  color={category.estado === 1 ? 'success' : 'error'}
                  size="small"
                />
              </CardContent>
              <CardActions>
                <IconButton onClick={() => handleEdit(category)} color="primary">
                  <Edit />
                </IconButton>
                <IconButton onClick={() => handleDelete(category.id)} color="error">
                  <Delete />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCategory ? 'Editar Categoría' : 'Agregar Categoría'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Nombre de la Categoría"
            value={formData.nombre}
            onChange={(e) => setFormData({...formData, nombre: e.target.value})}
            sx={{ mt: 2, mb: 2 }}
          />
          <FormControl fullWidth>
            <InputLabel>Estado</InputLabel>
            <Select
              value={formData.estado}
              onChange={(e) => setFormData({...formData, estado: e.target.value})}
              label="Estado"
            >
              <MenuItem value={1}>Activa</MenuItem>
              <MenuItem value={0}>Inactiva</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingCategory ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CategoriesAdmin;