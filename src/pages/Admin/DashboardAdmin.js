//src/pages/Admin/DashboardAdmin.js 
import React from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip
} from '@mui/material';
import {
  Inventory,
  ShoppingBag,
  People,
  AttachMoney
} from '@mui/icons-material';

const DashboardAdmin = ({ stats, loading }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Cargando estadísticas...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Dashboard Administrativo
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Inventory sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Productos
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalProducts}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ShoppingBag sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Pedidos
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalOrders}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <People sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Clientes
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalCustomers}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AttachMoney sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Ingresos
                  </Typography>
                  <Typography variant="h6">
                    {formatCurrency(stats.totalRevenue)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Pedidos Recientes
            </Typography>
            <List>
              {stats.recentOrders.map((order) => (
                <ListItem key={order.id}>
                  <ListItemText
                    primary={`Pedido #${order.id}`}
                    secondary={`${formatCurrency(order.valorVenta)} - ${new Date(order.fechaVenta).toLocaleDateString()}`}
                  />
                  <Chip
                    label={order.estado === 1 ? 'Completado' : 'Pendiente'}
                    color={order.estado === 1 ? 'success' : 'warning'}
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Productos con Bajo Stock
            </Typography>
            <List>
              {stats.lowStockProducts.map((product) => (
                <ListItem key={product.id}>
                  <ListItemText
                    primary={product.descripcion}
                    secondary={`Stock: ${product.existencia}`}
                  />
                  <Chip
                    label={product.existencia === 0 ? 'Sin Stock' : 'Bajo Stock'}
                    color={product.existencia === 0 ? 'error' : 'warning'}
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DashboardAdmin;