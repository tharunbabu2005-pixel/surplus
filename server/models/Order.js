const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing' },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  itemTitle: { type: String, required: true }, 
  totalPrice: { type: Number, required: true },
  
  // NEW FIELD: To store the custom time entered by the user
  pickupTime: { type: String, default: "" },

  status: { type: String, default: 'ordered' } 
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);