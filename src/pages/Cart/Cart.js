// src/pages/Cart/Cart.js
import React from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  IconButton,
  Divider,
  Paper,
  Alert,
  Chip,
  ButtonGroup
} from '@mui/material';
import {
  Add,
  Remove,
  Delete,
  ShoppingCart,
  ArrowForward,
  ShoppingBag
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

const Cart = () => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    getSubtotal,
    getTaxAmount,
    getFinalTotal,
    getTodayItemsCount
  } = useCart();
  
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleQuantityChange = (cartItemId, change) => {
    const item = cartItems.find(item => item.cartItemId === cartItemId);
    if (item) {
      const newQuantity = item.quantity + change;
      updateQuantity(cartItemId, newQuantity);
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      return;
    }
    navigate('/checkout');
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <ShoppingCart sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Inicia sesión para ver tu carrito
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Necesitas iniciar sesión para acceder a tu carrito de compras
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to="/login"
            size="large"
          >
            Iniciar Sesión
          </Button>
        </Paper>
      </Container>
    );
  }

  if (cartItems.length === 0) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <ShoppingBag sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Tu carrito está vacío
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            ¡Explora nuestro catálogo y encuentra productos increíbles para tu mascota!
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to="/catalog"
            size="large"
            startIcon={<ShoppingCart />}
          >
            Ir al Catálogo
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Mi Carrito
      </Typography>

      {/* Alerta sobre límite diario */}
      <Alert 
        severity="info" 
        sx={{ mb: 3 }}
        icon={<ShoppingCart />}
      >
        <Typography variant="body2">
          <strong>Límite diario:</strong> Tienes {getTodayItemsCount()} de 3 productos permitidos por día.
          {getTodayItemsCount() >= 3 && ' Has alcanzado el límite diario.'}
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {/* Items del carrito */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Productos ({cartItems.length})
              </Typography>
              <Button
                color="error"
                startIcon={<Delete />}
                onClick={clearCart}
                size="small"
              >
                Vaciar Carrito
              </Button>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {cartItems.map((item) => (
              <Card key={item.cartItemId} sx={{ mb: 2 }}>
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    {/* Imagen del producto */}
                    <Grid item xs={12} sm={3}>
                      <Box
                        component="img"
                        src={item.fotoProducto || '/api/placeholder/120/120'}
                        alt={item.descripcion}
                        sx={{
                          width: '100%',
                          height: 120,
                          objectFit: 'cover',
                          borderRadius: 1
                        }}
                      />
                    </Grid>

                    {/* Información del producto */}
                    <Grid item xs={12} sm={6}>
                      <Typography variant="h6" gutterBottom>
                        {item.descripcion}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Precio unitario: ${Number(item.precioVentaActual).toLocaleString()}
                      </Typography>

                      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <Chip
                          label={`Stock: ${item.existencia}`}
                          size="small"
                          color={item.existencia > 10 ? 'success' : 'warning'}
                          variant="outlined"
                        />
                        {item.tieneIva === 1 && (
                          <Chip 
                            label="IVA incluido" 
                            size="small" 
                            color="info" 
                            variant="outlined" 
                          />
                        )}
                      </Box>

                      <Typography variant="body2" color="text.secondary">
                        Agregado: {new Date(item.addedDate).toLocaleDateString()}
                      </Typography>
                    </Grid>

                    {/* Controles de cantidad y precio */}
                    <Grid item xs={12} sm={3}>
                      <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                        {/* Control de cantidad */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-start', sm: 'flex-end' }, mb: 2 }}>
                          <ButtonGroup size="small" variant="outlined">
                            <IconButton
                              onClick={() => handleQuantityChange(item.cartItemId, -1)}
                              disabled={item.quantity <= 1}
                            >
                              <Remove />
                            </IconButton>
                            <Button disabled sx={{ minWidth: 60 }}>
                              {item.quantity}
                            </Button>
                            <IconButton
                              onClick={() => handleQuantityChange(item.cartItemId, 1)}
                              disabled={item.quantity >= item.existencia}
                            >
                              <Add />
                            </IconButton>
                          </ButtonGroup>
                        </Box>

                        {/* Precio total del item */}
                        <Typography variant="h6" color="primary" fontWeight="bold" gutterBottom>
                          ${(Number(item.precioVentaActual) * item.quantity).toLocaleString()}
                        </Typography>

                        {/* Botón eliminar */}
                        <Button
                          color="error"
                          startIcon={<Delete />}
                          onClick={() => removeFromCart(item.cartItemId)}
                          size="small"
                        >
                          Eliminar
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </Paper>
        </Grid>

        {/* Resumen del pedido */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, position: 'sticky', top: 100 }}>
            <Typography variant="h6" gutterBottom>
              Resumen del Pedido
            </Typography>
            
            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">
                  Subtotal:
                </Typography>
                <Typography variant="body2">
                  ${getSubtotal().toLocaleString()}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">
                  IVA (19%):
                </Typography>
                <Typography variant="body2">
                  ${getTaxAmount().toLocaleString()}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">
                  Envío:
                </Typography>
                <Typography variant="body2" color="success.main">
                  Gratis
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold">
                Total:
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="primary">
                ${getFinalTotal().toLocaleString()}
              </Typography>
            </Box>

            <Button
              variant="contained"
              fullWidth
              size="large"
              endIcon={<ArrowForward />}
              onClick={handleCheckout}
              sx={{ mb: 2 }}
            >
              Proceder al Checkout
            </Button>

            <Button
              variant="outlined"
              fullWidth
              component={Link}
              to="/catalog"
            >
              Continuar Comprando
            </Button>

            {/* Información adicional */}
            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>💡 Información importante:</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Máximo 3 productos por día por cliente
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Envío gratuito en todas las compras
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Métodos de pago: Tarjeta de crédito y PSE
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Cart;