const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Book = require('../models/Book'); // [BARU] Penting: Import model Book untuk update stok

// Get all transactions (TETAP SAMA)
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

// Get user transactions (TETAP SAMA)
router.get('/user/:userId', async (req, res) => {
  try {
    const transactions = await Transaction.find({ 
      userId: req.params.userId 
    })
      .populate('bookId', 'title author coverImage')
      .sort({ borrowDate: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Create transaction (MODIFIKASI)
router.post('/', async (req, res) => {
  try {
    // [BARU] Cek stok buku sebelum pinjam
    const book = await Book.findById(req.body.bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    if (book.stock < 1) {
      return res.status(400).json({ message: 'Book is out of stock' });
    }

    // [MODIFIKASI] Paksa status jadi PENDING
    const transaction = new Transaction({
      ...req.body,
      status: 'PENDING' 
    });
    
    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// [BARU] Endpoint Khusus Admin: Menyetujui Peminjaman
// Dipanggil saat Admin klik "Setuju"
router.put('/:id/approve', async (req, res) => {
  try {
    // 1. Cari transaksi
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // 2. Cek apakah stok masih ada (double check)
    const book = await Book.findById(transaction.bookId);
    if (book.stock < 1) {
      return res.status(400).json({ message: 'Book is out of stock' });
    }

    // 3. Update status jadi BORROWED
    transaction.status = 'BORROWED';
    await transaction.save();

    // 4. Kurangi stok buku
    await Book.findByIdAndUpdate(transaction.bookId, { 
      $inc: { stock: -1 } 
    });

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// [BARU] Endpoint Khusus Admin: Menolak Peminjaman
// Dipanggil saat Admin klik "Tolak"
router.put('/:id/reject', async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { status: 'REJECTED' }, // Pastikan enum di model Transaction mendukung 'REJECTED'
      { new: true }
    );
    
    // Jika tidak ada 'REJECTED' di enum, bisa pakai delete:
    // await Transaction.findByIdAndDelete(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// [BARU] Endpoint Pengembalian Buku
// Dipanggil saat User klik "Kembalikan" atau Admin proses pengembalian
router.put('/:id/return', async (req, res) => {
  try {
    // 1. Update status jadi RETURNED
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'RETURNED',
        returnDate: new Date()
      },
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // 2. Kembalikan stok buku (tambah 1)
    await Book.findByIdAndUpdate(transaction.bookId, { 
      $inc: { stock: 1 } 
    });

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Update transaction generic (TETAP SAMA - untuk edit manual lain)
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