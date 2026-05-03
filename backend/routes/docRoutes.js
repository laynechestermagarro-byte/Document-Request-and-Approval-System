const router = require('express').Router();
const Document = require('../models/Document');
const User = require('../models/User');

/**
 * @swagger
 * /api/docs/all:
 * get:
 * summary: Get documents based on role (Admin sees all, User sees own)
 * tags: [Documents]
 */
router.get('/all', async (req, res) => {
  try {
    const { role, userId } = req.query;

    if (role === 'Admin') {
      // Fetch ALL docs and "populate" the requester's name from the User collection
      const allDocs = await Document.find()
        .populate('requester', 'name email')
        .sort({ createdAt: -1 });
      return res.json(allDocs);
    } else {
      // Fetch only the specific user's docs
      const userDocs = await Document.find({ requester: userId })
        .sort({ createdAt: -1 });
      return res.json(userDocs);
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch documents", message: err.message });
  }
});

module.exports = router;