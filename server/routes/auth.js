const express = require('express');
const router = express.Router();
const User = require('../models/User'); 
// We are removing 'passport' if you used it before, 
// for now let's keep it simple with manual auth or just simple login

// 1. REGISTER ROUTE (JSON)
// REGISTER
router.post('/register', async (req, res) => {
  try {
    // 1. We must read 'address' from the request body
    const { name, email, password, role, address } = req.body; 

    // 2. Check if user exists
    const user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: "User already exists" });

    // 3. Create the new user INCLUDING the address
    const newUser = new User({
      name,
      email,
      password,
      role,
      address: address || "" // Save the address (or empty if none provided)
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. LOGIN ROUTE (JSON)
// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    // 2. Check password (In a real app, use bcrypt.compare)
    if (user.password !== password) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // 3. SEND THE ROLE BACK! (This is the critical fix)
    res.json({ 
      message: "Login successful", 
      userId: user._id, 
      userType: user.role // <--- This must match the field name in your Database!
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;