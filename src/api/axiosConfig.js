// src/api/axiosConfig.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8092';

const axiosConfig = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor para requests
axiosConfig.interceptors.request.use(
  (config) => {
    console.log('Enviando request a:', config.url);
    return config;
  },
  (error) => {
    console.error('Error en request:', error);
    return Promise.reject(error);
  }
);

// Interceptor para responses
axiosConfig.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Error en response:', error);
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosConfig;