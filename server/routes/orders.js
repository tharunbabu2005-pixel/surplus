const router = require('express').Router();
const Order = require('../models/Order');
const Listing = require('../models/Listing');

// 1. PLACE ORDER
router.post('/place', async (req, res) => {
  try {
    // CAPTURE 'pickupTime' from the request
    const { studentId, listingId, restaurantId, price, itemTitle, pickupTime } = req.body;

    const newOrder = new Order({
      studentId,
      listingId,
      restaurantId,
      totalPrice: price,
      itemTitle: itemTitle || "Unnamed Item",
      // SAVE IT HERE
      pickupTime: pickupTime || "Standard Pickup", 
      status: 'ordered'
    });

    await newOrder.save();

    // Decrease Stock
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

// 2. GET STUDENT ORDERS
router.get('/student/:id', async (req, res) => {
  try {
    const orders = await Order.find({ studentId: req.params.id })
      .populate('listingId')
      .populate('restaurantId')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. GET RESTAURANT ORDERS
router.get('/restaurant/:id', async (req, res) => {
  try {
    const orders = await Order.find({ restaurantId: req.params.id })
      .populate('studentId', 'name email')
      .populate('listingId')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. UPDATE STATUS
router.put('/update-status', async (req, res) => {
  try {
    const { orderId, status } = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;