// src/services/clientService.js
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