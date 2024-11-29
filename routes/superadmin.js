const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Team = require('../models/Team');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');



router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const admin = await User.findById(req.user.id); // Assuming `req.user.id` is the admin's ID
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        res.json(admin);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching admin profile', error: err.message });
    }
  });
  
  // Update admin profile
  router.put('/profile', authMiddleware, async (req, res) => {
      try {
          const { name, email, password } = req.body;
          const updateData = { name, email };
          if (password) {
              const hashedPassword = await bcrypt.hash(password, 10);
              updateData.password = hashedPassword;
            }
            
            const updatedAdmin = await User.findByIdAndUpdate(req.user.id, updateData, { new: true });
            res.json({ message: 'Profile updated successfully', admin: updatedAdmin });
        } catch (err) {
            res.status(500).json({ message: 'Error updating admin profile', error: err.message });
        }
    });
    
    // Get all users
    
    router.get('/users', authMiddleware, roleMiddleware('Superadmin'), async (req, res) => {
        try {
            const users = await User.find().populate('teamId', 'name ranking');
            res.status(200).json(users);
        } catch (err) {
            res.status(500).json({ message: 'Error fetching users', error: err.message });
        }
    });

// Create a new user
router.post('/users', authMiddleware, roleMiddleware('Superadmin'), async (req, res) => {
  try {
    const { name, email, password, role, college, universityRollNo } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
      college,
      universityRollNo,
    });
    await newUser.save();
    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (err) {
    res.status(400).json({ message: 'Error creating user', error: err.message });
  }
});

// Update a user
router.put('/users/:userId', authMiddleware, roleMiddleware('Superadmin'), async (req, res) => {
  try {
    const { name, email,phone, role, college, universityRollNo,codeforceHandle  } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      { name, email, role, college, universityRollNo,codeforceHandle  },
      { new: true }
    );
    res.status(200).json({ message: 'User updated successfully', user: updatedUser });
  } catch (err) {
    res.status(400).json({ message: 'Error updating user', error: err.message });
  }
});

// Delete a user
router.delete('/users/:userId', authMiddleware, roleMiddleware('Superadmin'), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.userId);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting user', error: err.message });
  }
});

// Get all teams
router.get('/teams', authMiddleware, roleMiddleware('Superadmin'), async (req, res) => {
  try {
    const teams = await Team.find().populate('members', 'name email');
    res.status(200).json(teams);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching teams', error: err.message });
  }
});

// Update a team's ranking
router.put('/teams/:teamId', authMiddleware, roleMiddleware('Superadmin'), async (req, res) => {
  try {
    const { ranking } = req.body;
    const updatedTeam = await Team.findByIdAndUpdate(req.params.teamId, { ranking }, { new: true });
    res.status(200).json({ message: 'Ranking updated', team: updatedTeam });
  } catch (err) {
    res.status(400).json({ message: 'Error updating ranking', error: err.message });
  }
});

// Delete a team
router.delete('/teams/:teamId', authMiddleware, roleMiddleware('Superadmin'), async (req, res) => {
  try {
    await Team.findByIdAndDelete(req.params.teamId);
    res.status(200).json({ message: 'Team deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting team', error: err.message });
  }
});

// Update a team's payment status
router.put('/teams/:teamId/payment', authMiddleware, roleMiddleware('Superadmin'), async (req, res) => {
    try {
      const { status } = req.body;
      if (!['pending', 'accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid payment status' });
      }
  
      const updatedTeam = await Team.findByIdAndUpdate(
        req.params.teamId,
        { 'payment.status': status, 'payment.lastUpdated': new Date() },
        { new: true }
      );
  
      if (!updatedTeam) {
        return res.status(404).json({ message: 'Team not found' });
      }
  
      res.status(200).json({ message: 'Payment status updated successfully', team: updatedTeam });
    } catch (err) {
      res.status(500).json({ message: 'Error updating payment status', error: err.message });
    }
  });

  
module.exports = router;
