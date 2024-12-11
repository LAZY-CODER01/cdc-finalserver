const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');
const { ObjectId } = require('mongoose').Types; 
const mongoose = require('mongoose');

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


      // Update the team leader's user data with the teamId
      await User.findByIdAndUpdate(req.user.id, { teamId: team._id });
      console.log(team._id);


    res.status(201).json({ message: 'Team created successfully', teamId: team._id });
  } catch (err) {
    res.status(500).json({ message: 'An error occurred', error: err.message });
  }
});

// Get team details for the leader
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Find the team created by the logged-in leader
    const team = await Team.findOne({ leaderId: req.user.id }).populate('members', 'name email phone college universityRollNo codeforceHandle'); 

    if (!team) {
      return res.status(404).json({ message: 'No team found for this leader.' });
    }

    res.status(200).json({ team });
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

    // Ensure the team doesn't exceed 3 members (excluding the leader)
    if (team.members.length + members.length > 3) {
      return res.status(400).json({ message: 'A team cannot have more than 3 members.' });
    }
    const leader = await User.findById(team.leaderId);
    if (!leader) {
      return res.status(404).json({ message: 'Team leader not found' });
    }

    for (const member of members) {
      let user = await User.findOne({ email: member.email });
      if (!user) {
        user = new User({ 
          name: member.name, 
          email: member.email, 
          phone: member.phone, 
          universityRollNo: member.universityRollNo, 
          codeforceHandle: member.codeforceHandle ,
          college: leader.college,
          password: leader.password 
        });
        await user.save();
      }

      if (!team.members.includes(user._id)) {
        team.members.push(user._id);
        user.teamId = team._id;
        await user.save();
      }
    }

    await team.save();
    res.status(200).json({ message: 'Members added successfully', team });
  } catch (err) {
    res.status(500).json({ message: 'An error occurred', error: err.message });
  }
});

// Update team details (Team Leader can update the team name)
router.put('/:teamId', authMiddleware, roleMiddleware('Team Leader'), async (req, res) => {
  try {
    const { name } = req.body;
    const teamId = req.params.teamId;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (!team.leaderId.equals(req.user.id)) {
      return res.status(403).json({ message: 'You are not authorized to update this team.' });
    }

    team.name = name || team.name;
    await team.save();

    res.status(200).json({ message: 'Team updated successfully', team });
  } catch (err) {
    res.status(500).json({ message: 'An error occurred', error: err.message });
  }
});

// Update member details
router.put('/members/:memberId', authMiddleware, roleMiddleware('Team Leader'), async (req, res) => {
  try {
    const { name, email, phone, universityRollNo, codeforceHandle } = req.body;
    const memberId = req.params.memberId;

    const team = await Team.findOne({ leaderId: req.user.id });
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const member = await User.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    if (!team.members.includes(memberId)) {
      return res.status(403).json({ message: 'This user is not a member of your team' });
    }

    member.name = name || member.name;
    member.email = email || member.email;
    member.phone = phone || member.phone;
    member.universityRollNo = universityRollNo || member.universityRollNo;
    member.codeforceHandle = codeforceHandle || member.codeforceHandle;

    await member.save();

    res.status(200).json({ message: 'Member details updated successfully', member });
  } catch (err) {
    res.status(500).json({ message: 'An error occurred', error: err.message });
  }
});

// Fetch teamid details by teamName
router.get('/:teamName', authMiddleware, async (req, res) => {
  try {
    const { name } = req.params;

    // Find the team by ID and populate member details
    const team = await Team.findBy(name).populate('members', 'name email phone universityRollNo codeforceHandle');

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.status(200).json({ team });
  } catch (err) {
    res.status(500).json({ message: 'An error occurred', error: err.message });
  }
});

router.post('/paymentStatus', authMiddleware, async (req, res) => {
  try {
    const { teamId, paymentStatus } = req.body;
    console.log("post is running");
    // Validate input
    if (!teamId || !paymentStatus) {
      return res.status(400).json({ message: 'Team ID and payment status are required.' });
    }

    if (!['incomplete', 'pending', 'accepted', 'rejected'].includes(paymentStatus)) {
      return res.status(400).json({ message: 'Invalid payment status.' });
    }

    // Validate that teamId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      return res.status(400).json({ message: 'Invalid team ID format.' });
    }

    // Find and update the team's payment status
    const updatedTeam = await Team.findByIdAndUpdate(
      teamId,
      { 
        'payment.status': paymentStatus, 
        'payment.lastUpdated': new Date() 
      },
      { new: true } // Return the updated document
    );
    console.log(updatedTeam);

    if (!updatedTeam) {
      return res.status(404).json({ message: 'Team not found.' });
    }

    res.status(200).json({ message: 'Payment status updated successfully', team: updatedTeam });
  } catch (err) {
    console.error('Error occurred while updating payment status:', err);
    res.status(500).json({ message: 'Error updating payment status', error: err.message });
  }
});





module.exports = router;
