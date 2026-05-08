import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, X } from 'lucide-react';


const Request = ({ isOpen, onClose, onSuccess, userEmail, initialData }) => {
  const [documentType, setDocumentType] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);


  const documentTypes = [
    "Transcript of Records", "Certificate of Good Moral", "Diploma",
    "Certificate of Enrollment", "Honorable Dismissal"
  ];


  useEffect(() => {
    if (initialData && isOpen) {
      setDocumentType(initialData.documentType || '');
      setDescription(initialData.description || '');
      setFile(null);
    } else if (!initialData && isOpen) {
      resetForm();
    }
  }, [initialData, isOpen]);


  const resetForm = () => {
    setDocumentType('');
    setDescription('');
    setFile(null);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();


    if (!documentType || (!initialData && !file)) {
      alert("Please provide all required fields.");
      return;
    }


    const token = localStorage.getItem('token');
    const isEdit = !!initialData;
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('name');
   
    // Priority check for email to fix the backend ValidationError
    const emailToSubmit = userEmail || localStorage.getItem('email');


    if (!isEdit && (!userId || !emailToSubmit)) {
        alert("User session error. Please log in again.");
        return;
    }


    setLoading(true);


    try {
      const formData = new FormData();
      formData.append('documentType', documentType);
      formData.append('description', description || '');
     
      if (file) formData.append('file', file);


      // Sending required fields for new requests
      if (!isEdit) {
        formData.append('requester', userId);
        formData.append('requesterName', userName || "Student");
        formData.append('requesterEmail', emailToSubmit);
        console.log("Submitting request for:", emailToSubmit); // Debug check
      }


      const url = isEdit
        ? `http://localhost:5000/api/docs/update/${initialData._id}`
        : 'http://localhost:5000/api/docs/create';
     
      const method = isEdit ? 'patch' : 'post';


      await axios({
        method: method,
        url: url,
        data: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });


      alert(isEdit ? "✅ Request updated successfully!" : "✅ Request submitted successfully!");
      resetForm();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("Submission Error Details:", err.response?.data);
      alert(err.response?.data?.message || "Error creating request. Check console for details.");
    } finally {
      setLoading(false);
    }
  };


  const handleFileChange = (e) => {
    if (e.target.files[0]) setFile(e.target.files[0]);
  };


  if (!isOpen) return null;


  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="px-8 pt-8 pb-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-2xl font-black text-slate-900">
            {initialData ? 'Edit Info' : 'New Request'}
          </h2>
          <button onClick={() => { resetForm(); onClose(); }} className="text-slate-400 hover:text-slate-600">
            <X size={28} />
          </button>
        </div>


        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Document Type *</label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500"
            >
              <option value="">Select a document...</option>
              {documentTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>


          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl resize-none"
              rows={3}
            />
          </div>


          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
              {initialData ? 'Update File (Optional)' : 'Supporting File *'}
            </label>
            <div className={`border-2 border-dashed rounded-3xl p-6 text-center ${file ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
              <Upload size={32} className={`mx-auto mb-3 ${file ? 'text-emerald-500' : 'text-slate-300'}`} />
              <label className="cursor-pointer bg-white border px-6 py-2.5 rounded-xl inline-block font-bold hover:bg-slate-50 transition-all">
                {file ? 'Change File' : 'Choose File'}
                <input type="file" className="hidden" onChange={handleFileChange} />
              </label>
              {file && <p className="mt-2 text-xs text-emerald-600 font-bold truncate">{file.name}</p>}
            </div>
          </div>


          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => { resetForm(); onClose(); }} className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg hover:bg-blue-700">
              {loading ? "Processing..." : initialData ? "Save Changes" : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


export default Request;
