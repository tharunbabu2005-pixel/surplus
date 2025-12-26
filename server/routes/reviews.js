const express = require('express');
const router = require('express').Router();
const Review = require('../models/Review'); // Ensure you have a Review model

// 1. ADD REVIEW
router.post('/add', async (req, res) => {
  try {
    const { studentId, restaurantId, rating, comment } = req.body;
    const newReview = new Review({ studentId, restaurantId, rating, comment });
    await newReview.save();
    res.status(201).json(newReview);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. GET REVIEWS FOR A VENDOR/RESTAURANT
router.get('/:id', async (req, res) => {
  try {
    const reviews = await Review.find({ restaurantId: req.params.id })
      .populate('studentId', 'name');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;