const express = require('express');
const Maid = require('../models/Maid');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all maids
router.get('/', async (req, res) => {
  try {
    const maids = await Maid.find().populate('userId', 'name email phone');
    res.json(maids);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get maid by ID
router.get('/:id', async (req, res) => {
  try {
    const maid = await Maid.findById(req.params.id).populate('userId', 'name email phone');
    if (!maid) {
      return res.status(404).json({ message: 'Maid not found' });
    }
    res.json(maid);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create maid profile
router.post('/', auth, async (req, res) => {
  try {
    const { skills, experience, hourlyRate, availability } = req.body;
    
    const maid = new Maid({
      userId: req.user.userId,
      skills,
      experience,
      hourlyRate,
      availability
    });

    await maid.save();
    res.status(201).json(maid);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update maid profile
router.put('/:id', auth, async (req, res) => {
  try {
    const maid = await Maid.findById(req.params.id);
    if (!maid) {
      return res.status(404).json({ message: 'Maid not found' });
    }

    if (maid.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedMaid = await Maid.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedMaid);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add review
router.post('/:id/reviews', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const maid = await Maid.findById(req.params.id);

    if (!maid) {
      return res.status(404).json({ message: 'Maid not found' });
    }

    maid.reviews.push({
      userId: req.user.userId,
      rating,
      comment
    });

    // Update average rating
    const totalRating = maid.reviews.reduce((sum, review) => sum + review.rating, 0);
    maid.rating = totalRating / maid.reviews.length;

    await maid.save();
    res.status(201).json(maid);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;