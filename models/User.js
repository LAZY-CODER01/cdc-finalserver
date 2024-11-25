const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['User', 'Team Leader', 'Superadmin'], default: 'User' },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' }
});
module.exports = mongoose.model('User', userSchema);
