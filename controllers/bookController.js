const Book = require('../models/Book');
const Transaction = require('../models/Transaction');
const natural = require('natural');
const TfIdf = natural.TfIdf;

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

exports.getRecommendations = async (req, res) => {
  try {
    const { userId } = req.params;

    // 1. Ambil riwayat peminjaman user
    // Kita cari transaksi user dan populate data bukunya
    const userHistory = await Transaction.find({ 
      userId: userId 
    }).populate('bookId');

    // 2. Jika user belum pernah meminjam, kembalikan buku terbaru (Cold Start Problem)
    if (userHistory.length === 0) {
      return res.json({ 
        source: 'none', 
        data: [] 
      });
    }

    // 3. Buat "Profil User" berdasarkan buku yang pernah dipinjam
    // Kita gabungkan Judul, Kategori, Penulis, dan Deskripsi dari buku yang pernah dipinjam
    let userProfileText = '';
    const borrowedBookIds = [];

    userHistory.forEach(trx => {
      if (trx.bookId) {
        borrowedBookIds.push(trx.bookId._id.toString());
        // Bobot teks: Kategori dan Penulis kita ulang agar lebih berpengaruh
        userProfileText += `${trx.bookId.category} ${trx.bookId.category} ${trx.bookId.author} ${trx.bookId.author} ${trx.bookId.title} ${trx.bookId.description} `;
      }
    });

    // 4. Ambil semua buku yang BELUM pernah dipinjam user
    const candidates = await Book.find({
      _id: { $nin: borrowedBookIds }, // Exclude buku yang sudah dipinjam
      isAvailable: true
    });

    // 5. Hitung Kemiripan menggunakan TF-IDF
    const tfidf = new TfIdf();
    
    // Dokumen pertama (index 0) adalah Profil User
    tfidf.addDocument(userProfileText);

    // Tambahkan buku kandidat ke TF-IDF
    candidates.forEach(book => {
      const bookText = `${book.category} ${book.author} ${book.title} ${book.description}`;
      tfidf.addDocument(bookText);
    });

    // 6. Ambil skor kemiripan
    // Kita bandingkan setiap dokumen kandidat (mulai index 1) dengan dokumen user (index 0)
    const recommendations = [];
    
    // Loop mulai dari 1 karena 0 adalah userProfileText
    for (let i = 1; i < tfidf.documents.length; i++) {
      // Measure similarity user (0) vs candidate (i)
      // Kita gunakan measure sederhana dari library natural, atau akses vektornya
      // Di sini kita gunakan logic tfidf measure umum
      const score = listMeasure(tfidf, 0, i); 
      
      if (score > 0) { // Hanya ambil yang ada kemiripan
        recommendations.push({
          book: candidates[i - 1], // i-1 karena candidates array mulai dari 0
          score: score
        });
      }
    }

    // Fungsi helper untuk menghitung nilai relevansi sederhana antar dua dokumen dalam tfidf
    function listMeasure(tfidfInstance, docIndex1, docIndex2) {
        let score = 0;
        const items = tfidfInstance.listTerms(docIndex1);
        items.forEach(item => {
            // Cari term yang sama di dokumen ke-2
            const termInDoc2 = tfidfInstance.tfidf(item.term, docIndex2);
            score += (item.tfidf * termInDoc2);
        });
        return score;
    }

    // 7. Urutkan berdasarkan skor tertinggi dan ambil top 10
    recommendations.sort((a, b) => b.score - a.score);
    const topRecommendations = recommendations.slice(0, 10).map(item => item.book);

    res.json({
      source: 'recommendation',
      data: topRecommendations
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error rekomendasi', error: error.message });
  }
};