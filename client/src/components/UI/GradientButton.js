import React from 'react';
import { Button, Box } from '@mui/material';
import { motion } from 'framer-motion';

const GradientButton = ({ children, sx = {}, ...props }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Button
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontWeight: 600,
          padding: '12px 32px',
          borderRadius: '12px',
          textTransform: 'none',
          fontSize: '16px',
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
          '&:hover': {
            background: 'linear-gradient(135deg, #5a67d8 0%, #6b46a1 100%)',
            boxShadow: '0 6px 20px rgba(102, 126, 234, 0.6)',
          },
          '&:active': {
            boxShadow: '0 2px 10px rgba(102, 126, 234, 0.4)',
          },
          ...sx
        }}
        {...props}
      >
        {children}
      </Button>
    </motion.div>
  );
};

export default GradientButton;
