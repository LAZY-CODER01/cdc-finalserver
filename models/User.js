const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  phone: { type: String, default: '' },
  role: { type: String, enum: ['User', 'Team Leader', 'Superadmin'], default: 'User' },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  college: { type: String, default: 'MMMUT' },
  universityRollNo: { type: String, unique: true, required: true },
  codeforceHandle: { type: String, default: '' }  
});

module.exports = mongoose.model('User', userSchema);
