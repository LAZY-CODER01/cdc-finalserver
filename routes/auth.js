const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password,phone, role, college, universityRollNo } = req.body;

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      role,
      college: college || 'MMMUT', // Default to MMMUT if not provided
      universityRollNo
    });

    await user.save();
    res.status(201).send('User created successfully');
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).send('Email or University Roll Number already exists');
    } else {
      res.status(400).send(err.message);
    }
  }
});


router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(404).send('User not found');

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send('Invalid credentials');

    // Generate token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);

    // Respond with token and userId
    res.json({ token, userId: user._id });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = router;
