const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import Routes
const authRoutes = require('./routes/auth');
const listingRoutes = require('./routes/listings'); // Make sure this matches your file name!
const orderRoutes = require('./routes/orders');
const favoriteRoutes = require('./routes/favorites');
const reviewRoutes = require('./routes/reviews');



const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/favorites', favoriteRoutes);

// Database Connection
mongoose.connect('mongodb://localhost:27017/foodhub')
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("DB Error:", err));

// Routes Configuration
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);

// --- THIS PART WAS LIKELY MISSING OR BROKEN ---
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});