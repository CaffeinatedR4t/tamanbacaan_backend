const mongoose = require('mongoose');

const bookSchema = new mongoose. Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  category: { type: String, required: true },
  publisher: { type: String },
  year: { type: Number },
  isbn: { type: String },
  stock: { type: Number, default: 1 },
  totalCopies: { type: Number, default: 1 },
  coverImage: { type: String },
  description: { type: String },
  isAvailable: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  avgRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  reviews: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: String,
    rating: Number,
    comment: String,
    createdAt: { type: Date, default: Date.now }
  }],
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Book || mongoose.model('Book', bookSchema);