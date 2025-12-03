const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// Get all transactions
router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('userId', 'fullName email')
      .populate('bookId', 'title author')
      .sort({ borrowDate: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Get user transactions
router.get('/user/:userId', async (req, res) => {
  try {
    const transactions = await Transaction. find({ 
      userId: req.params. userId 
    })
      . populate('bookId', 'title author coverImage')
      .sort({ borrowDate: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Create transaction
router.post('/', async (req, res) => {
  try {
    const transaction = new Transaction(req.body);
    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Update transaction
router.put('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

module.exports = router;