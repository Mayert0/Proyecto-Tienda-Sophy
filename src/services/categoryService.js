// src/services/categoryService.js
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