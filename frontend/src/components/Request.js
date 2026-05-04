import React, { useState } from 'react';
import axios from 'axios';
import { Upload, X } from 'lucide-react';

const Request = ({ isOpen, onClose, onSuccess }) => { // Added onSuccess
  const [documentType, setDocumentType] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const documentTypes = [
    "Transcript of Records", "Certificate of Good Moral", "Diploma",
    "Certificate of Enrollment", "Honorable Dismissal"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!documentType || !file) {
      alert("Please provide all required fields");
      return;
    }

    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('name');

    if (!token || !userId) {
      alert("Session expired. Please log in again.");
      window.location.href = '/login';
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('documentType', documentType);
      formData.append('description', description || '');
      formData.append('requester', userId);
      formData.append('requesterName', userName); // Added this for your backend
      formData.append('file', file);

      // Fixed endpoint to match your server.js /api/docs route
      await axios.post('http://localhost:5000/api/docs/create', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      alert("✅ Request submitted successfully!");
      if (onSuccess) onSuccess(); // Refresh dashboard data
      onClose();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) setFile(e.target.files[0]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden">
        <div className="px-8 pt-8 pb-4 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold">New Request</h2>
          <button onClick={onClose}><X size={28} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-bold mb-2">Document Type *</label>
            <select value={documentType} onChange={(e) => setDocumentType(e.target.value)} className="w-full px-4 py-3 border rounded-2xl">
              <option value="">Select Document Type</option>
              {documentTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-4 py-3 border rounded-2xl" />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">File Upload *</label>
            <div className="border-2 border-dashed border-slate-300 rounded-3xl p-8 text-center">
              <Upload size={48} className="mx-auto mb-3 text-slate-400" />
              <label className="cursor-pointer bg-blue-600 text-white px-6 py-3 rounded-xl inline-block">
                Choose File
                <input type="file" className="hidden" accept=".pdf,.jpg,.png" onChange={handleFileChange} />
              </label>
              {file && <p className="mt-3 text-green-600">Selected: {file.name}</p>}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 border rounded-2xl">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-2xl disabled:bg-gray-400">
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Request;