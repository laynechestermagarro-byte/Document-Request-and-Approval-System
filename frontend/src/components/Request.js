import React, { useState } from 'react';
import axios from 'axios';
import { Upload, X } from 'lucide-react';

const Request = ({ isOpen, onClose, onSuccess }) => {
  const [documentType, setDocumentType] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const documentTypes = [
    "Transcript of Records", "Certificate of Good Moral", "Diploma",
    "Certificate of Enrollment", "Honorable Dismissal"
  ];

  // Helper to clear the form
  const resetForm = () => {
    setDocumentType('');
    setDescription('');
    setFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!documentType || !file) {
      alert("Please provide all required fields (Document Type and File).");
      return;
    }

    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('name');

    // Extra check to ensure we don't send the literal string "undefined"
    if (!token || !userId || userId === 'undefined') {
      alert("Session expired or invalid. Please log in again.");
      localStorage.clear();
      window.location.href = '/login';
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('documentType', documentType);
      formData.append('description', description || '');
      formData.append('requester', userId); // Sending the ID for the Ref field
      formData.append('requesterName', userName); 
      formData.append('file', file);

      await axios.post('http://localhost:5000/api/docs/create', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      alert("✅ Request submitted successfully!");
      
      resetForm(); // Clear fields
      if (onSuccess) onSuccess(); // Trigger Dashboard refresh
      onClose(); // Close modal
    } catch (err) {
      console.error("Submission Error:", err.response?.data || err);
      alert(err.response?.data?.message || "Failed to submit request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="px-8 pt-8 pb-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-2xl font-black text-slate-900">New Request</h2>
          <button 
            onClick={() => { resetForm(); onClose(); }} 
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={28} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Document Type *</label>
            <select 
              value={documentType} 
              onChange={(e) => setDocumentType(e.target.value)} 
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option value="">Select a document...</option>
              {documentTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Description / Purpose</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="e.g. For scholarship application"
              rows={3} 
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Supporting File *</label>
            <div className={`border-2 border-dashed rounded-3xl p-6 text-center transition-colors ${file ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200 bg-slate-50'}`}>
              <Upload size={32} className={`mx-auto mb-3 ${file ? 'text-emerald-500' : 'text-slate-300'}`} />
              
              <label className="cursor-pointer bg-white border border-slate-200 shadow-sm text-slate-700 px-6 py-2.5 rounded-xl inline-block font-bold hover:bg-slate-50 transition-all active:scale-95 mb-2">
                {file ? 'Change File' : 'Choose File'}
                <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} />
              </label>
              
              <p className="text-[10px] text-slate-400 font-medium px-4">
                Accepted formats: PDF, JPG, PNG (Max 5MB)
              </p>
              
              {file && (
                <div className="mt-3 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold inline-flex items-center gap-2">
                  <span className="truncate max-w-[200px]">{file.name}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="button" 
              onClick={() => { resetForm(); onClose(); }} 
              className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:bg-slate-300 disabled:shadow-none transition-all active:scale-95"
            >
              {loading ? "Processing..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Request;