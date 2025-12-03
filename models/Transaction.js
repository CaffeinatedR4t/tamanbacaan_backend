const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  borrowDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  returnDate: { type: Date },
  status: { 
    type: String, 
    enum: ['PENDING', 'APPROVED', 'BORROWED', 'RETURNED', 'OVERDUE'],
    default: 'PENDING'
  },
  fine: { type: Number, default: 0 },
  notes: { type: String }
});

module.exports = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);