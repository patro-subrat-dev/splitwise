const express = require('express');
const Expense = require('../models/Expense');
const Group = require('../models/Group');
const User = require('../models/User');
const router = express.Router();

// Middleware to verify token
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Create a new expense
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { description, amount, currency, groupId, splitBetween, category, date, notes } = req.body;

    // Verify group exists and user is a member
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const isMember = group.members.some(member => 
      member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Not authorized to add expenses to this group' });
    }

    // Validate split amounts sum equals total amount
    const totalSplitAmount = splitBetween.reduce((sum, split) => sum + split.amount, 0);
    if (Math.abs(totalSplitAmount - amount) > 0.01) {
      return res.status(400).json({ message: 'Split amounts must equal total expense amount' });
    }

    const expense = await Expense.create({
      description,
      amount,
      currency: currency || 'USD',
      paidBy: req.user._id,
      group: groupId,
      splitBetween,
      category: category || 'Other',
      date: date || new Date(),
      notes: notes || ''
    });

    // Add expense to group
    group.expenses.push(expense._id);
    await group.save();

    const populatedExpense = await Expense.findById(expense._id)
      .populate('paidBy', 'name email avatar')
      .populate('splitBetween.user', 'name email avatar')
      .populate('group', 'name');

    // Emit real-time update
    const io = req.app.get('io');
    io.to(groupId).emit('expenseAdded', populatedExpense);

    res.status(201).json({
      success: true,
      expense: populatedExpense
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all expenses for a group
router.get('/group/:groupId', authMiddleware, async (req, res) => {
  try {
    const { groupId } = req.params;

    // Verify user is a member of the group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const isMember = group.members.some(member => 
      member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Not authorized to access expenses for this group' });
    }

    const expenses = await Expense.find({ group: groupId })
      .populate('paidBy', 'name email avatar')
      .populate('splitBetween.user', 'name email avatar')
      .sort({ date: -1 });

    res.json({
      success: true,
      expenses
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific expense
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('paidBy', 'name email avatar')
      .populate('splitBetween.user', 'name email avatar')
      .populate('group', 'name members');

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Check if user is a member of the group
    const isMember = expense.group.members.some(member => 
      member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Not authorized to access this expense' });
    }

    res.json({
      success: true,
      expense
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update an expense
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { description, amount, currency, splitBetween, category, date, notes } = req.body;

    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Check if user is the one who paid or is group creator
    const group = await Group.findById(expense.group);
    const isAuthorized = expense.paidBy.toString() === req.user._id.toString() || 
                        group.creator.toString() === req.user._id.toString();

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to update this expense' });
    }

    // Validate split amounts sum equals total amount
    if (splitBetween && amount) {
      const totalSplitAmount = splitBetween.reduce((sum, split) => sum + split.amount, 0);
      if (Math.abs(totalSplitAmount - amount) > 0.01) {
        return res.status(400).json({ message: 'Split amounts must equal total expense amount' });
      }
    }

    // Update expense
    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      {
        description: description || expense.description,
        amount: amount || expense.amount,
        currency: currency || expense.currency,
        splitBetween: splitBetween || expense.splitBetween,
        category: category || expense.category,
        date: date || expense.date,
        notes: notes || expense.notes
      },
      { new: true }
    )
      .populate('paidBy', 'name email avatar')
      .populate('splitBetween.user', 'name email avatar')
      .populate('group', 'name');

    // Emit real-time update
    const io = req.app.get('io');
    io.to(expense.group.toString()).emit('expenseUpdated', updatedExpense);

    res.json({
      success: true,
      expense: updatedExpense
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete an expense
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Check if user is the one who paid or is group creator
    const group = await Group.findById(expense.group);
    const isAuthorized = expense.paidBy.toString() === req.user._id.toString() || 
                        group.creator.toString() === req.user._id.toString();

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to delete this expense' });
    }

    // Remove expense from group
    await Group.findByIdAndUpdate(expense.group, { $pull: { expenses: expense._id } });

    // Delete expense
    await Expense.findByIdAndDelete(req.params.id);

    // Emit real-time update
    const io = req.app.get('io');
    io.to(expense.group.toString()).emit('expenseDeleted', { expenseId: req.params.id });

    res.json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get balance summary for a group
router.get('/balances/:groupId', authMiddleware, async (req, res) => {
  try {
    const { groupId } = req.params;

    // Verify user is a member of the group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const isMember = group.members.some(member => 
      member.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Not authorized to access balances for this group' });
    }

    const expenses = await Expense.find({ group: groupId })
      .populate('paidBy', 'name email avatar')
      .populate('splitBetween.user', 'name email avatar');

    const balances = {};

    // Initialize balances for all group members
    group.members.forEach(member => {
      const userId = member.user.toString();
      balances[userId] = {
        user: member.user,
        name: member.user.name || 'Unknown',
        totalOwed: 0,
        totalPaid: 0,
        netBalance: 0
      };
    });

    // Calculate balances from expenses
    expenses.forEach(expense => {
      const paidById = expense.paidBy._id.toString();
      
      // Add to paid amount
      if (balances[paidById]) {
        balances[paidById].totalPaid += expense.amount;
      }

      // Add to owed amounts
      expense.splitBetween.forEach(split => {
        const userId = split.user._id.toString();
        if (balances[userId]) {
          balances[userId].totalOwed += split.amount;
        }
      });
    });

    // Calculate net balance
    Object.keys(balances).forEach(userId => {
      balances[userId].netBalance = balances[userId].totalPaid - balances[userId].totalOwed;
    });

    res.json({
      success: true,
      balances: Object.values(balances)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
