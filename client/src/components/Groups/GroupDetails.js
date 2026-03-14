import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Alert,
  Menu,
  MenuItem
} from '@mui/material';
import { Add, MoreVert, PersonAdd, PersonRemove } from '@mui/icons-material';
import axios from 'axios';
import { useSocket } from '../../contexts/SocketContext';

const GroupDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { socket, joinGroup, leaveGroup } = useSocket();
  
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    fetchGroupData();
    
    if (socket) {
      joinGroup(id);
      
      socket.on('expenseAdded', (newExpense) => {
        setExpenses(prev => [newExpense, ...prev]);
      });
      
      socket.on('expenseUpdated', (updatedExpense) => {
        setExpenses(prev => prev.map(exp => 
          exp._id === updatedExpense._id ? updatedExpense : exp
        ));
      });
      
      socket.on('expenseDeleted', ({ expenseId }) => {
        setExpenses(prev => prev.filter(exp => exp._id !== expenseId));
      });
      
      socket.on('memberAdded', (updatedGroup) => {
        setGroup(updatedGroup);
      });
      
      socket.on('memberRemoved', (updatedGroup) => {
        setGroup(updatedGroup);
      });
    }
    
    return () => {
      if (socket) {
        leaveGroup(id);
      }
    };
  }, [id, socket, joinGroup, leaveGroup]);

  const fetchGroupData = async () => {
    try {
      const [groupRes, expensesRes, balancesRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/groups/${id}`),
        axios.get(`http://localhost:5000/api/expenses/group/${id}`),
        axios.get(`http://localhost:5000/api/expenses/balances/${id}`)
      ]);
      
      setGroup(groupRes.data.group);
      setExpenses(expensesRes.data.expenses);
      setBalances(balancesRes.data.balances);
    } catch (error) {
      console.error('Error fetching group data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    try {
      await axios.post(`http://localhost:5000/api/groups/${id}/members`, {
        userId: selectedUsers[0]._id
      });
      
      setAddMemberDialogOpen(false);
      setSelectedUsers([]);
    } catch (error) {
      console.error('Error adding member:', error);
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      await axios.delete(`http://localhost:5000/api/groups/${id}/members/${memberId}`);
      handleCloseMenu();
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  const handleSearchUsers = async (query) => {
    if (query.length < 2) return [];
    
    try {
      const response = await axios.get(`http://localhost:5000/api/users/search?query=${query}`);
      const users = response.data.users.filter(user => 
        !group.members.some(member => member.user._id === user._id)
      );
      return users;
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  };

  const handleMenuClick = (event, member) => {
    setAnchorEl(event.currentTarget);
    setSelectedMember(member);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedMember(null);
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getBalanceColor = (balance) => {
    if (balance > 0) return 'success.main';
    if (balance < 0) return 'error.main';
    return 'text.secondary';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Group Header */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="start">
              <Box>
                <Typography variant="h4" gutterBottom>
                  {group.name}
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  {group.description || 'No description'}
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  <Chip label={`${group.members.length} members`} size="small" />
                  <Chip label={`${expenses.length} expenses`} size="small" />
                </Box>
              </Box>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate(`/add-expense/${id}`)}
              >
                Add Expense
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Members Section */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Members</Typography>
              <IconButton onClick={() => setAddMemberDialogOpen(true)} size="small">
                <PersonAdd />
              </IconButton>
            </Box>
            <List>
              {group.members.map((member) => (
                <ListItem key={member.user._id}>
                  <ListItemAvatar>
                    <Avatar>
                      {member.user.name.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={member.user.name}
                    secondary={member.user.email}
                  />
                  {group.creator._id !== member.user._id && (
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, member.user)}
                    >
                      <MoreVert />
                    </IconButton>
                  )}
                </ListItem>
              ))}
            </List>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleCloseMenu}
            >
              <MenuItem onClick={() => handleRemoveMember(selectedMember._id)}>
                <PersonRemove sx={{ mr: 1 }} />
                Remove from group
              </MenuItem>
            </Menu>
          </Paper>
        </Grid>

        {/* Balances Section */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Balances
            </Typography>
            {balances.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No balances yet. Add expenses to see balances.
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {balances.map((balance) => (
                  <Grid item xs={12} sm={6} key={balance.user._id}>
                    <Box display="flex" alignItems="center" p={2} border={1} borderColor="divider" borderRadius={1}>
                      <Avatar sx={{ mr: 2 }}>
                        {balance.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box flexGrow={1}>
                        <Typography variant="body1">{balance.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Paid: {formatCurrency(balance.totalPaid)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Owed: {formatCurrency(balance.totalOwed)}
                        </Typography>
                      </Box>
                      <Typography
                        variant="h6"
                        color={getBalanceColor(balance.netBalance)}
                        fontWeight="bold"
                      >
                        {balance.netBalance >= 0 ? '+' : ''}
                        {formatCurrency(balance.netBalance)}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Grid>

        {/* Recent Expenses */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Expenses
            </Typography>
            {expenses.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No expenses yet. Add your first expense to get started!
              </Typography>
            ) : (
              <List>
                {expenses.map((expense, index) => (
                  <React.Fragment key={expense._id}>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body1" fontWeight="medium">
                              {expense.description}
                            </Typography>
                            <Typography variant="body1" fontWeight="bold">
                              {formatCurrency(expense.amount, expense.currency)}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Paid by {expense.paidBy.name} • {new Date(expense.date).toLocaleDateString()}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Split between: {expense.splitBetween.map(split => split.user.name).join(', ')}
                            </Typography>
                            <Chip label={expense.category} size="small" sx={{ mt: 1 }} />
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < expenses.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Add Member Dialog */}
      <Dialog open={addMemberDialogOpen} onClose={() => setAddMemberDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Member to Group</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Search Users"
            fullWidth
            variant="outlined"
            onChange={(e) => {
              if (e.target.value.length >= 2) {
                handleSearchUsers(e.target.value).then(setAvailableUsers);
              }
            }}
          />
          {availableUsers.length > 0 && (
            <Box mt={2}>
              {availableUsers.map((user) => (
                <Box
                  key={user._id}
                  p={1}
                  border={1}
                  borderColor="divider"
                  borderRadius={1}
                  mb={1}
                  sx={{ cursor: 'pointer' }}
                  onClick={() => setSelectedUsers([user])}
                  bgcolor={selectedUsers[0]?._id === user._id ? 'action.selected' : 'transparent'}
                >
                  <Typography variant="body1">{user.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{user.email}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddMemberDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddMember} variant="contained" disabled={selectedUsers.length === 0}>
            Add Member
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default GroupDetails;
