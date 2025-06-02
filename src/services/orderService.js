// src/services/orderService.js
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