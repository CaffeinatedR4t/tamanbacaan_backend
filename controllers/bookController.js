const Book = require('../models/Book');

exports.createBook = async (req, res) => {
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

    // Validasi sederhana
    if (!title || !author || !category) {
      return res.status(400).json({ message: 'Field wajib belum diisi' });
    }

    const newBook = new Book({
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

    const savedBook = await newBook.save();

    res.status(201).json({
      message: 'Book berhasil ditambahkan',
      data: savedBook
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
