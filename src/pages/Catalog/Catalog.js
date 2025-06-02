// src/pages/Catalog/Catalog.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Typography,
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Pagination,
  Rating,
  InputAdornment,
  Paper,
  Skeleton
} from '@mui/material';
import {
  Search,
  FilterList,
  GridView,
  ViewList
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { productService, categoryService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { toast } from 'react-toastify';

const Catalog = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12);

  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, selectedCategory, sortBy, priceRange]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        productService.getAvailableProducts(),
        categoryService.getAllCategories()
      ]);
      
      setProducts(productsData);
      setCategories(categoriesData.filter(cat => cat.estado === 1));
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar el catálogo');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por categoría
    if (selectedCategory) {
      filtered = filtered.filter(product => product.idCategoria === parseInt(selectedCategory));
    }

    // Filtro por rango de precios
    if (priceRange.min) {
      filtered = filtered.filter(product => 
        Number(product.precioVentaActual) >= Number(priceRange.min)
      );
    }
    if (priceRange.max) {
      filtered = filtered.filter(product => 
        Number(product.precioVentaActual) <= Number(priceRange.max)
      );
    }

    // Ordenamiento
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.descripcion.localeCompare(b.descripcion);
        case 'price-low':
          return Number(a.precioVentaActual) - Number(b.precioVentaActual);
        case 'price-high':
          return Number(b.precioVentaActual) - Number(a.precioVentaActual);
        case 'stock':
          return b.existencia - a.existencia;
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
    setCurrentPage(1);
  };

  const handleAddToCart = (product) => {
    if (!user) {
      toast.info('Debes iniciar sesión para agregar productos al carrito');
      navigate('/login');
      return;
    }
    addToCart(product);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setPriceRange({ min: '', max: '' });
    setSortBy('name');
  };

  // Paginación
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const ProductCard = ({ product }) => (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6
        }
      }}
    >
      <CardMedia
        component="img"
        height="200"
        image={product.fotoProducto || '/api/placeholder/300/200'}
        alt={product.descripcion}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="h3" noWrap>
          {product.descripcion}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Rating value={4} size="small" readOnly />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            (4.0)
          </Typography>
        </Box>

        <Typography variant="h6" color="primary" fontWeight="bold" gutterBottom>
          ${Number(product.precioVentaActual).toLocaleString()}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label={`Stock: ${product.existencia}`}
            size="small"
            color={product.existencia > 10 ? 'success' : product.existencia > 0 ? 'warning' : 'error'}
            variant="outlined"
          />
          {product.tieneIva === 1 && (
            <Chip label="IVA incluido" size="small" color="info" variant="outlined" />
          )}
        </Box>
      </CardContent>
      
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          size="small"
          component={Link}
          to={`/product/${product.id}`}
          sx={{ mr: 1 }}
        >
          Ver Detalles
        </Button>
        <Button
          size="small"
          variant="contained"
          onClick={() => handleAddToCart(product)}
          disabled={product.existencia === 0}
        >
          {product.existencia === 0 ? 'Sin Stock' : 'Agregar'}
        </Button>
      </CardActions>
    </Card>
  );

  const ProductListItem = ({ product }) => (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={3} md={2}>
          <Box
            component="img"
            src={product.fotoProducto || '/api/placeholder/150/150'}
            alt={product.descripcion}
            sx={{
              width: '100%',
              height: 120,
              objectFit: 'cover',
              borderRadius: 1
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={7}>
          <Typography variant="h6" gutterBottom>
            {product.descripcion}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Rating value={4} size="small" readOnly />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              (4.0)
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <Chip
              label={`Stock: ${product.existencia}`}
              size="small"
              color={product.existencia > 10 ? 'success' : product.existencia > 0 ? 'warning' : 'error'}
              variant="outlined"
            />
            {product.tieneIva === 1 && (
              <Chip label="IVA incluido" size="small" color="info" variant="outlined" />
            )}
          </Box>
        </Grid>
        <Grid item xs={12} sm={3} md={3}>
          <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
            <Typography variant="h6" color="primary" fontWeight="bold" gutterBottom>
              ${Number(product.precioVentaActual).toLocaleString()}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
              <Button
                size="small"
                component={Link}
                to={`/product/${product.id}`}
              >
                Ver
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={() => handleAddToCart(product)}
                disabled={product.existencia === 0}
              >
                {product.existencia === 0 ? 'Sin Stock' : 'Agregar'}
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          {[...Array(8)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Card>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" height={30} />
                  <Skeleton variant="text" height={20} />
                  <Skeleton variant="text" height={20} width="60%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Catálogo de Productos
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Encuentra todo lo que necesitas para tu mascota
        </Typography>
      </Box>

      {/* Filtros */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Categoría</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                label="Categoría"
              >
                <MenuItem value="">Todas</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Ordenar por</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Ordenar por"
              >
                <MenuItem value="name">Nombre</MenuItem>
                <MenuItem value="price-low">Precio: Menor a Mayor</MenuItem>
                <MenuItem value="price-high">Precio: Mayor a Menor</MenuItem>
                <MenuItem value="stock">Stock Disponible</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6} md={1}>
            <TextField
              fullWidth
              placeholder="Min"
              type="number"
              value={priceRange.min}
              onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
              size="small"
            />
          </Grid>

          <Grid item xs={6} md={1}>
            <TextField
              fullWidth
              placeholder="Max"
              type="number"
              value={priceRange.max}
              onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
              size="small"
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={clearFilters}
                startIcon={<FilterList />}
              >
                Limpiar
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('grid')}
                sx={{ minWidth: 'auto', px: 1 }}
              >
                <GridView />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('list')}
                sx={{ minWidth: 'auto', px: 1 }}
              >
                <ViewList />
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Resultados */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Mostrando {filteredProducts.length} producto(s)
        </Typography>
      </Box>

      {/* Lista/Grid de productos */}
      {viewMode === 'grid' ? (
        <Grid container spacing={3}>
          {currentProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
              <ProductCard product={product} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box>
          {currentProducts.map((product) => (
            <ProductListItem key={product.id} product={product} />
          ))}
        </Box>
      )}

      {filteredProducts.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" gutterBottom>
            No se encontraron productos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Intenta ajustar los filtros de búsqueda
          </Typography>
        </Box>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            size="large"
          />
        </Box>
      )}
    </Container>
  );
};

export default Catalog;