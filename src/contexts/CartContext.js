// src/contexts/CartContext.js - 
import React, { createContext, useContext, useState, useEffect } from 'react';
import { parameterService } from '../services/api';
import { toast } from 'react-toastify';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser usado dentro de CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [maxDailyProducts, setMaxDailyProducts] = useState(3);
  const [ivaRate, setIvaRate] = useState(0.19);

  useEffect(() => {
    loadCartFromStorage();
    loadMaxDailyProducts();
    loadIvaRate();
  }, []);

  useEffect(() => {
    saveCartToStorage();
  }, [cartItems]);

  // Cargar parámetros del sistema
  const loadMaxDailyProducts = async () => {
    try {
      const limit = await parameterService.getMaxDailyProducts();
      setMaxDailyProducts(limit);
    } catch (error) {
      console.error('Error cargando límite de productos:', error);
      setMaxDailyProducts(3);
    }
  };

  const loadIvaRate = async () => {
    try {
      const rate = await parameterService.getIvaRate();
      setIvaRate(rate);
    } catch (error) {
      console.error('Error cargando tasa de IVA:', error);
      setIvaRate(0.19);
    }
  };

  const loadCartFromStorage = () => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Error al cargar carrito:', error);
    }
  };

  const saveCartToStorage = () => {
    try {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error al guardar carrito:', error);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    // Recargar límite actual
    await loadMaxDailyProducts();

    const today = new Date().toDateString();
    const todayProductsCount = cartItems
      .filter(item => new Date(item.addedDate).toDateString() === today)
      .reduce((total, item) => total + item.quantity, 0);

    // Verificar si agregar este producto excedería el límite
    if (todayProductsCount + quantity > maxDailyProducts) {
      toast.error(`Solo puedes agregar ${maxDailyProducts} productos por día. Ya tienes ${todayProductsCount} productos.`);
      return false;
    }

    if (product.existencia < quantity) {
      toast.error('Stock insuficiente');
      return false;
    }

    const existingItem = cartItems.find(item => item.id === product.id);
   
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
     
      // Verificar límite con la nueva cantidad
      const newTotalProducts = todayProductsCount - existingItem.quantity + newQuantity;
      if (newTotalProducts > maxDailyProducts) {
        toast.error(`Solo puedes tener ${maxDailyProducts} productos por día.`);
        return false;
      }
     
      if (newQuantity > product.existencia) {
        toast.error('No hay suficiente stock disponible');
        return false;
      }
     
      setCartItems(prev =>
        prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    } else {
      const newItem = {
        ...product,
        quantity,
        addedDate: new Date().toISOString(),
        cartItemId: Date.now()
      };
      setCartItems(prev => [...prev, newItem]);
    }

    toast.success(`${product.descripcion} agregado al carrito`);
    return true;
  };

  const removeFromCart = (cartItemId) => {
    const item = cartItems.find(item => item.cartItemId === cartItemId);
    setCartItems(prev => prev.filter(item => item.cartItemId !== cartItemId));
   
    if (item) {
      toast.info(`${item.descripcion} eliminado del carrito`);
    }
  };

  const updateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }

    const item = cartItems.find(item => item.cartItemId === cartItemId);
    if (!item) return;

    if (newQuantity > item.existencia) {
      toast.error('No hay suficiente stock disponible');
      return;
    }

    // Verificar límite diario al actualizar cantidad
    await loadMaxDailyProducts();
    const today = new Date().toDateString();
    const todayProductsCount = cartItems
      .filter(cartItem =>
        new Date(cartItem.addedDate).toDateString() === today &&
        cartItem.cartItemId !== cartItemId
      )
      .reduce((total, cartItem) => total + cartItem.quantity, 0);

    if (todayProductsCount + newQuantity > maxDailyProducts) {
      toast.error(`Solo puedes tener ${maxDailyProducts} productos por día.`);
      return;
    }

    setCartItems(prev =>
      prev.map(item =>
        item.cartItemId === cartItemId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    toast.info('Carrito vacío');
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = Number(item.precioVentaActual);
      const quantity = Number(item.quantity);
      return total + (price * quantity);
    }, 0);
  };

  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTaxAmountSync = () => {
    return cartItems.reduce((total, item) => {
      if (item.tieneIva === 1) {
        const subtotal = Number(item.precioVentaActual) * Number(item.quantity);
        return total + (subtotal * ivaRate);
      }
      return total;
    }, 0);
  };

  const getSubtotal = () => {
    return getCartTotal();
  };

  const getFinalTotalSync = () => {
    return getSubtotal() + getTaxAmountSync();
  };

  const getTodayItemsCount = () => {
    const today = new Date().toDateString();
    return cartItems
      .filter(item => new Date(item.addedDate).toDateString() === today)
      .reduce((total, item) => total + item.quantity, 0);
  };

  const getMaxDailyProducts = () => maxDailyProducts;

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    getTaxAmountSync,
    getSubtotal,
    getFinalTotalSync,
    getTodayItemsCount,
    getMaxDailyProducts,
    maxDailyProducts,
    ivaRate
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};