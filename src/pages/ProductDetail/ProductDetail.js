// src/pages/ProductDetail/ProductDetail.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  Card,
  CardMedia,
  Paper,
  Chip,
  Rating,
  Divider,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
  ButtonGroup,
  IconButton,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Add,
  Remove,
  ShoppingCart,
  Favorite,
  FavoriteBorder,
  Share,
  LocalShipping,
  Security,
  CheckCircle,
  Star,
  Pets,
  Info,
  ArrowBack
} from '@mui/icons-material';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { productService, categoryService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { toast } from 'react-toastify';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [category, setCategory] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const productData = await productService.getProductById(id);
      setProduct(productData);

      // Cargar información de la categoría
      if (productData.idCategoria) {
        try {
          const categoryData = await categoryService.getCategoryById(productData.idCategoria);
          setCategory(categoryData);
        } catch (error) {
          console.log('No se pudo cargar la categoría');
        }
      }
    } catch (error) {
      console.error('Error al cargar producto:', error);
      toast.error('Error al cargar el producto');
      navigate('/catalog');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= product.existencia) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (!user) {
      toast.info('Debes iniciar sesión para agregar productos al carrito');
      navigate('/login');
      return;
    }

    const success = addToCart(product, quantity);
    if (success) {
      setQuantity(1); // Reset quantity after successful add
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.descripcion,
          text: `Mira este producto en Tienda Mascotas: ${product.descripcion}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copiar URL al clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Enlace copiado al portapapeles');
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? 'Eliminado de favoritos' : 'Agregado a favoritos');
  };

  const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Cargando producto...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          Producto no encontrado
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link component={RouterLink} to="/" underline="hover">
          Inicio
        </Link>
        <Link component={RouterLink} to="/catalog" underline="hover">
          Catálogo
        </Link>
        {category && (
          <Link component={RouterLink} to="/catalog" underline="hover">
            {category.nombre}
          </Link>
        )}
        <Typography color="text.primary">{product.descripcion}</Typography>
      </Breadcrumbs>

      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        Volver
      </Button>

      <Grid container spacing={4}>
        {/* Imagen del producto */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardMedia
              component="img"
              image={product.fotoProducto || '/api/placeholder/500/500'}
              alt={product.descripcion}
              sx={{
                height: 500,
                objectFit: 'cover'
              }}
            />
          </Card>
        </Grid>

        {/* Información del producto */}
        <Grid item xs={12} md={6}>
          <Box sx={{ position: 'sticky', top: 100 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {product.descripcion}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Rating value={4.5} precision={0.5} readOnly />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                (4.5) - 128 reseñas
              </Typography>
            </Box>

            <Typography variant="h3" color="primary" fontWeight="bold" gutterBottom>
              ${Number(product.precioVentaActual).toLocaleString()}
            </Typography>

            {product.precioVentaAnterior && Number(product.precioVentaAnterior) > Number(product.precioVentaActual) && (
              <Typography 
                variant="h6" 
                sx={{ 
                  textDecoration: 'line-through', 
                  color: 'text.secondary',
                  mb: 1
                }}
              >
                Antes: ${Number(product.precioVentaAnterior).toLocaleString()}
              </Typography>
            )}

            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              <Chip
                label={`Stock: ${product.existencia}`}
                color={product.existencia > 10 ? 'success' : product.existencia > 0 ? 'warning' : 'error'}
                icon={product.existencia > 0 ? <CheckCircle /> : undefined}
              />
              {product.tieneIva === 1 && (
                <Chip label="IVA incluido" color="info" variant="outlined" />
              )}
              <Chip label={`Ref: ${product.referencia}`} variant="outlined" />
            </Box>

            {/* Selector de cantidad */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" gutterBottom>
                Cantidad:
              </Typography>
              <ButtonGroup variant="outlined" sx={{ mb: 2 }}>
                <IconButton
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  <Remove />
                </IconButton>
                <Button disabled sx={{ minWidth: 80 }}>
                  {quantity}
                </Button>
                <IconButton
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.existencia}
                >
                  <Add />
                </IconButton>
              </ButtonGroup>
              <Typography variant="body2" color="text.secondary">
                Máximo disponible: {product.existencia}
              </Typography>
            </Box>

            {/* Botones de acción */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<ShoppingCart />}
                onClick={handleAddToCart}
                disabled={product.existencia === 0}
                fullWidth
              >
                {product.existencia === 0 ? 'Sin Stock' : 'Agregar al Carrito'}
              </Button>
              <IconButton
                onClick={toggleFavorite}
                color={isFavorite ? 'error' : 'default'}
                size="large"
              >
                {isFavorite ? <Favorite /> : <FavoriteBorder />}
              </IconButton>
              <IconButton onClick={handleShare} size="large">
                <Share />
              </IconButton>
            </Box>

            {/* Información adicional */}
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <LocalShipping color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Envío gratuito"
                    secondary="Entrega en 2-3 días hábiles"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Security color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Compra segura"
                    secondary="Protegemos tus datos"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Pets color="secondary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Calidad garantizada"
                    secondary="Productos verificados para mascotas"
                  />
                </ListItem>
              </List>
            </Paper>
          </Box>
        </Grid>
      </Grid>

      {/* Tabs con información detallada */}
      <Box sx={{ mt: 6 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Descripción" />
          <Tab label="Especificaciones" />
          <Tab label="Reseñas" />
          <Tab label="Preguntas" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            Descripción del Producto
          </Typography>
          <Typography variant="body1" paragraph>
            {product.descripcion} es un producto de alta calidad diseñado especialmente 
            para el bienestar de tu mascota. Fabricado con los mejores materiales y 
            siguiendo estrictos estándares de calidad.
          </Typography>
          <Typography variant="body1" paragraph>
            Este producto ha sido cuidadosamente seleccionado por nuestro equipo de 
            expertos para garantizar que tu mascota reciba solo lo mejor. Su diseño 
            ergonómico y funcional lo convierte en la opción ideal para el cuidado diario.
          </Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Consejo de experto:</strong> Para obtener los mejores resultados, 
              sigue las instrucciones de uso incluidas con el producto.
            </Typography>
          </Alert>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Especificaciones Técnicas
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Información General
                </Typography>
                <Typography variant="body2">
                  <strong>Referencia:</strong> {product.referencia}
                </Typography>
                <Typography variant="body2">
                  <strong>Categoría:</strong> {category?.nombre || 'No especificada'}
                </Typography>
                <Typography variant="body2">
                  <strong>Estado:</strong> {product.estado === 1 ? 'Activo' : 'Inactivo'}
                </Typography>
                <Typography variant="body2">
                  <strong>IVA incluido:</strong> {product.tieneIva === 1 ? 'Sí' : 'No'}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Inventario
                </Typography>
                <Typography variant="body2">
                  <strong>Stock actual:</strong> {product.existencia} unidades
                </Typography>
                <Typography variant="body2">
                  <strong>Stock máximo:</strong> {product.stockMaximo} unidades
                </Typography>
                <Typography variant="body2">
                  <strong>Costo de compra:</strong> ${Number(product.costoCompra || 0).toLocaleString()}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Reseñas de Clientes
          </Typography>
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Rating value={4.5} precision={0.5} readOnly size="large" />
              <Typography variant="h6" sx={{ ml: 2 }}>
                4.5 de 5
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                (128 reseñas)
              </Typography>
            </Box>
            
            {/* Simulación de reseñas */}
            {[
              { name: 'María García', rating: 5, comment: 'Excelente producto, mi mascota lo adora!', date: '2024-01-15' },
              { name: 'Carlos López', rating: 4, comment: 'Buena calidad, entrega rápida.', date: '2024-01-10' },
              { name: 'Ana Rodríguez', rating: 5, comment: 'Perfecto para mi perro, muy recomendado.', date: '2024-01-05' }
            ].map((review, index) => (
              <Paper key={index} sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2">{review.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(review.date).toLocaleDateString()}
                  </Typography>
                </Box>
                <Rating value={review.rating} readOnly size="small" sx={{ mb: 1 }} />
                <Typography variant="body2">{review.comment}</Typography>
              </Paper>
            ))}
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            Preguntas Frecuentes
          </Typography>
          <Box>
            {[
              {
                question: '¿Cómo debo usar este producto?',
                answer: 'Sigue las instrucciones incluidas en el empaque. Si tienes dudas, consulta con tu veterinario.'
              },
              {
                question: '¿Es seguro para todas las edades?',
                answer: 'Este producto es seguro para mascotas adultas. Para cachorros, consulta con un especialista.'
              },
              {
                question: '¿Cuál es la política de devoluciones?',
                answer: 'Ofrecemos devoluciones dentro de los primeros 30 días si el producto no cumple tus expectativas.'
              }
            ].map((faq, index) => (
              <Paper key={index} sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  <Info sx={{ fontSize: 16, mr: 1, verticalAlign: 'text-bottom' }} />
                  {faq.question}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {faq.answer}
                </Typography>
              </Paper>
            ))}
          </Box>
        </TabPanel>
      </Box>
    </Container>
  );
};

export default ProductDetail;