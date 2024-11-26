const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const teamRoutes = require('./routes/team');
const leaderboardRoutes = require('./routes/leaderboard');

dotenv.config();
const app = express();
app.use(express.json());
const corsOptions = {
  origin: ['https://cdc-main.vercel.app'], // Replace with your frontend URL(s)
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow only required methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Include any necessary headers
  credentials: true, // Enable if cookies or authentication are required
};

app.use(cors(corsOptions));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/',(req,res)=>{
  res.send('Welcome to the API');
})
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
