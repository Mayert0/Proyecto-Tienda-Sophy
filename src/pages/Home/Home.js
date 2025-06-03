// src/pages/Home/Home.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Box,
  Paper,
  Chip,
  Rating
} from '@mui/material';
import {
  Pets,
  LocalShipping,
  Security,
  Support,
  Star
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { productService, parameterService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { toast } from 'react-toastify';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [maxDailyProducts, setMaxDailyProducts] = useState(3);
  
  const { user } = useAuth();
  const { addToCart, getTodayItemsCount } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    loadFeaturedProducts();
    loadMaxDailyProducts();
  }, []);

  const loadMaxDailyProducts = async () => {
    try {
      const limit = await parameterService.getMaxDailyProducts();
      setMaxDailyProducts(limit);
    } catch (error) {
      console.error('Error cargando límite de productos:', error);
      setMaxDailyProducts(3);
    }
  };

  const loadFeaturedProducts = async () => {
    try {
      const products = await productService.getAvailableProducts();
            // Mostrar solo los primeros 6 productos como destacados
      setFeaturedProducts(products.slice(0, 6));
    } catch (error) {
      console.error('Error al cargar productos destacados:', error);
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    if (!user) {
      toast.info('Debes iniciar sesión para agregar productos al carrito');
      navigate('/login');
      return;
    }

    const todayCount = getTodayItemsCount();
    if (todayCount >= maxDailyProducts) {
      toast.error(`Solo puedes agregar ${maxDailyProducts} productos por día`);
      return;
    }

    addToCart(product);
  };

  const features = [
    {
      icon: <LocalShipping sx={{ fontSize: 40 }} />,
      title: 'Envío Gratis',
      description: 'Envío gratuito en compras superiores a $100.000'
    },
    {
      icon: <Security sx={{ fontSize: 40 }} />,
      title: 'Compra Segura',
      description: 'Tus datos están protegidos con la mejor tecnología'
    },
    {
      icon: <Support sx={{ fontSize: 40 }} />,
      title: 'Soporte 24/7',
      description: 'Estamos aquí para ayudarte cuando lo necesites'
    },
    {
      icon: <Pets sx={{ fontSize: 40 }} />,
      title: 'Productos de Calidad',
      description: 'Solo los mejores productos para tu mascota'
    }
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #2E7D32 0%, #66BB6A 100%)',
          color: 'white',
          py: 8,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
            Todo para tu Mascota
          </Typography>
          <Typography variant="h5" paragraph>
            Encuentra los mejores productos para el cuidado y bienestar de tu compañero fiel
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            component={Link}
            to="/catalog"
            sx={{ mt: 2, py: 1.5, px: 4 }}
          >
            Ver Catálogo
          </Button>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" component="h2" textAlign="center" gutterBottom>
          ¿Por qué elegirnos?
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <Box sx={{ color: 'primary.main', mb: 2 }}>
                  {feature.icon}
                </Box>
                <Typography variant="h6" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Featured Products */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" textAlign="center" gutterBottom>
            Productos Destacados
          </Typography>
          <Typography variant="body1" textAlign="center" color="text.secondary" paragraph>
            Los productos más populares para tu mascota
          </Typography>

          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <Typography>Cargando productos...</Typography>
            </Box>
          ) : (
            <Grid container spacing={3} sx={{ mt: 2 }}>
              {featuredProducts.map((product) => (
                <Grid item xs={12} sm={6} md={4} key={product.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4
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
                      <Typography gutterBottom variant="h6" component="h3">
                        {product.descripcion}
                      </Typography>
                     
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Rating value={4.5} precision={0.5} size="small" readOnly />
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                          (4.5)
                        </Typography>
                      </Box>

                      <Typography variant="h6" color="primary" fontWeight="bold">
                        ${Number(product.precioVentaActual).toLocaleString()}
                      </Typography>

                      <Box sx={{ mt: 1 }}>
                        <Chip
                          label={`Stock: ${product.existencia}`}
                          size="small"
                          color={product.existencia > 10 ? 'success' : 'warning'}
                          variant="outlined"
                        />
                      </Box>
                    </CardContent>
                   
                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button
                        size="small"
                        component={Link}
                        to={`/product/${product.id}`}
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
                </Grid>
              ))}
            </Grid>
          )}

          <Box textAlign="center" sx={{ mt: 4 }}>
            <Button
              variant="outlined"
              size="large"
              component={Link}
              to="/catalog"
            >
              Ver Todos los Productos
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Categories Preview */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" component="h2" textAlign="center" gutterBottom>
          Categorías Populares
        </Typography>
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {[
            { name: 'Alimentos', image: '/api/placeholder/300/200', description: 'Comida premium para todas las edades' },
            { name: 'Juguetes', image: '/api/placeholder/300/200', description: 'Diversión garantizada para tu mascota' },
            { name: 'Accesorios', image: '/api/placeholder/300/200', description: 'Todo lo que necesitas para el cuidado' },
            { name: 'Higiene', image: '/api/placeholder/300/200', description: 'Productos para mantener limpia a tu mascota' }
          ].map((category, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                component={Link}
                to="/catalog"
                sx={{
                  textDecoration: 'none',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: 6
                  }
                }}
              >
                <CardMedia
                  component="img"
                  height="150"
                  image={category.image}
                  alt={category.name}
                />
                <CardContent>
                  <Typography gutterBottom variant="h6" component="h3" textAlign="center">
                    {category.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    {category.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Home;