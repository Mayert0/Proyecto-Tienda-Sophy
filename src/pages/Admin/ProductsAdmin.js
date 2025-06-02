// src/pages/Admin/ProductsAdmin.js 
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
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search
} from '@mui/icons-material';
import { productService, categoryService } from '../../services/api';
import { toast } from 'react-toastify';

const ProductsAdmin = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    descripcion: '',
    costoCompra: '',
    precioVentaActual: '',
    existencia: '',
    stockMaximo: '',
    idCategoria: '',
    tieneIva: 1,
    estado: 1,
    fotoProducto: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        productService.getAllProducts(),
        categoryService.getAllCategories()
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
  try {
    if (formData.fotoProducto && formData.fotoProducto.length > 100) {
      toast.error('La URL de la imagen es demasiado larga. Máximo 100 caracteres.');
      return;
    }

    if (formData.fotoProducto && formData.fotoProducto.trim() !== '') {
      try {
        new URL(formData.fotoProducto);
      } catch (e) {
        toast.error('Por favor ingresa una URL válida para la imagen');
        return;
      }
    }

    if (editingProduct) {
      await productService.updateProduct({ ...formData, id: editingProduct.id });
      toast.success('Producto actualizado exitosamente');
    } else {
      await productService.createProduct(formData);
      toast.success('Producto creado exitosamente');
    }
    handleCloseDialog();
    loadData();
  } catch (error) {
    console.error('Error al guardar producto:', error);
    toast.error('Error al guardar producto');
  }
};

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        await productService.deleteProduct(id);
        toast.success('Producto eliminado exitosamente');
        loadData();
      } catch (error) {
        console.error('Error al eliminar producto:', error);
        toast.error('Error al eliminar producto');
      }
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      descripcion: product.descripcion,
      costoCompra: product.costoCompra,
      precioVentaActual: product.precioVentaActual,
      existencia: product.existencia,
      stockMaximo: product.stockMaximo,
      idCategoria: product.idCategoria,
      tieneIva: product.tieneIva,
      estado: product.estado,
      fotoProducto: product.fotoProducto || ''
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingProduct(null);
    setFormData({
      descripcion: '',
      costoCompra: '',
      precioVentaActual: '',
      existencia: '',
      stockMaximo: '',
      idCategoria: '',
      tieneIva: 1,
      estado: 1,
      fotoProducto: ''
    });
  };

  const filteredProducts = products.filter(product =>
    product.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Container>
        <Typography>Cargando productos...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Gestión de Productos
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setDialogOpen(true)}
        >
          Agregar Producto
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Buscar productos..."
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
              <TableCell>Imagen</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Precio</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Categoría</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <Box
                    component="img"
                    src={product.fotoProducto || '/api/placeholder/50/50'}
                    alt={product.descripcion}
                    sx={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 1 }}
                  />
                </TableCell>
                <TableCell>{product.descripcion}</TableCell>
                <TableCell>${Number(product.precioVentaActual).toLocaleString()}</TableCell>
                <TableCell>
                  <Chip
                    label={product.existencia}
                    color={product.existencia > 10 ? 'success' : product.existencia > 0 ? 'warning' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {categories.find(c => c.id === product.idCategoria)?.nombre || 'N/A'}
                </TableCell>
                <TableCell>
                  <Chip
                    label={product.estado === 1 ? 'Activo' : 'Inactivo'}
                    color={product.estado === 1 ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(product)} color="primary">
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(product.id)} color="error">
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingProduct ? 'Editar Producto' : 'Agregar Producto'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Costo de Compra"
                type="number"
                value={formData.costoCompra}
                onChange={(e) => setFormData({...formData, costoCompra: e.target.value})}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Precio de Venta"
                type="number"
                value={formData.precioVentaActual}
                onChange={(e) => setFormData({...formData, precioVentaActual: e.target.value})}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Stock Actual"
                type="number"
                value={formData.existencia}
                onChange={(e) => setFormData({...formData, existencia: e.target.value})}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Stock Máximo"
                type="number"
                value={formData.stockMaximo}
                onChange={(e) => setFormData({...formData, stockMaximo: e.target.value})}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Categoría</InputLabel>
                <Select
                  value={formData.idCategoria}
                  onChange={(e) => setFormData({...formData, idCategoria: e.target.value})}
                  label="Categoría"
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Tiene IVA</InputLabel>
                <Select
                  value={formData.tieneIva}
                  onChange={(e) => setFormData({...formData, tieneIva: e.target.value})}
                  label="Tiene IVA"
                >
                  <MenuItem value={1}>Sí</MenuItem>
                  <MenuItem value={0}>No</MenuItem>
                </Select>
              </FormControl>
            </Grid>
           <Grid item xs={12}>
  <TextField
    fullWidth
    label="URL de la Imagen"
    value={formData.fotoProducto}
    onChange={(e) => {
      const value = e.target.value;
      if (value.length <= 100) { 
        setFormData({...formData, fotoProducto: value});
      }
    }}
    helperText={`${formData.fotoProducto?.length || 0}/100 caracteres. Usa URLs cortas como bit.ly`}
    error={formData.fotoProducto?.length > 100}
  />
</Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingProduct ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProductsAdmin;