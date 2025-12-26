const router = require('express').Router();
const Order = require('../models/Order');
const Listing = require('../models/Listing');

// 1. PLACE ORDER (Student buys item)
router.post('/place', async (req, res) => {
  try {
    const { studentId, listingId, restaurantId, price, itemTitle } = req.body;

    // Create the order with the saved name (Snapshot)
    const newOrder = new Order({
      studentId,
      listingId,
      restaurantId,
      totalPrice: price,
      itemTitle: itemTitle || "Unnamed Item", // Fallback if name is missing
      status: 'ordered'
    });

    await newOrder.save();

    // Decrease the stock quantity
    const listing = await Listing.findById(listingId);
    if (listing) {
      listing.quantity = Math.max(0, listing.quantity - 1);
      await listing.save();
    }

    res.status(201).json(newOrder);
  } catch (err) {
    console.error("Place Order Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 2. GET STUDENT ORDERS (For MyOrders Page)
router.get('/student/:id', async (req, res) => {
  try {
    const orders = await Order.find({ studentId: req.params.id })
      .populate('listingId')     // Get details of the item (if it still exists)
      .populate('restaurantId')  // Get details of the shop
      .sort({ createdAt: -1 });  // Show newest first

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. GET RESTAURANT ORDERS (For Incoming Orders Page)
router.get('/restaurant/:id', async (req, res) => {
  try {
    const orders = await Order.find({ restaurantId: req.params.id })
      .populate('studentId', 'name email') // Get student name
      .populate('listingId')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. UPDATE ORDER STATUS (For Restaurant to click "Picked Up")
router.put('/update-status', async (req, res) => {
  try {
    const { orderId, status } = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId, 
      { status }, 
      { new: true }
    );
    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;