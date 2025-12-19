const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

// Get all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find({ isActive: true })
      . populate('createdBy', 'fullName')
      .sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error. message 
    });
  }
});

// Create event
router.post('/', async (req, res) => {
  try {
    console.log('📥 [POST /events] Request body:', req.body);

    const event = new Event({
      title: req.body.title,
      message: req.body.message,
      createdBy: req.user?.userId || null // opsional
    });

    const savedEvent = await event.save();

    console.log('✅ [POST /events] Event saved:', {
      id: savedEvent._id,
      title: savedEvent.title,
      createdAt: savedEvent.createdAt
    });

    // 🔥 PASTIKAN RESPONSE LENGKAP
    res.status(201).json({
      _id: savedEvent._id,
      title: savedEvent.title,
      message: savedEvent.message,
      createdAt: savedEvent.createdAt
    });

  } catch (error) {
    console.error('❌ [POST /events] Error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
});


// Delete event
router.delete('/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

module.exports = router;