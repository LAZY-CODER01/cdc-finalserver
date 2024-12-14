const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid'); 
const crypto = require('crypto');

const OTP_EXPIRATION_TIME = 10 * 60 * 1000; // OTP validity duration (10 minutes)

let otpStorage = {}; // Format: { email: { otp: string, createdAt: number } }

const sendVerificationEmail = (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 465, // Use your email service
    auth: {
      user: "cdcmmmutotp@gmail.com", // EmailJS User ID
      pass: process.env.EMAILJS_PASS, // Your email password or app-specific password
    },
  });

  const mailOptions = {
    from: 'cdcmmmutotp@gmail.com',
    to: email,
    subject: 'Email Verification',
    text: `Your OTP for email verification is: ${otp}`,
  };

  return transporter.sendMail(mailOptions);
};

const generateOtp = () => {
  return uuidv4().split('-')[0]; // Generates a short unique ID for OTP
};

router.post('/verify-email', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const otp = generateOtp();
  otpStorage[email] = { otp, createdAt: Date.now() };

  try {
    await sendVerificationEmail(email, otp);
    res.status(200).json({ message: 'Verification email sent' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending verification email', error: error.message });
  }
});

router.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  const storedOtp = otpStorage[email];

  if (!storedOtp) {
    return res.status(400).json({ message: 'No OTP found for this email' });
  }

  const { otp: storedOtpCode, createdAt } = storedOtp;
  const otpExpiryTime = 10 * 60 * 1000; // OTP expires after 10 minutes

  if (Date.now() - createdAt > otpExpiryTime) {
    delete otpStorage[email];
    return res.status(400).json({ message: 'OTP expired' });
  }

  if (storedOtpCode !== otp) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }

  delete otpStorage[email]; // OTP is valid, delete it from memory
  res.status(200).json({ message: 'OTP verified successfully' });
});

// Signup route
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, phone, role, college, universityRollNo } = req.body;

    // Input validation
    if (name.split(' ').length < 2 || name.split(' ')[0].length < 2) {
      return res.status(400).send('First name should be at least 2 characters long');
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).send('Invalid email format');
    }
    if (password.length < 8) {
      return res.status(400).send('Password should be at least 8 characters long');
    }

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
      universityRollNo,
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

// Login route
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
