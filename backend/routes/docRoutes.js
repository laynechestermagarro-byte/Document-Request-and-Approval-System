const router = require('express').Router();
const Request = require('../models/Request');
const multer = require('multer');
const path = require('path');

// Multer Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ storage });

// ====================== CREATE REQUEST ======================
router.post('/create', upload.single('file'), async (req, res) => {
  try {
    const { requester, requesterName, documentType, description } = req.body;

    if (!requester || !documentType) {
      return res.status(400).json({ message: "Requester and Document Type are required" });
    }

    const newRequest = new Request({
      requester,
      requesterName: requesterName || "Unknown User",
      documentType,
      description: description || "",
      status: 'Pending',
      fileName: req.file ? req.file.filename : null,
      filePath: req.file ? req.file.path : null,
    });

    const savedRequest = await newRequest.save();
    res.status(201).json(savedRequest);
  } catch (err) {
    console.error("Create Request Error:", err);
    res.status(500).json({ message: "Error creating request", error: err.message });
  }
});

// ====================== GET ALL REQUESTS ======================
router.get('/all', async (req, res) => {
  try {
    const { role, userId } = req.query;

    let query = {};

    if (role === 'Requester' && userId) {
      query = { requester: userId };
    }
    // Admin can see all

    const requests = await Request.find(query)
      .populate('requester', 'name email')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    console.error("Fetch Requests Error:", err);
    res.status(500).json({ message: "Failed to fetch requests", error: err.message });
  }
});

// ====================== UPDATE REQUEST STATUS ======================
router.patch('/status/:id', async (req, res) => {
  try {
    const { status, remarks } = req.body;

    const allowedStatuses = ['Pending', 'Under Review', 'Approved', 'Ready', 'Rejected'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updatedRequest = await Request.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        remarks: remarks || "",
        reviewedBy: req.body.reviewedBy || null,   // You can pass admin userId
        reviewedAt: new Date()
      },
      { new: true }
    ).populate('requester', 'name email');

    if (!updatedRequest) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.json(updatedRequest);
  } catch (err) {
    console.error("Status Update Error:", err);
    res.status(500).json({ message: "Failed to update status", error: err.message });
  }
});

module.exports = router;