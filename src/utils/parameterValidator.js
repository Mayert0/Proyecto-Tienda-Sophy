// src/utils/parameterValidator.js - CREAR ESTE ARCHIVO
export const validateParameters = {
  maxDailyProducts: (value) => {
    const num = parseInt(value);
    if (isNaN(num) || num < 1 || num > 10) {
      return { valid: false, message: 'Debe ser un número entre 1 y 10' };
    }
    return { valid: true };
  },

  maxLoginAttempts: (value) => {
    const num = parseInt(value);
    if (isNaN(num) || num < 1 || num > 10) {
      return { valid: false, message: 'Debe ser un número entre 1 y 10' };
    }
    return { valid: true };
  },

  ivaRate: (value) => {
    const num = parseFloat(value);
    if (isNaN(num) || num < 0 || num > 50) {
      return { valid: false, message: 'Debe ser un porcentaje entre 0 y 50' };
    }
    return { valid: true };
  }
};

export default validateParameters;