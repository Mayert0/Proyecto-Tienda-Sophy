// src/components/Footer/Footer.js
import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  Pets,
  Email,
  Phone,
  LocationOn
} from '@mui/icons-material';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        mt: 'auto',
        pt: 6,
        pb: 3
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Logo y descripción */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Pets sx={{ fontSize: 32, mr: 1 }} />
              <Typography variant="h5" fontWeight="bold">
                Sophy's Shop
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Tu tienda de confianza para todo lo que tu mascota necesita. 
              Productos de calidad, precios justos y el mejor servicio.
            </Typography>
            <Box>
              <IconButton 
                color="inherit" 
                aria-label="Facebook"
                sx={{ mr: 1 }}
              >
                <Facebook />
              </IconButton>
              <IconButton 
                color="inherit" 
                aria-label="Twitter"
                sx={{ mr: 1 }}
              >
                <Twitter />
              </IconButton>
              <IconButton 
                color="inherit" 
                aria-label="Instagram"
                sx={{ mr: 1 }}
              >
                <Instagram />
              </IconButton>
              <IconButton 
                color="inherit" 
                aria-label="LinkedIn"
              >
                <LinkedIn />
              </IconButton>
            </Box>
          </Grid>

          {/* Enlaces rápidos */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Navegación
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/" color="inherit" underline="hover">
                Inicio
              </Link>
              <Link href="/catalog" color="inherit" underline="hover">
                Catálogo
              </Link>
              <Link href="/login" color="inherit" underline="hover">
                Mi Cuenta
              </Link>
              <Link href="/cart" color="inherit" underline="hover">
                Carrito
              </Link>
            </Box>
          </Grid>

          {/* Categorías */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Categorías
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="/catalog" color="inherit" underline="hover">
                Alimentos
              </Link>
              <Link href="/catalog" color="inherit" underline="hover">
                Juguetes
              </Link>
              <Link href="/catalog" color="inherit" underline="hover">
                Accesorios
              </Link>
              <Link href="/catalog" color="inherit" underline="hover">
                Higiene
              </Link>
            </Box>
          </Grid>

          {/* Información de contacto */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Contacto
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationOn sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="body2">
                  Calle 123 #45-67, Bogotá, Colombia
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Phone sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="body2">
                  +57 (1) 234-5678
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Email sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="body2">
                  info@tiendamascotas.com
                </Typography>
              </Box>
            </Box>

            <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mt: 3 }}>
              Horarios de Atención
            </Typography>
            <Typography variant="body2">
              Lunes a Viernes: 8:00 AM - 6:00 PM
            </Typography>
            <Typography variant="body2">
              Sábados: 9:00 AM - 4:00 PM
            </Typography>
            <Typography variant="body2">
              Domingos: 10:00 AM - 2:00 PM
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.2)' }} />

        {/* Copyright y políticas */}
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="body2">
              © {currentYear} Tienda Mascotas. Todos los derechos reservados.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box 
              sx={{ 
                display: 'flex', 
                gap: 2, 
                justifyContent: { xs: 'flex-start', md: 'flex-end' },
                flexWrap: 'wrap'
              }}
            >
              <Link href="#" color="inherit" underline="hover" variant="body2">
                Términos y Condiciones
              </Link>
              <Link href="#" color="inherit" underline="hover" variant="body2">
                Política de Privacidad
              </Link>
              <Link href="#" color="inherit" underline="hover" variant="body2">
                Política de Devoluciones
              </Link>
            </Box>
          </Grid>
        </Grid>

        {/* Información adicional */}
        <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1 }}>
          <Typography variant="body2" textAlign="center">
            <strong>🚚 Envío gratuito</strong> en todas las compras • 
            <strong> 🔒 Compra segura</strong> con encriptación SSL • 
            <strong> 💳 Múltiples métodos de pago</strong> disponibles
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;