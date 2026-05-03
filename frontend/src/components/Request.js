import React, { useState } from 'react';
import axios from 'axios';
import { Upload, X } from 'lucide-react';

const Request = ({ isOpen, onClose, onSuccess }) => {
  const [documentType, setDocumentType] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const documentTypes = [
    "Transcript of Records", "Certificate of Good Moral", "Diploma",
    "Certificate of Enrollment", "Honorable Dismissal"
  ];

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
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      if (!token || !userId) {
        alert("Session expired. Please log in again.");
        return;
      }

      const formData = new FormData();
      formData.append('documentType', documentType);
      formData.append('description', description);
      formData.append('file', file);
      formData.append('requester', userId);

      await axios.post('http://localhost:5000/api/docs/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      alert("✅ Request submitted successfully!");
      
      // Reset form
      setDocumentType('');
      setDescription('');
      setFile(null);
      setErrors({});

      onSuccess?.();
      onClose();

    } catch (err) {
      console.error(err);
      const message = err.response?.data?.message || 
                     err.message || 
                     "Failed to submit request. Is the server running?";
      alert(`❌ ${message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="px-8 pt-8 pb-4 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-900">New Request</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500">
            <X size={28} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Document Type */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Document Type *</label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className={`w-full px-4 py-3 border rounded-2xl ${errors.documentType ? 'border-red-500' : 'border-slate-300'}`}
            >
              <option value="">Select Document Type</option>
              {documentTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-slate-300 rounded-2xl"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">File Upload *</label>
            <div className={`border-2 border-dashed rounded-3xl p-6 text-center ${errors.file ? 'border-red-500' : 'border-slate-300'}`}>
              <Upload className="mx-auto text-slate-400 mb-3" size={36} />
              <p className="text-sm text-slate-600 mb-2">
                {file ? file.name : "Click to upload document"}
              </p>
              <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium inline-block">
                Choose File
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={(e) => setFile(e.target.files[0])} 
                />
              </label>
            </div>
            {errors.file && <p className="text-red-500 text-sm mt-1">{errors.file}</p>}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 font-bold text-slate-600 border border-slate-300 rounded-2xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3.5 font-bold text-white bg-blue-600 rounded-2xl hover:bg-blue-700 disabled:bg-slate-400"
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