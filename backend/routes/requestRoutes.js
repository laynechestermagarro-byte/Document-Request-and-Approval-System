const router = require('express').Router();
const multer = require('multer');
const Request = require('../models/Request');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ storage });

// GET all requests (Admin) or my requests (Requester)
router.get('/', async (req, res) => {
  try {
    const { role, userId } = req.query;
    let filter = {};

    if (role === 'Requester' && userId) {
      filter.requester = userId;
    }

    const requests = await Request.find(filter).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch requests" });
  }
});

// CREATE new request
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { documentType, description, requester, requesterName } = req.body;

    if (!documentType || !requester) {
      return res.status(400).json({ message: "Document type and requester are required" });
    }

    const newRequest = new Request({
      requester,
      requesterName: requesterName || "Unknown",
      documentType,
      description: description || "",
      fileName: req.file ? req.file.filename : null,
      status: "Pending"
    });

    const saved = await newRequest.save();
    res.status(201).json({ success: true, message: "Request submitted!", request: saved });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to submit request" });
  }
});

module.exports = router;