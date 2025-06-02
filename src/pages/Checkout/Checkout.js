// src/pages/Checkout/Checkout.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Divider,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip
} from '@mui/material';
import {
  CreditCard,
  AccountBalance,
  CheckCircle,
  ShoppingCart,
  Payment,
  LocalShipping
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { orderService, clientService } from '../../services/api';
import { toast } from 'react-toastify';

const Checkout = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('tarjeta');
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    pseBank: '',
    pseDocument: ''
  });
  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { cartItems, clearCart, getFinalTotal, getTaxAmount, getSubtotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const steps = ['Revisión', 'Método de Pago', 'Confirmación'];

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) {
      navigate('/cart');
      return;
    }

    loadClientData();
  }, [user, cartItems.length, navigate]);

  const loadClientData = async () => {
    try {
      // Buscar el cliente por correo electrónico
      const clients = await clientService.getAllClients();
      const client = clients.find(c => c.correoCliente === user.correoUsuario);
      setClientData(client);
    } catch (error) {
      console.error('Error al cargar datos del cliente:', error);
    }
  };

  const handleNext = () => {
    if (activeStep === 1 && !validatePaymentDetails()) {
      return;
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validatePaymentDetails = () => {
    if (paymentMethod === 'tarjeta') {
      if (!paymentDetails.cardNumber || !paymentDetails.cardName || 
          !paymentDetails.expiryDate || !paymentDetails.cvv) {
        setError('Por favor completa todos los campos de la tarjeta');
        return false;
      }
      
      // Validación básica de tarjeta
      if (paymentDetails.cardNumber.replace(/\s/g, '').length < 16) {
        setError('Número de tarjeta inválido');
        return false;
      }
      
      if (paymentDetails.cvv.length < 3) {
        setError('CVV inválido');
        return false;
      }
    } else if (paymentMethod === 'pse') {
      if (!paymentDetails.pseBank || !paymentDetails.pseDocument) {
        setError('Por favor completa todos los campos de PSE');
        return false;
      }
    }
    
    setError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validatePaymentDetails()) return;

    setLoading(true);
    setError('');

    try {
      // Preparar datos del pedido
      const orderData = {
        clienteId: clientData?.id || user.id,
        productos: cartItems.map(item => ({
          id: item.id,
          cantidad: item.quantity,
          precio: item.precioVentaActual
        })),
        metodoPago: paymentMethod === 'tarjeta' ? 'Tarjeta de Crédito' : 'PSE'
      };

      // Crear el pedido
      await orderService.createOrder(orderData);

      // Limpiar carrito
      clearCart();

      // Avanzar al paso de confirmación
      setActiveStep(2);

      toast.success('¡Pedido realizado exitosamente!');

      // Redirigir después de 3 segundos
      setTimeout(() => {
        navigate('/orders');
      }, 3000);

    } catch (error) {
      console.error('Error al procesar el pedido:', error);
      setError(error.response?.data || 'Error al procesar el pedido. Intenta nuevamente.');
      toast.error('Error al procesar el pedido');
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            {/* Resumen de productos */}
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Productos en tu pedido
                  </Typography>
                  <List>
                    {cartItems.map((item, index) => (
                      <React.Fragment key={item.cartItemId}>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar
                              src={item.fotoProducto || '/api/placeholder/50/50'}
                              variant="rounded"
                              sx={{ width: 60, height: 60 }}
                            />
                          </ListItemAvatar>
                          <ListItemText
                            primary={item.descripcion}
                            secondary={
                              <Box>
                                <Typography variant="body2">
                                  Cantidad: {item.quantity} × ${Number(item.precioVentaActual).toLocaleString()}
                                </Typography>
                                <Box sx={{ mt: 1 }}>
                                  {item.tieneIva === 1 && (
                                    <Chip label="IVA incluido" size="small" color="info" />
                                  )}
                                </Box>
                              </Box>
                            }
                          />
                          <Typography variant="h6" color="primary">
                            ${(Number(item.precioVentaActual) * item.quantity).toLocaleString()}
                          </Typography>
                        </ListItem>
                        {index < cartItems.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Información de envío */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Información de Envío
                  </Typography>
                  {clientData ? (
                    <Box>
                      <Typography variant="body2" gutterBottom>
                        <strong>Nombre:</strong> {clientData.nombreCliente}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Dirección:</strong> {clientData.direccionCliente}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Teléfono:</strong> {clientData.telefono}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Email:</strong> {clientData.correoCliente}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Cargando información...
                    </Typography>
                  )}
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocalShipping sx={{ mr: 1, color: 'success.main' }} />
                    <Typography variant="body2" color="success.main">
                      Envío gratuito
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary">
                    Entrega estimada: 2-3 días hábiles
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Selecciona tu método de pago
              </Typography>
              
              <RadioGroup
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                sx={{ mb: 3 }}
              >
                <FormControlLabel
                  value="tarjeta"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CreditCard sx={{ mr: 1 }} />
                      Tarjeta de Crédito
                    </Box>
                  }
                />
                <FormControlLabel
                  value="pse"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccountBalance sx={{ mr: 1 }} />
                      PSE (Pago Seguro en Línea)
                    </Box>
                  }
                />
              </RadioGroup>

              {paymentMethod === 'tarjeta' && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Número de Tarjeta"
                      name="cardNumber"
                      value={paymentDetails.cardNumber}
                      onChange={handlePaymentChange}
                      placeholder="1234 5678 9012 3456"
                      inputProps={{ maxLength: 19 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Nombre en la Tarjeta"
                      name="cardName"
                      value={paymentDetails.cardName}
                      onChange={handlePaymentChange}
                      placeholder="Juan Pérez"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="MM/AA"
                      name="expiryDate"
                      value={paymentDetails.expiryDate}
                      onChange={handlePaymentChange}
                      placeholder="12/25"
                      inputProps={{ maxLength: 5 }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="CVV"
                      name="cvv"
                      type="password"
                      value={paymentDetails.cvv}
                      onChange={handlePaymentChange}
                      placeholder="123"
                      inputProps={{ maxLength: 4 }}
                    />
                  </Grid>
                </Grid>
              )}

              {paymentMethod === 'pse' && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      select
                      label="Banco"
                      name="pseBank"
                      value={paymentDetails.pseBank}
                      onChange={handlePaymentChange}
                      SelectProps={{ native: true }}
                    >
                      <option value="">Selecciona tu banco</option>
                      <option value="bancolombia">Bancolombia</option>
                      <option value="davivienda">Davivienda</option>
                      <option value="bbva">BBVA</option>
                      <option value="banco_bogota">Banco de Bogotá</option>
                      <option value="banco_popular">Banco Popular</option>
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Número de Documento"
                      name="pseDocument"
                      value={paymentDetails.pseDocument}
                      onChange={handlePaymentChange}
                      placeholder="12345678"
                    />
                  </Grid>
                </Grid>
              )}
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Box textAlign="center">
            <CheckCircle
              sx={{
                fontSize: 80,
                color: 'success.main',
                mb: 2
              }}
            />
            <Typography variant="h4" gutterBottom>
              ¡Pedido Confirmado!
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Tu pedido ha sido procesado exitosamente.
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Recibirás un email de confirmación con los detalles de tu compra.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Serás redirigido a tus pedidos en unos segundos...
            </Typography>
          </Box>
        );

      default:
        return 'Paso desconocido';
    }
  };

  if (!user || cartItems.length === 0) {
    return null; // Los useEffect manejan la redirección
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Finalizar Compra
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={activeStep === 0 ? 12 : 8}>
          {getStepContent(activeStep)}
        </Grid>

        {activeStep !== 0 && (
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

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Total:
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  ${getFinalTotal().toLocaleString()}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Botones de navegación */}
      {activeStep < 2 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0}
          >
            Atrás
          </Button>
          
          <Button
            variant="contained"
            onClick={activeStep === steps.length - 2 ? handleSubmit : handleNext}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Procesando...' : activeStep === steps.length - 2 ? 'Confirmar Pedido' : 'Siguiente'}
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default Checkout;