// src/hooks/useSystemParameters.js
import { useState, useEffect } from 'react';
import { parameterService } from '../services/api';

export const useSystemParameters = () => {
  const [parameters, setParameters] = useState({
    maxDailyProducts: 3,
    maxLoginAttempts: 3,
    ivaRate: 0.19,
    loading: true,
    error: null
  });

  const loadParameters = async () => {
    try {
      setParameters(prev => ({ ...prev, loading: true, error: null }));
      
      const [maxProducts, maxAttempts, ivaRate] = await Promise.all([
        parameterService.getMaxDailyProducts(),
        parameterService.getMaxLoginAttempts(),
        parameterService.getIvaRate()
      ]);

      setParameters({
        maxDailyProducts: maxProducts,
        maxLoginAttempts: maxAttempts,
        ivaRate: ivaRate,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error cargando parámetros del sistema:', error);
      setParameters(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
    }
  };

  useEffect(() => {
    loadParameters();
  }, []);

  const refreshParameters = () => {
    loadParameters();
  };

  return {
    ...parameters,
    refreshParameters
  };
};