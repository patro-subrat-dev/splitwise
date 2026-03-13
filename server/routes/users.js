const express = require('express');
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

// Search users by email or name
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.status(400).json({ message: 'Query must be at least 2 characters long' });
    }

    const users = await User.find({
      $and: [
        {
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } }
          ]
        },
        { _id: { $ne: req.user._id } } // Exclude current user
      ]
    })
    .select('name email avatar')
    .limit(10);

    res.json({
      success: true,
      users
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('friends', 'name email avatar')
      .populate('groups', 'name description createdAt');

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, phoneNumber, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        name: name || req.user.name,
        phoneNumber: phoneNumber || req.user.phoneNumber,
        avatar: avatar || req.user.avatar
      },
      { new: true }
    )
    .select('name email avatar phoneNumber');

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add friend
router.post('/friends', authMiddleware, async (req, res) => {
  try {
    const { friendId } = req.body;

    if (friendId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot add yourself as a friend' });
    }

    const friend = await User.findById(friendId);
    if (!friend) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already friends
    const alreadyFriends = req.user.friends.includes(friendId);
    if (alreadyFriends) {
      return res.status(400).json({ message: 'Already friends with this user' });
    }

    // Add friend to both users
    await User.findByIdAndUpdate(req.user._id, { $push: { friends: friendId } });
    await User.findByIdAndUpdate(friendId, { $push: { friends: req.user._id } });

    const updatedUser = await User.findById(req.user._id)
      .populate('friends', 'name email avatar');

    res.json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove friend
router.delete('/friends/:friendId', authMiddleware, async (req, res) => {
  try {
    const { friendId } = req.params;

    // Remove friend from both users
    await User.findByIdAndUpdate(req.user._id, { $pull: { friends: friendId } });
    await User.findByIdAndUpdate(friendId, { $pull: { friends: req.user._id } });

    const updatedUser = await User.findById(req.user._id)
      .populate('friends', 'name email avatar');

    res.json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get friends list
router.get('/friends', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('friends', 'name email avatar phoneNumber');

    res.json({
      success: true,
      friends: user.friends
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
