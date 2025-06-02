// src/components/ProductCard/ProductCard.js
import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  Rating
} from '@mui/material';
import { ShoppingCart, Visibility } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { toast } from 'react-toastify';


const ProductCard = ({ product }) => {
  const { user } = useAuth();
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.info('Debes iniciar sesión para agregar productos al carrito');
      return;
    }
    addToCart(product);
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6
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
        <Typography gutterBottom variant="h6" component="h3" noWrap>
          {product.descripcion}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Rating value={4} size="small" readOnly />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            (4.0)
          </Typography>
        </Box>

        <Typography variant="h6" color="primary" fontWeight="bold" gutterBottom>
          ${Number(product.precioVentaActual).toLocaleString()}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label={`Stock: ${product.existencia}`}
            size="small"
            color={product.existencia > 10 ? 'success' : product.existencia > 0 ? 'warning' : 'error'}
            variant="outlined"
          />
          {product.tieneIva === 1 && (
            <Chip label="IVA incluido" size="small" color="info" variant="outlined" />
          )}
        </Box>
      </CardContent>
      
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          size="small"
          startIcon={<Visibility />}
          component={Link}
          to={`/product/${product.id}`}
        >
          Ver Detalles
        </Button>
        <Button
          size="small"
          variant="contained"
          startIcon={<ShoppingCart />}
          onClick={handleAddToCart}
          disabled={product.existencia === 0}
        >
          {product.existencia === 0 ? 'Sin Stock' : 'Agregar'}
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;
