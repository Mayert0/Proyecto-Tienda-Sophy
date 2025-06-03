// src/services/userService.js - SERVICIO COMPLETO CORREGIDO
import api from './api';

export const userService = {
  getAllUsers: async () => {
    const response = await api.get('/Proyec/usuario/getAll');
    return response.data;
  },

  getUserById: async (id) => {
    const response = await api.get(`/Proyec/usuario/findRecord/${id}`);
    return response.data;
  },

  updateUser: async (userData) => {
    const response = await api.post('/Proyec/usuario/updateUsuario', userData);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/Proyec/usuario/deleteUsuario/${id}`);
    return response.data;
  },

  unblockAccount: async (userId) => {
    const response = await api.post(`/Proyec/usuario/desbloquearCuenta/${userId}`);
    return response.data;
  },

  getBlockedAccounts: async () => {
    const response = await api.get('/Proyec/usuario/cuentasBloqueadas');
    return response.data;
  }
};