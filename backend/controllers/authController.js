const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Register Route
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if user exists
    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) return res.status(400).json({ error: "Email already exists" });

    user = new User({ name, email: email.toLowerCase(), password, role });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    // Send the real error back to Postman instead of a generic message
    console.error("DEBUG ERROR:", err.message);
    res.status(400).json({ 
      error: "Registration failed", 
      message: err.message,
      stack: err.name 
    });
  }
});

module.exports = router;