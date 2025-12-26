const router = require('express').Router();
const User = require('../models/User');
// const bcrypt = require('bcrypt'); // Commented out to avoid errors if not installed

// 1. REGISTER
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, address, certificateId } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: "User already exists" });

    // Create New User
    // NOTE: We are saving password as plain text for simplicity. 
    // If you use bcrypt, uncomment the hashing lines.
    const newUser = new User({
      name,
      email,
      password, // Store password directly
      role: role || 'student', // Default to student
      address: address || "",
      certificateId: (role === 'restaurant') ? certificateId : "" 
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 2. LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    // Validate Password (Plain Text Comparison)
    // If you were using bcrypt: const validPass = await bcrypt.compare(password, user.password);
    if (user.password !== password) {
      return res.status(400).json({ error: "Invalid password" });
    }

    // Return User Info (simulating a token)
    // In a real app, use jwt.sign() here. 
    // We send back the role so the frontend knows where to redirect.
    res.json({
      token: "fake-jwt-token-" + user._id, 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role // THIS IS IMPORTANT FOR REDIRECT
      }
    });

  } catch (err) {
    console.error("Login Error:", err); // This prints the error in your VS Code Terminal
    res.status(500).json({ error: "Server Error: " + err.message });
  }
});

module.exports = router;