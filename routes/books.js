const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const bookController = require('../controllers/bookController');
const authMiddleware = require('../middleware/authMiddleware');

// Get all books
router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      query.category = category;
    }

    const books = await Book. find(query). sort({ createdAt: -1 });
    res.json(books);

  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error. message 
    });
  }
});

// Get book by ID
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(book);
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Create new book
router.post('/', async (req, res) => {
  try {
    const {
      title,
      author,
      category,
      publisher,
      year,
      isbn,
      stock,
      totalCopies,
      coverImage,
      description
    } = req.body;

    if (!title || !author || !category) {
      return res.status(400).json({ message: 'Field wajib belum diisi' });
    }

    const book = new Book({
      title,
      author,
      category,
      publisher,
      year,
      isbn,
      stock,
      totalCopies,
      coverImage,
      description,
      isAvailable: stock > 0
    });

    const savedBook = await book.save();
    res.status(201).json(savedBook);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Update book
router.put('/:id', async (req, res) => {
  try {
    const book = await Book. findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(book);
  } catch (error) {
    res.status(500). json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Delete book
router.delete('/:id', async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

module.exports = router;