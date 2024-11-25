const mongoose = require('mongoose');
const teamSchema = new mongoose.Schema({
  name: String,
  leaderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Members array
  ranking: { type: Number, default: 0 }
});

module.exports = mongoose.model('Team', teamSchema);
