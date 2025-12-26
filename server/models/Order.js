const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing' },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // THIS IS THE MISSING PART THAT FIXES IT:
  itemTitle: { type: String, required: true }, 
  
  totalPrice: { type: Number, required: true },
  status: { type: String, default: 'ordered' } // ordered, picked up, cancelled
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);