import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Button,
  Box,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Add,
  Group,
  PeopleAlt,
  Receipt,
  Search,
  MoreVert
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from 'axios';
import GlassCard from '../UI/GlassCard';
import GradientButton from '../UI/GradientButton';
import AnimatedAvatar from '../UI/AnimatedAvatar';

const Dashboard = () => {
  const [groups, setGroups] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '', members: [] });
  const [stats, setStats] = useState({ totalGroups: 0, totalFriends: 0, totalExpenses: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [groupsRes, friendsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/groups'),
        axios.get('http://localhost:5000/api/users/friends')
      ]);
      
      setGroups(groupsRes.data.groups);
      setFriends(friendsRes.data.friends);
      
      // Calculate stats
      const totalExpenses = groupsRes.data.groups.reduce((acc, group) => 
        acc + (group.expenses?.length || 0), 0
      );
      
      setStats({
        totalGroups: groupsRes.data.groups.length,
        totalFriends: friendsRes.data.friends.length,
        totalExpenses
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/groups', {
        name: newGroup.name,
        description: newGroup.description,
        members: newGroup.members.map(member => member._id)
      });
      
      setGroups([...groups, response.data.group]);
      setStats(prev => ({ ...prev, totalGroups: prev.totalGroups + 1 }));
      setCreateDialogOpen(false);
      setNewGroup({ name: '', description: '', members: [] });
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  const handleSearchUsers = async (query) => {
    if (query.length < 2) return [];
    
    try {
      const response = await axios.get(`http://localhost:5000/api/users/search?query=${query}`);
      return response.data.users;
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <CircularProgress size={60} thickness={4} />
        </motion.div>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box mb={4}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}
          >
            Welcome back!
          </Typography>
          <Typography variant="h6" color="text.secondary" fontWeight={400}>
            Manage your expenses and groups effortlessly
          </Typography>
        </Box>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={4}>
            <motion.div variants={itemVariants}>
              <GlassCard>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight={700} color="#6366f1">
                      {stats.totalGroups}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Groups
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Group sx={{ color: 'white', fontSize: 30 }} />
                  </Box>
                </Box>
              </GlassCard>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={4}>
            <motion.div variants={itemVariants}>
              <GlassCard>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight={700} color="#10b981">
                      {stats.totalFriends}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Friends
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <PeopleAlt sx={{ color: 'white', fontSize: 30 }} />
                  </Box>
                </Box>
              </GlassCard>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={4}>
            <motion.div variants={itemVariants}>
              <GlassCard>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" fontWeight={700} color="#f59e0b">
                      {stats.totalExpenses}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Expenses
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Receipt sx={{ color: 'white', fontSize: 30 }} />
                  </Box>
                </Box>
              </GlassCard>
            </motion.div>
          </Grid>
        </Grid>
      </motion.div>

      <Grid container spacing={4}>
        {/* Groups Section */}
        <Grid item xs={12} lg={8}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <GlassCard>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" fontWeight={700}>
                  My Groups
                </Typography>
                <GradientButton
                  startIcon={<Add />}
                  onClick={() => setCreateDialogOpen(true)}
                  size="small"
                >
                  Create Group
                </GradientButton>
              </Box>
              
              {groups.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Box textAlign="center" py={6}>
                    <motion.div
                      animate={{ 
                        y: [0, -10, 0],
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Group sx={{ fontSize: 80, color: '#6366f1', mb: 3 }} />
                    </motion.div>
                    <Typography variant="h6" color="text.secondary" mb={2}>
                      No groups yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={3}>
                      Create your first group to start splitting expenses with friends
                    </Typography>
                    <GradientButton
                      startIcon={<Add />}
                      onClick={() => setCreateDialogOpen(true)}
                    >
                      Create Your First Group
                    </GradientButton>
                  </Box>
                </motion.div>
              ) : (
                <Grid container spacing={3}>
                  {groups.map((group, index) => (
                    <Grid item xs={12} sm={6} key={group._id}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                    <GlassCard sx={{ cursor: 'pointer' }} onClick={() => navigate(`/group/${group._id}`)}>
                      <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                        <Typography variant="h6" fontWeight={600}>
                          {group.name}
                        </Typography>
                        <IconButton size="small">
                          <MoreVert fontSize="small" />
                        </IconButton>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" mb={2} sx={{ 
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {group.description || 'No description available'}
                      </Typography>
                      
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <PeopleAlt sx={{ fontSize: 16, color: '#6366f1' }} />
                          <Typography variant="body2" color="text.secondary">
                            {group.members.length} members
                          </Typography>
                        </Box>
                        <Chip 
                          label={`${group.expenses?.length || 0} expenses`} 
                          size="small" 
                          sx={{ 
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            color: 'white'
                          }} 
                        />
                      </Box>
                      
                      <Box display="flex" alignItems="center">
                        <Box display="flex" mr={1}>
                          {group.members.slice(0, 4).map((member, idx) => (
                            <AnimatedAvatar
                              key={member.user._id}
                              name={member.user.name}
                              avatar={member.user.avatar}
                              size={32}
                              sx={{ ml: idx === 0 ? 0 : -1 }}
                            />
                          ))}
                        </Box>
                        {group.members.length > 4 && (
                          <Typography variant="body2" color="text.secondary" ml={1}>
                            +{group.members.length - 4}
                          </Typography>
                        )}
                      </Box>
                    </GlassCard>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              )}
            </GlassCard>
          </motion.div>
        </Grid>

        {/* Friends Section */}
        <Grid item xs={12} lg={4}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <GlassCard>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" fontWeight={700}>
                  Friends
                </Typography>
                <Tooltip title="Add friends">
                  <IconButton size="small">
                    <Search />
                  </IconButton>
                </Tooltip>
              </Box>
              
              {friends.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Box textAlign="center" py={4}>
                    <motion.div
                      animate={{ 
                        rotate: [0, 10, -10, 0],
                      }}
                      transition={{ 
                        duration: 3, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <PeopleAlt sx={{ fontSize: 60, color: '#10b981', mb: 2 }} />
                    </motion.div>
                    <Typography variant="body2" color="text.secondary">
                      No friends yet. Search and add friends to split expenses!
                    </Typography>
                  </Box>
                </motion.div>
              ) : (
                <Box>
                  {friends.map((friend, index) => (
                    <motion.div
                      key={friend._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      whileHover={{ x: 5 }}
                    >
                      <Box 
                        display="flex" 
                        alignItems="center" 
                        py={2}
                        sx={{ 
                          borderRadius: 2,
                          px: 2,
                          '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.05)' }
                        }}
                      >
                        <AnimatedAvatar
                          name={friend.name}
                          avatar={friend.avatar}
                          size={40}
                        />
                        <Box ml={2} flexGrow={1}>
                          <Typography variant="body1" fontWeight={500}>
                            {friend.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {friend.email}
                          </Typography>
                        </Box>
                        <Tooltip title="View expenses">
                          <IconButton size="small">
                            <Receipt fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </motion.div>
                  ))}
                </Box>
              )}
            </GlassCard>
          </motion.div>
        </Grid>
      </Grid>

      {/* Create Group Dialog */}
      <Dialog 
        open={createDialogOpen} 
        onClose={() => setCreateDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.5rem' }}>
          Create New Group
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Group Name"
            fullWidth
            variant="outlined"
            value={newGroup.name}
            onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
            sx={{ mb: 3 }}
          />
          <TextField
            margin="dense"
            label="Description (Optional)"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={newGroup.description}
            onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
            sx={{ mb: 3 }}
          />
          <Autocomplete
            multiple
            options={[]}
            getOptionLabel={(option) => `${option.name} (${option.email})`}
            filterOptions={(options, state) => {
              return handleSearchUsers(state.inputValue).then(results => results);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Add Members"
                placeholder="Search users..."
                variant="outlined"
              />
            )}
            value={newGroup.members}
            onChange={(event, newValue) => {
              setNewGroup({ ...newGroup, members: newValue });
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setCreateDialogOpen(false)} sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <GradientButton 
            onClick={handleCreateGroup} 
            disabled={!newGroup.name}
          >
            Create Group
          </GradientButton>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard;
