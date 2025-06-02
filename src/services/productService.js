// src/services/productService.js
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