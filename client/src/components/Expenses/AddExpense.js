import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';

const AddExpense = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  
  const [group, setGroup] = useState(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    currency: 'USD',
    category: 'Other',
    date: new Date(),
    notes: ''
  });
  const [splits, setSplits] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = ['Food', 'Transport', 'Entertainment', 'Bills', 'Shopping', 'Healthcare', 'Education', 'Other'];
  const currencies = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CNY'];

  useEffect(() => {
    fetchGroupData();
  }, [groupId]);

  const fetchGroupData = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/groups/${groupId}`);
      setGroup(response.data.group);
      
      // Initialize equal splits
      const equalSplit = response.data.group.members.map(member => ({
        user: member.user,
        amount: 0,
        paid: false
      }));
      setSplits(equalSplit);
    } catch (error) {
      console.error('Error fetching group data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleDateChange = (newDate) => {
    setFormData({
      ...formData,
      date: newDate
    });
  };

  const handleSplitChange = (userId, amount) => {
    setSplits(splits.map(split => 
      split.user._id === userId 
        ? { ...split, amount: parseFloat(amount) || 0 }
        : split
    ));
  };

  const handleEqualSplit = () => {
    const amountPerPerson = parseFloat(formData.amount) / splits.length;
    setSplits(splits.map(split => ({
      ...split,
      amount: amountPerPerson || 0
    })));
  };

  const validateForm = () => {
    if (!formData.description.trim()) {
      setError('Description is required');
      return false;
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Amount must be greater than 0');
      return false;
    }

    const totalSplit = splits.reduce((sum, split) => sum + split.amount, 0);
    if (Math.abs(totalSplit - parseFloat(formData.amount)) > 0.01) {
      setError('Split amounts must equal total expense amount');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/expenses', {
        description: formData.description,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        groupId,
        splitBetween: splits.map(split => ({
          user: split.user._id,
          amount: split.amount
        })),
        category: formData.category,
        date: formData.date,
        notes: formData.notes
      });

      navigate(`/group/${groupId}`);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  if (!group) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  const totalSplit = splits.reduce((sum, split) => sum + split.amount, 0);
  const remainingAmount = parseFloat(formData.amount || 0) - totalSplit;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Add Expense
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Group: {group.name}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Expense Details
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Amount"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleInputChange}
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Currency</InputLabel>
                <Select
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                >
                  {currencies.map(currency => (
                    <MenuItem key={currency} value={currency}>
                      {currency}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date"
                  value={formData.date}
                  onChange={handleDateChange}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes (Optional)"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                multiline
                rows={3}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>

            {/* Split Information */}
            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Split Between
                </Typography>
                <Button onClick={handleEqualSplit} variant="outlined" size="small">
                  Split Equally
                </Button>
              </Box>
              
              {splits.map((split) => (
                <Box key={split.user._id} mb={2}>
                  <Typography variant="body2" gutterBottom>
                    {split.user.name}
                  </Typography>
                  <TextField
                    fullWidth
                    label="Amount"
                    type="number"
                    value={split.amount || ''}
                    onChange={(e) => handleSplitChange(split.user._id, e.target.value)}
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Box>
              ))}
              
              <Box mt={2} p={2} bgcolor="grey.100" borderRadius={1}>
                <Typography variant="body2" color="text.secondary">
                  Total Split: ${totalSplit.toFixed(2)}
                </Typography>
                <Typography variant="body2" color={remainingAmount >= 0 ? 'success.main' : 'error.main'}>
                  Remaining: ${Math.abs(remainingAmount).toFixed(2)}
                </Typography>
              </Box>
            </Grid>

            {/* Actions */}
            <Grid item xs={12}>
              <Box display="flex" gap={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={() => navigate(`/group/${groupId}`)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? 'Adding...' : 'Add Expense'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default AddExpense;
