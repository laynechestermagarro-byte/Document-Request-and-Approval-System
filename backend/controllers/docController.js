const Request = require('../models/Request');


// @desc    Get all requests (filtered by role and user ID)
// @route   GET /api/docs/all
exports.getAllRequests = async (req, res) => {
    try {
        const { role, userId } = req.query;
        let query = {};


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




// Add/Update this in your docController.js
// Locate the status update function in your backend controllers
exports.updateRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, remarks } = req.body;


        const updatedRequest = await Request.findByIdAndUpdate(
            id,
            {
                status,
                remarks, // ✅ This saves the actual reason to the main document
                $push: {
                    statusHistory: {
                        status,
                        remarks,
                        changedAt: new Date()
                    }
                }
            },
            { new: true }
        );


        res.status(200).json(updatedRequest);
    } catch (err) {
        res.status(500).json({ message: "Error", error: err.message });
    }
};


// @desc    Create a new document request
// @route   POST /api/docs/create
exports.createRequest = async (req, res) => {
    try {
        // 1. Extract ALL necessary fields from the body
        const {
            requester,
            requesterName,
            requesterEmail,
            documentType,
            description
        } = req.body;


        // 2. Early exit safety check
        // This stops the 'requesterEmail is required' crash in your terminal
        if (!requesterEmail || requesterEmail === 'undefined' || requesterEmail === 'null') {
            return res.status(400).json({
                message: "Request failed: Requester email is missing. Please re-login."
            });
        }


        // 3. Create the new document instance
        const newRequest = new Request({
            requester,
            requesterName,
            requesterEmail,
            documentType,
            description,
            status: 'Pending'
        });


        // 4. Save to Database
        const savedRequest = await newRequest.save();
        res.status(201).json(savedRequest);


    } catch (err) {
        console.error("Backend Create Error:", err);
        res.status(500).json({
            message: "Error creating request",
            error: err.message
        });
    }
};
