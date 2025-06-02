// src/components/Loader/Loader.js
import React from 'react';
import { CircularProgress, Box, Typography } from '@mui/material';

const Loader = ({ message = 'Cargando...', size = 40 }) => {
  return (
    <Box 
      display="flex" 
      flexDirection="column"
      justifyContent="center" 
      alignItems="center" 
      minHeight="200px"
      gap={2}
    >
      <CircularProgress size={size} />
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
};

export default Loader;