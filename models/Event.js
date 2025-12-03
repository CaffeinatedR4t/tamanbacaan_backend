const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  createdBy: { type: mongoose.Schema. Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date. now },
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.models.Event || mongoose.model('Event', eventSchema);