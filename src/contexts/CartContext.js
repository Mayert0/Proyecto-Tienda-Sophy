// src/contexts/CartContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
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

  useEffect(() => {
    loadCartFromStorage();
  }, []);

  useEffect(() => {
    saveCartToStorage();
  }, [cartItems]);

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

  const addToCart = (product, quantity = 1) => {
    const today = new Date().toDateString();
    const todayItems = cartItems.filter(item =>
      new Date(item.addedDate).toDateString() === today
    );

    if (todayItems.length >= 3) {
      toast.error('Solo puedes agregar 3 productos por día');
      return false;
    }

    if (product.existencia < quantity) {
      toast.error('Stock insuficiente');
      return false;
    }

    const existingItem = cartItems.find(item => item.id === product.id);
   
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
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

  const updateQuantity = (cartItemId, newQuantity) => {
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

  const getTaxAmount = () => {
    return cartItems.reduce((total, item) => {
      if (item.tieneIva === 1) {
        const subtotal = Number(item.precioVentaActual) * Number(item.quantity);
        return total + (subtotal * 0.19);
      }
      return total;
    }, 0);
  };

  const getSubtotal = () => {
    return getCartTotal();
  };

  const getFinalTotal = () => {
    return getSubtotal() + getTaxAmount();
  };

  const canAddMoreItems = () => {
    const today = new Date().toDateString();
    const todayItems = cartItems.filter(item =>
      new Date(item.addedDate).toDateString() === today
    );
    return todayItems.length < 3;
  };

  const getTodayItemsCount = () => {
    const today = new Date().toDateString();
    return cartItems.filter(item =>
      new Date(item.addedDate).toDateString() === today
    ).length;
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    getTaxAmount,
    getSubtotal,
    getFinalTotal,
    canAddMoreItems,
    getTodayItemsCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};