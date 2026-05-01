const router = require('express').Router();
const multer = require('multer');
const Request = require('../models/Request');

// Setup multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');   // Make sure this folder exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// POST /api/requests
router.post('/', upload.single('file'), async (req, res) => {
  console.log("=== REQUEST RECEIVED ===");
  console.log("Body:", req.body);
  console.log("File:", req.file);

  try {
    const { documentType, description } = req.body;

    if (!documentType) {
      return res.status(400).json({ message: "Document type is required" });
    }

    const newRequest = new Request({
      requester: "67f8c9d2e123456789abcdef",   // temporary
      requesterName: "Badong",
      documentType,
      description: description || "",
      status: "Pending",
      fileName: req.file ? req.file.filename : null
    });

    const savedRequest = await newRequest.save();

    console.log("✅ Request saved! ID:", savedRequest._id);

    res.status(201).json({
      success: true,
      message: "Request submitted successfully!",
      requestId: savedRequest._id
    });

  } catch (err) {
    console.error("❌ FULL ERROR:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to submit request",
      error: err.message
    });
  }
});

module.exports = router;