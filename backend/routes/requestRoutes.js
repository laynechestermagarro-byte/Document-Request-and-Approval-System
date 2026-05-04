const router = require('express').Router();
const multer = require('multer');
const Request = require('../models/Request');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ storage });

// GET all requests - filtered by user role
router.get('/all', async (req, res) => {
  try {
    const { role, userId } = req.query;

    let filter = {};
    if (role === 'Requester' && userId) {
      filter.requester = userId;
    }
    // Admin sees everything

    const requests = await Request.find(filter)
      .populate('requester', 'name email')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch requests" });
  }
});

// CREATE new request
router.post('/create', upload.single('file'), async (req, res) => {
  try {
    const { documentType, description, userId, requesterName } = req.body;

    if (!documentType) {
      return res.status(400).json({ message: "Document type is required" });
    }

    const newRequest = new Request({
      requester: userId || "67f8c9d2e123456789abcdef",
      requesterName: requesterName || "Badong",
      documentType,
      description: description || "",
      fileName: req.file ? req.file.filename : null,
      status: "Pending"
    });

    await newRequest.save();

    res.status(201).json({
      success: true,
      message: "Request submitted successfully!",
      requestId: newRequest._id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to submit request" });
  }
});

module.exports = router;