// src/components/Navbar/Navbar.js (VERSIÓN COMPLETA)
import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Box,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  ShoppingCart,
  AccountCircle,
  Menu as MenuIcon,
  Pets,
  Home,
  Store,
  Login,
  PersonAdd,
  Logout,
  AdminPanelSettings,
  Person,
  ShoppingBag
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout, isAdmin } = useAuth();
  const { getCartItemsCount } = useCart();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/');
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Inicio', icon: <Home />, path: '/' },
    { text: 'Catálogo', icon: <Store />, path: '/catalog' },
  ];

  const authMenuItems = user
    ? [
        { text: 'Mi Perfil', icon: <Person />, path: '/profile' },
        { text: 'Mis Pedidos', icon: <ShoppingBag />, path: '/orders' },
        ...(isAdmin() ? [{ text: 'Panel Admin', icon: <AdminPanelSettings />, path: '/admin' }] : []),
        { text: 'Cerrar Sesión', icon: <Logout />, action: handleLogout },
      ]
    : [
        { text: 'Iniciar Sesión', icon: <Login />, path: '/login' },
        { text: 'Registrarse', icon: <PersonAdd />, path: '/register' },
      ];

  const drawer = (
    <Box sx={{ width: 250 }} role="presentation">
      <Box sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
        <Pets sx={{ fontSize: 40, mb: 1 }} />
        <Typography variant="h6">Sophy's Shop</Typography>
      </Box>
      
      <List>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.text} 
            component={Link} 
            to={item.path}
            onClick={handleDrawerToggle}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      
      <Divider />
      
      <List>
        {user && (
          <ListItem 
            button 
            component={Link} 
            to="/cart"
            onClick={handleDrawerToggle}
          >
            <ListItemIcon>
              <Badge badgeContent={getCartItemsCount()} color="secondary">
                <ShoppingCart />
              </Badge>
            </ListItemIcon>
            <ListItemText primary="Carrito" />
          </ListItem>
        )}
        
        {authMenuItems.map((item) => (
          <ListItem 
            button 
            key={item.text}
            component={item.path ? Link : 'div'}
            to={item.path}
            onClick={item.action ? item.action : handleDrawerToggle}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Pets sx={{ mr: 1 }} />
            <Typography
              variant="h6"
              component={Link}
              to="/"
              sx={{
                textDecoration: 'none',
                color: 'inherit',
                fontWeight: 'bold'
              }}
            >
              Sophy's Shop
            </Typography>
          </Box>

          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button color="inherit" component={Link} to="/">
                Inicio
              </Button>
              <Button color="inherit" component={Link} to="/catalog">
                Catálogo
              </Button>

              {user && (
                <IconButton 
                  color="inherit" 
                  component={Link} 
                  to="/cart"
                  sx={{ ml: 1 }}
                >
                  <Badge badgeContent={getCartItemsCount()} color="secondary">
                    <ShoppingCart />
                  </Badge>
                </IconButton>
              )}

              {user ? (
                <>
                  <IconButton
                    size="large"
                    edge="end"
                    aria-label="account of current user"
                    aria-controls="primary-search-account-menu"
                    aria-haspopup="true"
                    onClick={handleProfileMenuOpen}
                    color="inherit"
                  >
                    <AccountCircle />
                  </IconButton>
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {user.login}
                  </Typography>
                </>
              ) : (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button color="inherit" component={Link} to="/login">
                    Iniciar Sesión
                  </Button>
                  <Button 
                    color="inherit" 
                    component={Link} 
                    to="/register"
                    variant="outlined"
                    sx={{ borderColor: 'white', '&:hover': { borderColor: 'white' } }}
                  >
                    Registrarse
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Menu desplegable para usuario */}
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        id="primary-search-account-menu"
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose} component={Link} to="/profile">
          <Person sx={{ mr: 1 }} />
          Mi Perfil
        </MenuItem>
        <MenuItem onClick={handleMenuClose} component={Link} to="/orders">
          <ShoppingBag sx={{ mr: 1 }} />
          Mis Pedidos
        </MenuItem>
        {isAdmin() && (
          <MenuItem onClick={handleMenuClose} component={Link} to="/admin">
            <AdminPanelSettings sx={{ mr: 1 }} />
            Panel Admin
          </MenuItem>
        )}
        <MenuItem onClick={handleLogout}>
          <Logout sx={{ mr: 1 }} />
          Cerrar Sesión
        </MenuItem>
      </Menu>

      {/* Drawer para móvil */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar;