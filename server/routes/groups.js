const express = require('express');
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

// Create a new group
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, description, members } = req.body;

    const group = await Group.create({
      name,
      description,
      creator: req.user._id,
      members: [
        { user: req.user._id }, // Add creator as member
        ...members.map(memberId => ({ user: memberId }))
      ]
    });

    // Add group to all members' groups array
    await User.updateMany(
      { _id: { $in: [req.user._id, ...members] } },
      { $push: { groups: group._id } }
    );

    const populatedGroup = await Group.findById(group._id)
      .populate('creator', 'name email avatar')
      .populate('members.user', 'name email avatar');

    res.status(201).json({
      success: true,
      group: populatedGroup
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all groups for a user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const groups = await Group.find({ 'members.user': req.user._id })
      .populate('creator', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .populate('expenses')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      groups
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific group
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('creator', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .populate({
        path: 'expenses',
        populate: {
          path: 'paidBy splitBetween.user',
          select: 'name email avatar'
        }
      });

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is a member
    const isMember = group.members.some(member => 
      member.user._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Not authorized to access this group' });
    }

    res.json({
      success: true,
      group
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add member to group
router.post('/:id/members', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.body;
    const groupId = req.params.id;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is the creator
    if (group.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only group creator can add members' });
    }

    // Check if user is already a member
    const isAlreadyMember = group.members.some(member => 
      member.user.toString() === userId
    );

    if (isAlreadyMember) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    // Add member to group
    group.members.push({ user: userId });
    await group.save();

    // Add group to user's groups array
    await User.findByIdAndUpdate(userId, { $push: { groups: groupId } });

    const updatedGroup = await Group.findById(groupId)
      .populate('creator', 'name email avatar')
      .populate('members.user', 'name email avatar');

    // Emit real-time update
    const io = req.app.get('io');
    io.to(groupId).emit('memberAdded', updatedGroup);

    res.json({
      success: true,
      group: updatedGroup
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove member from group
router.delete('/:id/members/:userId', authMiddleware, async (req, res) => {
  try {
    const groupId = req.params.id;
    const userIdToRemove = req.params.userId;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is the creator or removing themselves
    if (group.creator.toString() !== req.user._id.toString() && 
        userIdToRemove !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to remove this member' });
    }

    // Remove member from group
    group.members = group.members.filter(member => 
      member.user.toString() !== userIdToRemove
    );
    await group.save();

    // Remove group from user's groups array
    await User.findByIdAndUpdate(userIdToRemove, { $pull: { groups: groupId } });

    const updatedGroup = await Group.findById(groupId)
      .populate('creator', 'name email avatar')
      .populate('members.user', 'name email avatar');

    // Emit real-time update
    const io = req.app.get('io');
    io.to(groupId).emit('memberRemoved', updatedGroup);

    res.json({
      success: true,
      group: updatedGroup
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
