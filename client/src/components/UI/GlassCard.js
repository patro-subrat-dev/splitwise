import React from 'react';
import { Paper, Box } from '@mui/material';
import { motion } from 'framer-motion';

const GlassCard = ({ children, sx = {}, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Paper
        sx={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
          borderRadius: '16px',
          overflow: 'hidden',
          ...sx
        }}
        {...props}
      >
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      </Paper>
    </motion.div>
  );
};

export default GlassCard;
