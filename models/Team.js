const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  leaderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Members array
  ranking: { type: Number, default: 0 },
  payment: {
    status: {
      type: String,
      enum: ['incomplete','pending', 'accepted', 'rejected'],
      default: 'incomplete',
    },
    lastUpdated: { type: Date, default: Date.now } // Optional: track the last update
  }
});

module.exports = mongoose.model('Team', teamSchema);
