const router = require('express').Router();
const Listing = require('../models/Listing');

// 1. ADD LISTING
router.post('/add', async (req, res) => {
  try {
    const newListing = new Listing(req.body);
    await newListing.save();
    res.status(201).json(newListing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. GET ALL LISTINGS (CRITICAL FIX HERE)
router.get('/all', async (req, res) => {
  try {
    // We MUST populate 'role' and 'address' so the Frontend can filter Vendor items
    const listings = await Listing.find()
      .populate('restaurantId', 'name email address role'); 
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. DELETE LISTING
router.delete('/delete/:id', async (req, res) => {
  try {
    await Listing.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;