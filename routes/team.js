const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');

// Create a new team
router.post('/', authMiddleware, roleMiddleware('Team Leader'), async (req, res) => {
  try {
    const { name } = req.body;

    // Check if the leader already has a team
    const existingTeam = await Team.findOne({ leaderId: req.user.id });
    if (existingTeam) {
      return res.status(400).json({ message: 'You have already created a team.' });
    }

    // Create a new team and add the team leader to the members array
    const team = new Team({ name, leaderId: req.user.id, members: [req.user.id] });
    await team.save();

    res.status(201).json({ message: 'Team created successfully', teamId: team._id });
  } catch (err) {
    res.status(500).json({ message: 'An error occurred', error: err.message });
  }
});

// Add members to a team
router.post('/addMembers', authMiddleware, roleMiddleware('Team Leader'), async (req, res) => {
  try {
    const { teamId, members } = req.body;

    // Find the team and check if the user is the leader
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    if (!team.leaderId.equals(req.user.id)) {
      return res.status(403).json({ message: 'You are not authorized to update this team.' });
    }

    // Retrieve the leader's password
    const leader = await User.findById(req.user.id);
    if (!leader) {
      return res.status(404).json({ message: 'Team leader not found.' });
    }

    // Ensure the team doesn't exceed 4 members
    if (team.members.length + members.length > 3) {
      return res.status(400).json({ message: 'A team cannot have more than 3 members.' });
    }

    for (const member of members) {
      // Check if the member already exists in the database
      let user = await User.findOne({ email: member.email });

      if (!user) {
        // Create a new user if they don't exist
        user = new User({
          name: member.name,
          email: member.email,
          phone: member.phone,
          password: leader.password, // Assign the leader's password
          role: 'User',
        });
        await user.save();
      }

      // Add the user to the team if not already added
      if (!team.members.includes(user._id)) {
        team.members.push(user._id);
        user.teamId = team._id;
        await user.save();
      }
    }

    // Save the updated team
    await team.save();

    res.status(200).json({ message: 'Members added successfully', team });
  } catch (err) {
    res.status(500).json({ message: 'An error occurred', error: err.message });
  }
});


// Get team details for the leader
router.get('/', authMiddleware, roleMiddleware('Team Leader'), async (req, res) => {
  try {
    // Find the team created by the logged-in leader
    const team = await Team.findOne({ leaderId: req.user.id }).populate('members', 'name email phone');

    if (!team) {
      return res.status(404).json({ message: 'No team found for this leader.' });
    }

    res.status(200).json({ team });
  } catch (err) {
    res.status(500).json({ message: 'An error occurred', error: err.message });
  }
});

module.exports = router;
