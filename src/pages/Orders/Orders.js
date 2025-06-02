// src/pages/Orders/Orders.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Collapse,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  ShoppingBag,
  ExpandMore,
  ExpandLess,
  Receipt,
  DateRange,
  AttachMoney,
  LocalShipping,
  CheckCircle,
  Info
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { orderService, clientService } from '../../services/api';
import { toast } from 'react-toastify';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [clientData, setClientData] = useState(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadOrders();
      loadClientData();
    }
  }, [user]);

  const loadClientData = async () => {
    try {
      const clients = await clientService.getAllClients();
      const client = clients.find(c => c.correoCliente === user.correoUsuario);
      setClientData(client);
    } catch (error) {
      console.error('Error al cargar datos del cliente:', error);
    }
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      
      // Obtener el cliente por correo
      const clients = await clientService.getAllClients();
      const client = clients.find(c => c.correoCliente === user.correoUsuario);
      
      if (client) {
        const ordersData = await orderService.getOrdersByClient(client.id);
        // Ordenar por fecha más reciente
        const sortedOrders = ordersData.sort((a, b) => new Date(b.fechaVenta) - new Date(a.fechaVenta));
        setOrders(sortedOrders);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('Error al cargar órdenes:', error);
      toast.error('Error al cargar el historial de pedidos');
    } finally {
      setLoading(false);
    }
  };

  const handleExpandClick = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
  };

  const getOrderStatus = (order) => {
    if (order.estado === 1) {
      return { label: 'Completado', color: 'success', icon: <CheckCircle /> };
    } else {
      return { label: 'Procesando', color: 'warning', icon: <LocalShipping /> };
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Cargando pedidos...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (orders.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Mis Pedidos
        </Typography>
        
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <ShoppingBag sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No tienes pedidos aún
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            ¡Explora nuestro catálogo y realiza tu primera compra!
          </Typography>
          <Button
            variant="contained"
            href="/catalog"
            size="large"
          >
            Ver Productos
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Mis Pedidos
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          Aquí encontrarás el historial completo de tus compras. 
          Recuerda que puedes realizar máximo 3 compras por día.
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {orders.map((order) => {
          const status = getOrderStatus(order);
          const isExpanded = expandedOrder === order.id;

          return (
            <Grid item xs={12} key={order.id}>
              <Card elevation={2}>
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    {/* Información principal del pedido */}
                    <Grid item xs={12} sm={6} md={3}>
                      <Box>
                        <Typography variant="h6" color="primary" gutterBottom>
                          Pedido #{order.id}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <DateRange sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {new Date(order.fechaVenta).toLocaleDateString('es-CO', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    {/* Estado */}
                    <Grid item xs={12} sm={6} md={2}>
                      <Chip
                        icon={status.icon}
                        label={status.label}
                        color={status.color}
                        variant="outlined"
                      />
                    </Grid>

                    {/* Totales */}
                    <Grid item xs={12} sm={6} md={3}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Subtotal: {formatCurrency(order.valorVenta - order.valorIva)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          IVA: {formatCurrency(order.valorIva)}
                        </Typography>
                        <Typography variant="h6" color="primary">
                          Total: {formatCurrency(order.valorVenta)}
                        </Typography>
                      </Box>
                    </Grid>

                    {/* Acciones */}
                    <Grid item xs={12} sm={6} md={4}>
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Receipt />}
                          onClick={() => handleViewDetails(order)}
                        >
                          Ver Detalles
                        </Button>
                        <IconButton
                          onClick={() => handleExpandClick(order.id)}
                          aria-expanded={isExpanded}
                          aria-label="mostrar más"
                        >
                          {isExpanded ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Información expandida */}
                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <Divider sx={{ my: 2 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" gutterBottom>
                          Información de entrega:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {clientData?.nombreCliente}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {clientData?.direccionCliente}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Tel: {clientData?.telefono}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" gutterBottom>
                          Resumen del pedido:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Descuento aplicado: {formatCurrency(order.valorDscto)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Método de pago: Procesado exitosamente
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Envío: Gratuito
                        </Typography>
                      </Grid>
                    </Grid>
                  </Collapse>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Dialog de detalles del pedido */}
      <Dialog
        open={orderDetailsOpen}
        onClose={() => setOrderDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Receipt sx={{ mr: 1 }} />
            Detalles del Pedido #{selectedOrder?.id}
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Información del Pedido
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell><strong>Número de Pedido:</strong></TableCell>
                          <TableCell>#{selectedOrder.id}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Fecha:</strong></TableCell>
                          <TableCell>
                            {new Date(selectedOrder.fechaVenta).toLocaleDateString('es-CO')}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Estado:</strong></TableCell>
                          <TableCell>
                            <Chip
                              label={getOrderStatus(selectedOrder).label}
                              color={getOrderStatus(selectedOrder).color}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Información de Entrega
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell><strong>Nombre:</strong></TableCell>
                          <TableCell>{clientData?.nombreCliente}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Dirección:</strong></TableCell>
                          <TableCell>{clientData?.direccionCliente}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Teléfono:</strong></TableCell>
                          <TableCell>{clientData?.telefono}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Email:</strong></TableCell>
                          <TableCell>{clientData?.correoCliente}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Resumen de Costos
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell><strong>Subtotal:</strong></TableCell>
                          <TableCell align="right">
                            {formatCurrency(selectedOrder.valorVenta - selectedOrder.valorIva)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>IVA (19%):</strong></TableCell>
                          <TableCell align="right">
                            {formatCurrency(selectedOrder.valorIva)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Descuento:</strong></TableCell>
                          <TableCell align="right">
                            -{formatCurrency(selectedOrder.valorDscto)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Envío:</strong></TableCell>
                          <TableCell align="right" sx={{ color: 'success.main' }}>
                            Gratuito
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Total:</strong></TableCell>
                          <TableCell align="right">
                            <Typography variant="h6" color="primary">
                              {formatCurrency(selectedOrder.valorVenta)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>

              <Alert severity="info" sx={{ mt: 3 }}>
                <Typography variant="body2">
                  <Info sx={{ fontSize: 16, mr: 1, verticalAlign: 'text-bottom' }} />
                  Si tienes alguna consulta sobre este pedido, puedes contactarnos 
                  a través de nuestro email de soporte.
                </Typography>
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOrderDetailsOpen(false)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Orders;