import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Chip,
  Badge
} from '@mui/material';
import {
  AccountCircle,
  Add,
  Notifications,
  Home,
  Groups,
  People
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import AnimatedAvatar from '../UI/AnimatedAvatar';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleClose();
  };

  const handleProfile = () => {
    navigate('/profile');
    handleClose();
  };

  const navItems = [
    { label: 'Dashboard', icon: <Home />, path: '/dashboard' },
    { label: 'Groups', icon: <Groups />, path: '/groups' },
    { label: 'Friends', icon: <People />, path: '/friends' },
  ];

  if (!isAuthenticated) {
    return null;
  }

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
        color: '#1e293b',
      }}
    >
      <Toolbar sx={{ minHeight: 80 }}>
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Box
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              mr: 4
            }}
            onClick={() => navigate('/dashboard')}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2,
                fontWeight: 'bold',
                color: 'white',
                fontSize: '18px'
              }}
            >
              S
            </Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Splitwise
            </Typography>
          </Box>
        </motion.div>

        {/* Navigation Items */}
        <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
          {navItems.map((item, index) => (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Button
                onClick={() => navigate(item.path)}
                sx={{
                  px: 3,
                  py: 1,
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '14px',
                  color: location.pathname === item.path ? '#6366f1' : '#64748b',
                  background: location.pathname === item.path 
                    ? 'rgba(99, 102, 241, 0.1)' 
                    : 'transparent',
                  '&:hover': {
                    background: 'rgba(99, 102, 241, 0.05)',
                    color: '#6366f1',
                  },
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                {item.icon}
                {item.label}
              </Button>
            </motion.div>
          ))}
        </Box>

        {/* Right Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <IconButton
              size="small"
              sx={{
                width: 40,
                height: 40,
                borderRadius: '12px',
                background: 'rgba(99, 102, 241, 0.05)',
                color: '#6366f1',
                '&:hover': {
                  background: 'rgba(99, 102, 241, 0.1)',
                },
              }}
            >
              <Badge badgeContent={3} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </motion.div>

          {/* Create Group Button */}
          {location.pathname === '/dashboard' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/create-group')}
                sx={{
                  px: 3,
                  py: 1,
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '14px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5a67d8 0%, #6b46a1 100%)',
                    boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
                  },
                }}
              >
                Create Group
              </Button>
            </motion.div>
          )}

          {/* User Profile */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.6 }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                px: 2,
                py: 1,
                borderRadius: '12px',
                cursor: 'pointer',
                '&:hover': {
                  background: 'rgba(99, 102, 241, 0.05)',
                },
              }}
              onClick={handleMenu}
            >
              <Box textAlign="right">
                <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                  {user?.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>
              <AnimatedAvatar
                name={user?.name || 'User'}
                avatar={user?.avatar}
                size={36}
              />
            </Box>
          </motion.div>

          {/* Profile Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            PaperProps={{
              sx: {
                mt: 2,
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                minWidth: 200,
              }
            }}
          >
            <MenuItem onClick={handleProfile} sx={{ borderRadius: '8px', mx: 1, my: 0.5 }}>
              <AccountCircle sx={{ mr: 2, color: '#6366f1' }} />
              Profile
            </MenuItem>
            <MenuItem onClick={handleLogout} sx={{ borderRadius: '8px', mx: 1, my: 0.5 }}>
              <AccountCircle sx={{ mr: 2, color: '#ef4444' }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
