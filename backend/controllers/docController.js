const Request = require('../models/Request');

// @desc    Get all requests (filtered by role and user ID)
// @route   GET /api/docs/all
exports.getAllRequests = async (req, res) => {
    try {
        const { role, userId } = req.query;

        let query = {};

        // If user is a Requester, only show their own documents
        if (role === 'Requester') {
            if (!userId) {
                return res.status(400).json({ message: "User ID is required for Requesters" });
            }
            query = { requester: userId };
        }

        const requests = await Request.find(query).sort({ createdAt: -1 });
        res.status(200).json(requests);
    } catch (err) {
        res.status(500).json({ message: "Server error fetching requests", error: err.message });
    }
};

// @desc    Create a new document request
// @route   POST /api/docs/create
exports.createRequest = async (req, res) => {
    try {
        const { requester, requesterName, documentType, description } = req.body;

        // Validation
        if (!requester || !documentType) {
            return res.status(400).json({ message: "Please provide all required fields" });
        }

        const newRequest = new Request({
            requester,
            requesterName,
            documentType,
            description,
            status: 'Pending'
        });

        const savedRequest = await newRequest.save();
        res.status(201).json(savedRequest);
    } catch (err) {
        res.status(500).json({ message: "Error creating request", error: err.message });
    }
};