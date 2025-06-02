// src/pages/Admin/ReportsAdmin.js 
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import {
  Assessment,
  TrendingUp,
  People,
  Inventory,
  GetApp,
  DateRange,
  AttachMoney,
  ShoppingCart
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { orderService, productService, clientService } from '../../services/api';
import { toast } from 'react-toastify';

const ReportsAdmin = () => {
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [reportData, setReportData] = useState({
    salesStats: {},
    productStats: [],
    clientStats: {},
    monthlyData: [],
    topProducts: [],
    recentOrders: []
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  useEffect(() => {
    loadReportData();
  }, [selectedPeriod]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      
      // Cargar datos desde APIs
      const [orders, products, clients] = await Promise.all([
        orderService.getAllOrders(),
        productService.getAllProducts(),
        clientService.getAllClients()
      ]);

      // Procesar estadísticas de ventas
      const salesStats = processSalesStats(orders);
      
      // Procesar estadísticas de productos
      const productStats = processProductStats(products);
      
      // Procesar estadísticas de clientes
      const clientStats = processClientStats(clients, orders);
      
      // Procesar datos mensuales
      const monthlyData = processMonthlyData(orders);
      
      // Productos más vendidos (simulado)
      const topProducts = processTopProducts(products, orders);
      
      // Órdenes recientes
      const recentOrders = orders
        .sort((a, b) => new Date(b.fechaVenta) - new Date(a.fechaVenta))
        .slice(0, 10);

      setReportData({
        salesStats,
        productStats,
        clientStats,
        monthlyData,
        topProducts,
        recentOrders
      });
    } catch (error) {
      console.error('Error al cargar datos de reportes:', error);
      toast.error('Error al cargar reportes');
    } finally {
      setLoading(false);
    }
  };

  const processSalesStats = (orders) => {
    const totalSales = orders.reduce((sum, order) => sum + order.valorVenta, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
    const totalTax = orders.reduce((sum, order) => sum + order.valorIva, 0);

    return {
      totalSales,
      totalOrders,
      averageOrderValue,
      totalTax
    };
  };

  const processProductStats = (products) => {
    const activeProducts = products.filter(p => p.estado === 1).length;
    const inactiveProducts = products.filter(p => p.estado === 0).length;
    const lowStockProducts = products.filter(p => p.existencia <= 5).length;
    const outOfStockProducts = products.filter(p => p.existencia === 0).length;

    return [
      { name: 'Activos', value: activeProducts, color: '#00C49F' },
      { name: 'Inactivos', value: inactiveProducts, color: '#FF8042' },
      { name: 'Bajo Stock', value: lowStockProducts, color: '#FFBB28' },
      { name: 'Sin Stock', value: outOfStockProducts, color: '#FF4444' }
    ];
  };

  const processClientStats = (clients, orders) => {
    const totalClients = clients.length;
    const activeClients = clients.filter(c => c.estado === 1).length;
    const clientsWithOrders = new Set(orders.map(o => o.idCliente)).size;
    
    return {
      totalClients,
      activeClients,
      clientsWithOrders
    };
  };

  const processMonthlyData = (orders) => {
    const monthlyStats = {};
    
    orders.forEach(order => {
      const date = new Date(order.fechaVenta);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyStats[monthKey]) {
        monthlyStats[monthKey] = {
          month: monthKey,
          ventas: 0,
          pedidos: 0,
          ingresos: 0
        };
      }
      
      monthlyStats[monthKey].ventas += order.valorVenta;
      monthlyStats[monthKey].pedidos += 1;
      monthlyStats[monthKey].ingresos += order.valorVenta - order.valorIva;
    });

    return Object.values(monthlyStats).sort((a, b) => a.month.localeCompare(b.month));
  };

  const processTopProducts = (products, orders) => {
    // Simulación de productos más vendidos basado en stock actual
    return products
      .filter(p => p.estado === 1)
      .sort((a, b) => (b.stockMaximo - b.existencia) - (a.stockMaximo - a.existencia))
      .slice(0, 5)
      .map(product => ({
        name: product.descripcion,
        ventas: product.stockMaximo - product.existencia || 1,
        ingresos: (product.stockMaximo - product.existencia) * Number(product.precioVentaActual) || Number(product.precioVentaActual)
      }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const exportToPDF = () => {
    toast.info('Función de exportación a PDF estará disponible próximamente');
  };

  const exportToExcel = () => {
    toast.info('Función de exportación a Excel estará disponible próximamente');
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Cargando reportes...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Reportes y Estadísticas
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <FormControl variant="outlined" sx={{ minWidth: 200 }}>
            <InputLabel>Período</InputLabel>
            <Select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              label="Período"
            >
              <MenuItem value="week">Esta Semana</MenuItem>
              <MenuItem value="month">Este Mes</MenuItem>
              <MenuItem value="quarter">Este Trimestre</MenuItem>
              <MenuItem value="year">Este Año</MenuItem>
            </Select>
          </FormControl>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<GetApp />}
              onClick={exportToPDF}
            >
              Exportar PDF
            </Button>
            <Button
              variant="outlined"
              startIcon={<GetApp />}
              onClick={exportToExcel}
            >
              Exportar Excel
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Tarjetas de resumen */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AttachMoney sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Ventas Totales
                  </Typography>
                  <Typography variant="h5">
                    {formatCurrency(reportData.salesStats.totalSales)}
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
                <ShoppingCart sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Pedidos
                  </Typography>
                  <Typography variant="h5">
                    {reportData.salesStats.totalOrders}
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
                    Clientes Activos
                  </Typography>
                  <Typography variant="h5">
                    {reportData.clientStats.activeClients}
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
                <TrendingUp sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Ticket Promedio
                  </Typography>
                  <Typography variant="h5">
                    {formatCurrency(reportData.salesStats.averageOrderValue)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gráficos */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Gráfico de ventas mensuales */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Evolución de Ventas Mensuales
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={reportData.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="ventas"
                  stackId="1"
                  stroke="#8884d8"
                  fill="#8884d8"
                  name="Ventas"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Gráfico de productos */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Estado de Productos
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reportData.productStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {reportData.productStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Productos más vendidos */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Productos Más Vendidos
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData.topProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="ventas" fill="#8884d8" name="Unidades Vendidas" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Pedidos recientes */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Pedidos Recientes
            </Typography>
            <TableContainer sx={{ maxHeight: 300 }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>#{order.id}</TableCell>
                      <TableCell>{order.idCliente}</TableCell>
                      <TableCell>
                        {new Date(order.fechaVenta).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{formatCurrency(order.valorVenta)}</TableCell>
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
          </Paper>
        </Grid>
      </Grid>

      {/* Resumen adicional */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Resumen Ejecutivo
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    {reportData.clientStats.clientsWithOrders}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Clientes con Compras
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main">
                    {formatCurrency(reportData.salesStats.totalTax)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total IVA Recaudado
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="warning.main">
                    {reportData.productStats.find(p => p.name === 'Bajo Stock')?.value || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Productos con Bajo Stock
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ReportsAdmin;