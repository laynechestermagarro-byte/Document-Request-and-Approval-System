const router = require('express').Router();
const Document = require('../models/Document');
const User = require('../models/User');

/**
 * @swagger
 * /api/docs/all:
 * get:
 * summary: Get documents based on role (Admin sees all, User sees own)
 * tags: [Documents]
 * parameters:
 * - in: query
 * name: role
 * schema:
 * type: string
 * - in: query
 * name: userId
 * schema:
 * type: string
 */
router.get('/all', async (req, res) => {
  try {
    const { role, userId } = req.query;
    let query = {};

    // Task 3.4: Logic to filter by user unless they are an Admin
    if (role !== 'Admin') {
      if (!userId) {
        return res.status(400).json({ error: "User ID is required for non-admins" });
      }
      query = { requester: userId };
    }

    // Task 2.5: Ensure description is included and requester name is populated
    const docs = await Document.find(query)
      .populate('requester', 'name email')
      .sort({ createdAt: -1 });
      
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch documents", message: err.message });
  }
});

/**
 * @swagger
 * /api/docs/status/{id}:
 * patch:
 * summary: Update document status (Approve/Reject)
 * tags: [Documents]
 */
router.patch('/status/:id', async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate that the status is one of your allowed types
    const allowedStatuses = ['Under Review', 'Approved', 'Ready for Pickup', 'Rejected'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status update" });
    }

    const updatedDoc = await Document.findByIdAndUpdate(
      req.params.id,
      { status: status },
      { new: true } // Returns the updated document instead of the old one
    );

    if (!updatedDoc) {
      return res.status(404).json({ error: "Document not found" });
    }

    res.json(updatedDoc);
  } catch (err) {
    res.status(400).json({ error: "Status update failed", message: err.message });
  }
});

module.exports = router;