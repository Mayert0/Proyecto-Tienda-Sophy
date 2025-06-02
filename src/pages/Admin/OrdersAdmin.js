//src/pages/Admin/OrdersAdmin.js 
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Chip
} from '@mui/material';
import { orderService } from '../../services/api';
import { toast } from 'react-toastify';

const OrdersAdmin = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await orderService.getAllOrders();
      setOrders(ordersData.sort((a, b) => new Date(b.fechaVenta) - new Date(a.fechaVenta)));
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
      toast.error('Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Gestión de Pedidos
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID Pedido</TableCell>
              <TableCell>Cliente ID</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Valor Total</TableCell>
              <TableCell>IVA</TableCell>
              <TableCell>Descuento</TableCell>
              <TableCell>Estado</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>#{order.id}</TableCell>
                <TableCell>{order.idCliente}</TableCell>
                <TableCell>{new Date(order.fechaVenta).toLocaleDateString()}</TableCell>
                <TableCell>{formatCurrency(order.valorVenta)}</TableCell>
                <TableCell>{formatCurrency(order.valorIva)}</TableCell>
                <TableCell>{formatCurrency(order.valorDscto)}</TableCell>
                <TableCell>
                  <Chip
                    label={order.estado === 1 ? 'Completado' : 'Pendiente'}
                    color={order.estado === 1 ? 'success' : 'warning'}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default OrdersAdmin;