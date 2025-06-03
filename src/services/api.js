// src/services/api.js - ACTUALIZADO CON TODOS LOS SERVICIOS
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8092';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Error en la API:', error);
    return Promise.reject(error);
  }
);


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

export const productService = {
  getAllProducts: async () => {
    const response = await api.get('/Proyec/producto/getAll');
    return response.data;
  },

  getAvailableProducts: async () => {
    const response = await api.get('/Proyec/producto/disponibles');
    return response.data;
  },

  getProductsByCategory: async (categoryId) => {
    const response = await api.get(`/Proyec/producto/categoria/${categoryId}`);
    return response.data;
  },

  getProductById: async (id) => {
    const response = await api.get(`/Proyec/producto/findRecord/${id}`);
    return response.data;
  },

  createProduct: async (productData) => {
    const response = await api.post('/Proyec/producto/saveProducto', productData);
    return response.data;
  },

  updateProduct: async (productData) => {
    const response = await api.post('/Proyec/producto/updateProducto', productData);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await api.delete(`/Proyec/producto/deleteProducto/${id}`);
    return response.data;
  }
};

export const categoryService = {
  getAllCategories: async () => {
    const response = await api.get('/categoria/getAll');
    return response.data;
  },

  getCategoryById: async (id) => {
    const response = await api.get(`/categoria/findRecord/${id}`);
    return response.data;
  },

  createCategory: async (categoryData) => {
    const response = await api.post('/categoria/saveCategoria', categoryData);
    return response.data;
  },

  updateCategory: async (categoryData) => {
    const response = await api.post('/categoria/updateCategoria', categoryData);
    return response.data;
  },

  deleteCategory: async (id) => {
    const response = await api.delete(`/categoria/deleteCategoria/${id}`);
    return response.data;
  }
};

export const clientService = {
  getAllClients: async () => {
    const response = await api.get('/Proyec/cliente/getAll');
    return response.data;
  },

  getClientById: async (id) => {
    const response = await api.get(`/Proyec/cliente/findRecord/${id}`);
    return response.data;
  },

  createClient: async (clientData) => {
    const response = await api.post('/Proyec/cliente/saveCliente', clientData);
    return response.data;
  },

  updateClient: async (clientData) => {
    const response = await api.post('/Proyec/cliente/updateCliente', clientData);
    return response.data;
  },

  deleteClient: async (id) => {
    const response = await api.delete(`/Proyec/cliente/deleteCliente/${id}`);
    return response.data;
  }
};

export const orderService = {
  getAllOrders: async () => {
    const response = await api.get('/Proyec/venta/getAll');
    return response.data;
  },

  getOrderById: async (id) => {
    const response = await api.get(`/Proyec/venta/findRecord/${id}`);
    return response.data;
  },

  getOrdersByClient: async (clientId) => {
    const response = await api.get(`/Proyec/venta/historial/${clientId}`);
    return response.data;
  },

  createOrder: async (orderData) => {
    const response = await api.post('/Proyec/venta/realizarCompra', orderData);
    return response.data;
  },

  updateOrder: async (orderData) => {
    const response = await api.post('/Proyec/venta/updateVenta', orderData);
    return response.data;
  },

  deleteOrder: async (id) => {
    const response = await api.delete(`/Proyec/venta/deleteVenta/${id}`);
    return response.data;
  }
};

// ✅ SERVICIO DE USUARIOS COMPLETO
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

export const emailService = {
  sendEmail: async (emailData) => {
    const response = await api.post('/Proyec/mail/sendMail', emailData);
    return response.data;
  },

  sendEmailWithAttachment: async (emailData) => {
    const response = await api.post('/Proyec/mail/sendMailWithAttachment', emailData);
    return response.data;
  }
};

// 🆕 SERVICIO DE PARÁMETROS
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

export default api;