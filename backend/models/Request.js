const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  requester: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  requesterName: { 
    type: String, 
    required: true 
  },
  documentType: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String,
    trim: true,
    maxlength: 500
  },
  fileName: { 
    type: String 
  },
  filePath: { 
    type: String 
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Under Review', 'Approved', 'Ready', 'Rejected'], 
    default: 'Pending' 
  },
  reviewedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  reviewedAt: { 
    type: Date 
  },
  remarks: { 
    type: String,
    trim: true,
    maxlength: 300
  },
  submittedAt: { 
    type: Date, 
    default: Date.now 
  }
}, { 
  timestamps: true   // This automatically adds createdAt and updatedAt
});

// Optional: Add index for faster queries
RequestSchema.index({ requester: 1, status: 1 });
RequestSchema.index({ submittedAt: -1 });

module.exports = mongoose.model('Request', RequestSchema);