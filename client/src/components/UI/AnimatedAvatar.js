import React from 'react';
import { Avatar, Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';

const AnimatedAvatar = ({ name, avatar, size = 40, showName = false, sx = {} }) => {
  const getInitials = (name) => {
    return name.split(' ').map(word => word.charAt(0).toUpperCase()).join('').substring(0, 2);
  };

  const getAvatarColor = (name) => {
    const colors = [
      '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316',
      '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4',
      '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', ...sx }}>
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
      >
        <Avatar
          src={avatar}
          sx={{
            width: size,
            height: size,
            bgcolor: getAvatarColor(name),
            fontWeight: 600,
            fontSize: size / 2.5,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          }}
        >
          {avatar ? '' : getInitials(name)}
        </Avatar>
      </motion.div>
      {showName && (
        <Typography variant="body2" sx={{ ml: 1, fontWeight: 500 }}>
          {name}
        </Typography>
      )}
    </Box>
  );
};

export default AnimatedAvatar;
