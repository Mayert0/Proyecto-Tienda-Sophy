// src/services/authService.js
import api from './api';

export const authService = {
  login: async (correo, contraseña) => {
    const response = await api.post(`/Proyec/usuario/login?correo=${encodeURIComponent(correo)}&contraseña=${encodeURIComponent(contraseña)}`);
    return response.data;
  },

  registerCliente: async (correoUsuario) => {
    const response = await api.post('/Proyec/usuario/registrarCliente', { correoUsuario });
    return response.data;
  },

  forgotPassword: async (correo) => {
    const response = await api.post(`/Proyec/usuario/recuperarPassword?correo=${encodeURIComponent(correo)}`);
    return response.data;
  },

  updateUser: async (userData) => {
    const response = await api.post('/Proyec/usuario/updateUsuario', userData);
    return response.data;
  },

  getUserById: async (id) => {
    const response = await api.get(`/Proyec/usuario/findRecord/${id}`);
    return response.data;
  }
};