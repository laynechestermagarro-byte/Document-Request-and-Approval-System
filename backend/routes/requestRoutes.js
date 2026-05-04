const router = require('express').Router();
const multer = require('multer');
const Request = require('../models/Request');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// GET all requests (for Admin) or user's own requests (for Requester)
router.get('/', async (req, res) => {
  try {
    const { role, userId } = req.query;
    let filter = {};

    if (role === 'Requester' && userId) {
      filter.requester = userId;
    }

    const requests = await Request.find(filter)
      .sort({ createdAt: -1 });

    console.log(`📋 Fetched ${requests.length} requests for ${role}`);
    res.json(requests);
  } catch (err) {
    console.error("Error fetching requests:", err);
    res.status(500).json({ message: "Failed to fetch requests" });
  }
});

// POST - Create new request
router.post('/', upload.single('file'), async (req, res) => {
  console.log("📥 New request received");
  console.log("Body:", req.body);
  console.log("File:", req.file ? req.file.filename : "No file");

  try {
    const { documentType, description, requester, requesterName } = req.body;

    if (!documentType) {
      return res.status(400).json({ message: "Document type is required" });
    }
    if (!requester) {
      return res.status(400).json({ message: "User ID (requester) is required" });
    }

    const newRequest = new Request({
      requester,
      requesterName: requesterName || "Unknown User",
      documentType,
      description: description || "",
      fileName: req.file ? req.file.filename : null,
      status: "Pending"
    });

    const saved = await newRequest.save();

    console.log("✅ Request saved successfully! ID:", saved._id);

    res.status(201).json({
      success: true,
      message: "Request submitted successfully!",
      requestId: saved._id
    });

  } catch (err) {
    console.error("❌ Error creating request:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to submit request",
      error: err.message 
    });
  }
});

module.exports = router;