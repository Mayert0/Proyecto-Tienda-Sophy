// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error al verificar estado de autenticación:', error);
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const userData = await authService.login(email, password);
     
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
     
      toast.success('¡Bienvenido! Inicio de sesión exitoso');
      return userData;
    } catch (error) {
      const errorMessage = error.response?.data || 'Error al iniciar sesión';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

 const register = async (userData) => {
  try {
    setLoading(true);
    const response = await authService.registerCliente(userData.correoUsuario);
   
    // IMPORTANTE: Solo retornar datos serializables
    return {
      success: true,
      message: typeof response === 'string' ? response : 'Usuario registrado exitosamente'
    };
  } catch (error) {
    const errorMessage = error.response?.data || 'Error en el registro';
    toast.error(errorMessage);
    
    // Lanzar solo el mensaje, no el objeto completo
    throw new Error(errorMessage);
  } finally {
    setLoading(false);
  }
};

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast.info('Sesión cerrada exitosamente');
  };

  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      await authService.forgotPassword(email);
      toast.success('Nueva contraseña enviada a tu correo electrónico');
      return true;
    } catch (error) {
      const errorMessage = error.response?.data || 'Error al recuperar contraseña';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updatedData) => {
    try {
      setLoading(true);
      const updatedUser = await authService.updateUser(updatedData);
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      toast.success('Perfil actualizado exitosamente');
      return updatedUser;
    } catch (error) {
      const errorMessage = error.response?.data || 'Error al actualizar perfil';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = () => {
    return user?.idTipoUsuario === '1';
  };

  const isAuthenticated = () => {
    return !!user && user.estado === 1;
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    forgotPassword,
    updateProfile,
    isAdmin,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};