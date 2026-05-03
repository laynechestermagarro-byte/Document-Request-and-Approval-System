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
      const formData = new FormData();
      formData.append('documentType', documentType);
      formData.append('description', description);
      formData.append('file', file);
      
      const currentUserId = localStorage.getItem('userId');
      if (!currentUserId) {
        alert("Session expired. Please log in again.");
        return;
      }
      formData.append('requester', currentUserId); 

      await axios.post('http://localhost:5000/api/docs/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert("✅ Request submitted successfully!");
      setDocumentType('');
      setDescription('');
      setFile(null);
      setErrors({});
      if (onSuccess) onSuccess(); 
      onClose(); 
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit request.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="px-8 pt-8 pb-4 border-b flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">New Request</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500"><X size={28} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Document Type *</label>
            <select
              value={documentType}
              onChange={(e) => { setDocumentType(e.target.value); setErrors({}); }}
              className={`w-full px-4 py-3 border rounded-2xl outline-none focus:border-blue-500 ${errors.documentType ? 'border-red-500' : 'border-slate-300'}`}
            >
              <option value="">Select Document Type</option>
              {documentTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-2xl outline-none focus:border-blue-500 resize-none"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">File Upload *</label>
            <div className={`border-2 border-dashed rounded-3xl p-6 text-center ${errors.file ? 'border-red-500' : 'border-slate-300'}`}>
              <Upload className="mx-auto text-slate-400 mb-2" size={32} />
              <p className="text-xs text-slate-500 mb-4">{file ? file.name : "Select a document"}</p>
              <label className="bg-slate-100 hover:bg-slate-200 px-6 py-2 rounded-xl cursor-pointer text-xs font-bold transition">
                Browse Files
                <input type="file" className="hidden" onChange={(e) => { setFile(e.target.files[0]); setErrors({}); }} />
              </label>
            </div>
          </div>
          <div className="flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 font-bold text-slate-500">Cancel</button>
            <button type="submit" disabled={loading} className={`flex-1 py-4 rounded-2xl font-bold text-white ${loading ? 'bg-slate-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Request;