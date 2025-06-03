// src/services/parameterService.js
import api from './api';

export const parameterService = {
  getAllParameters: async () => {
    const response = await api.get('/Proyec/parametro/getAll');
    return response.data;
  },

  getParameterById: async (id) => {
    const response = await api.get(`/Proyec/parametro/findRecord/${id}`);
    return response.data;
  },

  createParameter: async (parameterData) => {
    const response = await api.post('/Proyec/parametro/saveParametro', parameterData);
    return response.data;
  },

  updateParameter: async (parameterData) => {
    const response = await api.post('/Proyec/parametro/updateParametro', parameterData);
    return response.data;
  },

  deleteParameter: async (id) => {
    const response = await api.delete(`/Proyec/parametro/deleteParametro/${id}`);
    return response.data;
  },

  // Métodos específicos para obtener parámetros del sistema
  getMaxDailyProducts: async () => {
    try {
      const parameters = await parameterService.getAllParameters();
      const param = parameters.find(p => p.descripcion.toLowerCase().includes('productos por dia') || p.id === 1);
      return param ? param.valorNumero : 3; // Valor por defecto
    } catch (error) {
      console.error('Error al obtener parámetro de productos por día:', error);
      return 3;
    }
  },

  getMaxLoginAttempts: async () => {
    try {
      const parameters = await parameterService.getAllParameters();
      const param = parameters.find(p => p.descripcion.toLowerCase().includes('intentos fallidos') || p.id === 2);
      return param ? param.valorNumero : 3; // Valor por defecto
    } catch (error) {
      console.error('Error al obtener parámetro de intentos fallidos:', error);
      return 3;
    }
  },

  getIvaRate: async () => {
    try {
      const parameters = await parameterService.getAllParameters();
      const param = parameters.find(p => p.descripcion.toLowerCase().includes('iva') || p.id === 3);
      return param ? parseFloat(param.valorTexto || param.valorNumero) / 100 : 0.19; // Valor por defecto 19%
    } catch (error) {
      console.error('Error al obtener parámetro de IVA:', error);
      return 0.19;
    }
  }
};