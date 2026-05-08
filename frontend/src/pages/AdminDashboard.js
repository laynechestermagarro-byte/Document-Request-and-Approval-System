import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import {
  Search, Eye, CheckCircle, XCircle, LogOut, LayoutDashboard,
  Settings, User, Mail, Clock, Hash, FileText, X, RotateCcw, Download
} from 'lucide-react';
import neuLogo from '../assets/neu-logo.png';


const AdminDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [currentView, setCurrentView] = useState('dashboard');
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [toast, setToast] = useState(null);


  const token = localStorage.getItem('token');
  const adminName = localStorage.getItem('name') || "Admin";


  const axiosAuth = useMemo(() => axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: { Authorization: `Bearer ${token}` }
  }), [token]);


  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };


  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosAuth.get('/docs/all', { params: { role: 'Admin' } });
      setRequests(res.data || []);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        localStorage.clear();
        window.location.href = '/login';
      } else {
        showToast("Failed to fetch requests", "error");
      }
    } finally {
      setLoading(false);
    }
  }, [axiosAuth]);


  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);


  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };


  const filteredAndSortedData = useMemo(() => {
    let filtered = requests.filter(req => {
      const matchesTab = activeTab === 'All' || req.status === activeTab;
      const term = searchTerm.toLowerCase().trim();
      return matchesTab && (
        req.documentType?.toLowerCase().includes(term) ||
        req.requesterName?.toLowerCase().includes(term) ||
        req._id?.toLowerCase().includes(term)
      );
    });


    return [...filtered].sort((a, b) => {
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];


      if (sortConfig.key === 'createdAt') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      } else {
        valA = valA?.toString().toLowerCase() || '';
        valB = valB?.toString().toLowerCase() || '';
      }


      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [requests, activeTab, searchTerm, sortConfig]);


  const handleUpdateStatus = async (id, newStatus, remarks = "") => {
    try {
      await axiosAuth.patch(`/docs/status/${id}`, { status: newStatus, remarks });
      showToast(`Request ${newStatus.toLowerCase()} successfully!`);
      fetchRequests(); // Live update
      if (selectedRequest?._id === id) setSelectedRequest(null);
    } catch (err) {
      showToast("Failed to update status", "error");
    }
  };


  const exportToCSV = () => {
    const headers = "Tracking ID,Requester,Document Type,Date Submitted,Status\n";
    const rows = filteredAndSortedData.map(r =>
      `"${r._id}","${r.requesterName || ''}","${r.documentType || ''}","${new Date(r.createdAt).toLocaleDateString()}","${r.status}"`
    ).join("\n");


    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DocTrack_Export_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    showToast("CSV exported successfully");
  };


  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900 overflow-hidden">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[120] px-6 py-4 rounded-2xl shadow-2xl text-white font-bold flex items-center gap-3 ${toast.type === 'error' ? 'bg-rose-500' : 'bg-emerald-600'}`}>
          {toast.type === 'error' ? <XCircle size={20} /> : <CheckCircle size={20} />}
          {toast.msg}
        </div>
      )}


      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 h-screen p-6 fixed flex flex-col z-20">
        <div className="flex items-center gap-3 mb-10 px-2">
          <img src={neuLogo} alt="NEU Logo" className="w-10 h-10 object-contain" />
          <h2 className="text-2xl font-black tracking-tighter text-slate-800">DocTrack</h2>
        </div>


        <nav className="space-y-1 flex-1">
          <button onClick={() => setCurrentView('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${currentView === 'dashboard' ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-slate-100 text-slate-600'}`}>
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button onClick={() => setCurrentView('settings')} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${currentView === 'settings' ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-slate-100 text-slate-600'}`}>
            <Settings size={20} /> Settings
          </button>
        </nav>


        <div className="mt-auto pt-6 border-t">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold">
              {adminName.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-slate-800">{adminName}</p>
              <p className="text-xs text-slate-500">Administrator</p>
            </div>
          </div>


          <button onClick={() => window.confirm("Sign out?") && (localStorage.clear() || (window.location.href = '/login'))} className="w-full flex items-center gap-3 px-4 py-3.5 text-rose-600 hover:bg-rose-50 rounded-2xl font-bold transition-all">
            <LogOut size={20} /> Sign Out
          </button>
        </div>
      </aside>


      {/* Main Content */}
      <main className="flex-1 ml-72 p-10">
        {currentView === 'dashboard' ? (
          <div className="max-w-7xl mx-auto">
            <header className="mb-10">
              <h1 className="text-4xl font-black text-slate-900">Command Center</h1>
              <p className="text-slate-500 font-medium">Hello, <span className="font-semibold">{adminName}</span></p>
            </header>


            {/* Stats & Controls */}
            <div className="flex justify-between items-center mb-8 gap-4">
              <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100">
                {['All', 'Pending', 'Approved', 'Rejected'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>


              <div className="flex gap-3 flex-1 max-w-md">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search tracking ID or name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium"
                  />
                </div>
                <button onClick={exportToCSV} className="flex items-center gap-2 px-6 py-3.5 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 font-medium text-slate-700">
                  <Download size={20} /> Export
                </button>
              </div>
            </div>


            {/* Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="px-8 py-5 cursor-pointer" onClick={() => handleSort('requesterName')}>Student & ID</th>
                    <th className="px-6 py-5">Document</th>
                    <th className="px-6 py-5 cursor-pointer" onClick={() => handleSort('createdAt')}>Submitted</th>
                    <th className="px-6 py-5">Status</th>
                    <th className="px-8 py-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan={5} className="py-20 text-center font-bold text-slate-400">Loading requests...</td></tr>
                  ) : filteredAndSortedData.length === 0 ? (
                    <tr><td colSpan={5} className="py-20 text-center text-slate-400">No requests found</td></tr>
                  ) : (
                    filteredAndSortedData.map(req => (
                      <tr key={req._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-5">
                          <p className="font-bold text-slate-800">{req.requesterName}</p>
                          <p className="text-[10px] font-mono text-blue-500 font-bold">#{req._id?.slice(-8).toUpperCase()}</p>
                        </td>
                        <td className="px-6 py-5 text-sm font-bold text-slate-600">{req.documentType}</td>
                        <td className="px-6 py-5 text-slate-500 text-sm">{new Date(req.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-5">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            req.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                            req.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right space-x-2">
                          <button onClick={() => setSelectedRequest(req)} className="p-2 hover:bg-blue-50 rounded-xl text-slate-400 hover:text-blue-600 transition-all">
                            <Eye size={20} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 text-slate-400 font-bold">Settings Panel Coming Soon</div>
        )}
      </main>


      {/* Request Details Drawer */}
      {selectedRequest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-end bg-black/60" onClick={() => setSelectedRequest(null)}>
          <div className="bg-white w-full max-w-md h-full overflow-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Request Details</h2>
                  <p className="text-blue-600 font-mono">#{selectedRequest._id?.slice(-8).toUpperCase()}</p>
                </div>
                <button onClick={() => setSelectedRequest(null)} className="text-slate-400 hover:text-slate-600">
                  <X size={28} />
                </button>
              </div>


              <div className="mb-6">
                <span className={`inline-block px-5 py-2 rounded-full text-sm font-bold uppercase tracking-wider ${
                  selectedRequest.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                  selectedRequest.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                }`}>
                  {selectedRequest.status}
                </span>
              </div>


              <div className="space-y-4">
                <div className="bg-slate-50 rounded-2xl p-5 flex gap-4 items-start">
                  <User className="text-slate-400 mt-1" size={24} />
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">STUDENT</p>
                    <p className="font-semibold text-lg">{selectedRequest.requesterName}</p>
                  </div>
                </div>


                <div className="bg-slate-50 rounded-2xl p-5 flex gap-4 items-start">
                  <Hash className="text-slate-400 mt-1" size={24} />
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">STUDENT ID</p>
                    <p className="font-semibold">{selectedRequest.studentId || selectedRequest.requester}</p>
                  </div>
                </div>


                <div className="bg-slate-50 rounded-2xl p-5 flex gap-4 items-start">
                  <FileText className="text-slate-400 mt-1" size={24} />
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">DOCUMENT</p>
                    <p className="font-semibold">{selectedRequest.documentType}</p>
                  </div>
                </div>


                <div className="bg-slate-50 rounded-2xl p-5 flex gap-4 items-start">
                  <Mail className="text-slate-400 mt-1" size={24} />
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">EMAIL</p>
                    <p className="font-semibold text-slate-700">{selectedRequest.email || selectedRequest.requesterEmail || "N/A"}</p>
                  </div>
                </div>


                <div className="bg-slate-50 rounded-2xl p-5 flex gap-4 items-start">
                  <Clock className="text-slate-400 mt-1" size={24} />
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">SUBMITTED</p>
                    <p className="font-semibold">
                      {new Date(selectedRequest.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>


                {selectedRequest.description && (
                  <div className="bg-slate-50 rounded-2xl p-5">
                    <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-2">PURPOSE</p>
                    <p className="text-slate-600 italic">"{selectedRequest.description}"</p>
                  </div>
                )}
              </div>


              {/* Action Buttons */}
              <div className="mt-12 flex flex-col gap-3">
                {selectedRequest.status === 'Pending' ? (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleUpdateStatus(selectedRequest._id, 'Approved')}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
                    >
                      <CheckCircle size={20} /> Approve
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt("Reason for rejection?");
                        if (reason) handleUpdateStatus(selectedRequest._id, 'Rejected', reason);
                      }}
                      className="flex-1 border-2 border-rose-300 text-rose-600 hover:bg-rose-50 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
                    >
                      <XCircle size={20} /> Reject
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleUpdateStatus(selectedRequest._id, 'Pending')}
                    className="w-full py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-all"
                  >
                    <RotateCcw size={18} /> Reset to Pending
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default AdminDashboard;