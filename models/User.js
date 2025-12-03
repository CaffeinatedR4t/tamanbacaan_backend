const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  nik: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  addressRtRw: { type: String, required: true },
  addressKelurahan: { type: String, required: true },
  addressKecamatan: { type: String, required: true },
  phoneNumber: { type: String },
  parentName: { type: String },
  isChild: { type: Boolean, default: false },
  role: { type: String, enum: ['MEMBER', 'ADMIN'], default: 'MEMBER' },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);