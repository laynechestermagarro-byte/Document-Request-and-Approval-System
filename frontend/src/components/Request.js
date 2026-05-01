import React, { useState } from 'react';
import axios from 'axios';
import { Upload, X } from 'lucide-react';

const Request = ({ isOpen, onClose }) => {
  const [documentType, setDocumentType] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const documentTypes = [
    "Transcript of Records",
    "Certificate of Good Moral",
    "Diploma",
    "Certificate of Enrollment",
    "Honorable Dismissal"
  ];

  // Form Validation
  const validateForm = () => {
    const newErrors = {};
    if (!documentType) newErrors.documentType = "Please select a document type";
    if (!file) newErrors.file = "Please upload a file";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('documentType', documentType);
      if (description) formData.append('description', description);
      if (file) formData.append('file', file);

      const token = localStorage.getItem('token');

      await axios.post('http://localhost:5000/api/requests', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      alert("✅ Request submitted successfully!");
      
      // Reset form
      setDocumentType('');
      setDescription('');
      setFile(null);
      setErrors({});

      onClose();

    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setErrors(prev => ({ ...prev, file: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-4 border-b flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">New Document Request</h2>
            <p className="text-slate-500 text-sm mt-1">Please fill in the details below</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500">
            <X size={28} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Document Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Document Type <span className="text-red-500">*</span>
            </label>
            <select
              value={documentType}
              onChange={(e) => {
                setDocumentType(e.target.value);
                setErrors(prev => ({ ...prev, documentType: '' }));
              }}
              className={`w-full px-4 py-3 border rounded-2xl focus:outline-none focus:border-blue-500 ${errors.documentType ? 'border-red-500' : 'border-slate-300'}`}
            >
              <option value="">Select Document Type</option>
              {documentTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.documentType && <p className="text-red-500 text-sm mt-1">{errors.documentType}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the purpose of this request..."
              rows={4}
              className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:border-blue-500 outline-none resize-y"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Upload Attachment <span className="text-red-500">*</span>
            </label>
            <div className={`border-2 border-dashed rounded-3xl p-10 text-center transition ${errors.file ? 'border-red-500' : 'border-slate-300 hover:border-blue-400'}`}>
              <Upload className="mx-auto text-slate-400 mb-3" size={48} />
              <p className="font-medium text-slate-700">Drag and drop file here</p>
              <p className="text-slate-400 text-sm mt-1">or</p>
              
              <label className="mt-4 inline-block bg-white border border-slate-300 hover:bg-slate-50 px-6 py-3 rounded-2xl cursor-pointer text-sm font-medium">
                Choose File
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>

              {file && (
                <p className="mt-4 text-green-600 text-sm font-medium">
                  Selected: {file.name}
                </p>
              )}
            </div>
            {errors.file && <p className="text-red-500 text-sm mt-2">{errors.file}</p>}
            <p className="text-xs text-slate-400 mt-2 text-center">Accepted: PDF, JPG, PNG (max 10MB)</p>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 border border-slate-300 rounded-2xl font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-4 rounded-2xl font-bold text-white transition ${
                loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Request;