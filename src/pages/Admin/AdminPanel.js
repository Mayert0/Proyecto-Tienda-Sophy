// src/pages/Admin/AdminPanel.js - 
import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  useTheme,
  useMediaQuery,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography
} from '@mui/material';
import {
  Dashboard,
  Inventory,
  People,
  Category,
  ShoppingCart,
  Assessment,
  AdminPanelSettings,
  Menu as MenuIcon,
  Settings // 🆕 AGREGAR ESTA IMPORTACIÓN
} from '@mui/icons-material';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { productService, orderService, clientService, userService } from '../../services/api';
import ProductsAdmin from './ProductsAdmin';
import CustomersAdmin from './CustomersAdmin';
import OrdersAdmin from './OrdersAdmin';
import CategoriesAdmin from './CategoriesAdmin';
import DashboardAdmin from './DashboardAdmin';
import ReportsAdmin from './ReportsAdmin';
import UsersAdmin from './UsersAdmin';
import ParametersAdmin from './ParametersAdmin'; // 🆕 AGREGAR ESTA IMPORTACIÓN

const AdminPanel = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    recentOrders: [],
    lowStockProducts: []
  });
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
 
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();

  const drawerWidth = 240;

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [products, orders, customers, users] = await Promise.all([
        productService.getAllProducts(),
        orderService.getAllOrders(),
        clientService.getAllClients(),
        userService.getAllUsers()
      ]);

      const totalRevenue = orders.reduce((sum, order) => sum + order.valorVenta, 0);
      const lowStockProducts = products.filter(p => p.existencia <= 5);
      const recentOrders = orders
        .sort((a, b) => new Date(b.fechaVenta) - new Date(a.fechaVenta))
        .slice(0, 5);

      const blockedAccounts = users.filter(u => u.intentos >= 3).length;

      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        totalCustomers: customers.length,
        totalRevenue,
        recentOrders,
        lowStockProducts,
        blockedAccounts
      });
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/admin', exact: true },
    { text: 'Productos', icon: <Inventory />, path: '/admin/products' },
    { text: 'Clientes', icon: <People />, path: '/admin/customers' },
    { text: 'Usuarios', icon: <AdminPanelSettings />, path: '/admin/users' },
    { text: 'Pedidos', icon: <ShoppingCart />, path: '/admin/orders' },
    { text: 'Categorías', icon: <Category />, path: '/admin/categories' },
    { text: 'Parámetros', icon: <Settings />, path: '/admin/parameters' }, // 🆕 NUEVA LÍNEA
    { text: 'Reportes', icon: <Assessment />, path: '/admin/reports' },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box>
      <Box sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
        <AdminPanelSettings sx={{ fontSize: 40, mb: 1 }} />
        <Typography variant="h6">Panel Admin</Typography>
      </Box>
     
      <List>
        {menuItems.map((item) => {
          const isActive = item.exact
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);
           
          return (
            <ListItem
              button
              key={item.text}
              component={Link}
              to={item.path}
              selected={isActive}
              sx={{
                backgroundColor: isActive ? 'primary.light' : 'transparent',
                color: isActive ? 'primary.contrastText' : 'text.primary',
                '&:hover': {
                  backgroundColor: isActive ? 'primary.light' : 'action.hover',
                }
              }}
            >
              <ListItemIcon sx={{ color: isActive ? 'primary.contrastText' : 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
          >
            {drawer}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
            open
          >
            {drawer}
          </Drawer>
        )}
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` }
        }}
      >
        {isMobile && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mb: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Routes>
          <Route path="/" element={<DashboardAdmin stats={stats} loading={loading} />} />
          <Route path="/products" element={<ProductsAdmin />} />
          <Route path="/customers" element={<CustomersAdmin />} />
          <Route path="/users" element={<UsersAdmin />} />
          <Route path="/orders" element={<OrdersAdmin />} />
          <Route path="/categories" element={<CategoriesAdmin />} />
          <Route path="/parameters" element={<ParametersAdmin />} /> {/* 🆕 NUEVA LÍNEA */}
          <Route path="/reports" element={<ReportsAdmin />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default AdminPanel;