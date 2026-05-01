import React, { useState } from 'react';
import neuLogo from '../assets/neu-logo.png';
import { Search, Eye, CheckCircle, XCircle } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const requests = [
    { id: "23-12345-678", type: "Transcript of Records", requester: "Badong", date: "April 18, 2026", status: "Pending" },
    { id: "23-12345-679", type: "Certificate of Good Moral", requester: "demo:Maria Santos", date: "April 09, 2026", status: "Under Review" },
    { id: "23-12345-680", type: "Diploma", requester: "demo:Pedro Reyes", date: "April 08, 2026", status: "Approved" },
    { id: "23-12345-681", type: "Honorable Dismissal", requester: "demo:Ana Lopez", date: "April 07, 2026", status: "Ready" },
  ];

  const tabs = ['All', 'Pending', 'Under Review', 'Approved', 'Ready', 'Rejected'];

  const handleSignOut = () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      localStorage.clear();
      window.location.href = '/login';
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesTab = activeTab === 'All' || req.status === activeTab;
    const matchesSearch = req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          req.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          req.requester.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Action Handlers (for Week 13)
  const handleView = (id) => alert(`Viewing details for request ${id}`);
  const handleApprove = (id) => alert(`Request ${id} has been Approved`);
  const handleReject = (id) => alert(`Request ${id} has been Rejected`);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      {/* Sidebar */}
      <div className="w-72 bg-white border-r border-slate-200 h-screen p-6 fixed flex flex-col">
        <div className="flex items-center gap-3 mb-12">
          <img src={neuLogo} alt="National University" className="h-11 w-auto" />
          <div>
            <span className="font-bold text-2xl text-slate-900">DocTrack</span>
            <p className="text-xs text-slate-500 -mt-1">NU Document System</p>
          </div>
        </div>

        <div className="mb-8">
          <p className="uppercase text-xs font-semibold tracking-widest text-slate-500 mb-3">Navigation</p>
          <div className="bg-blue-50 text-blue-700 px-5 py-3 rounded-2xl font-medium flex items-center gap-3">
            👑 Admin Panel
          </div>
        </div>

        <nav className="space-y-1 flex-1">
          <NavItem label="Admin Command Center" active />
          <NavItem label="All Requests" />
          <NavItem label="Users Management" />
          <NavItem label="Document Types" />
          <NavItem label="Reports & Analytics" />
        </nav>

        <div className="mt-auto pt-6 border-t">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">B</div>
            <div>
              <p className="font-medium text-slate-900">badong11</p>
              <p className="text-xs text-slate-500">Administrator</p>
            </div>
          </div>
          <button onClick={handleSignOut} className="w-full flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 py-3 rounded-2xl font-medium transition">
            ← Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-72 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Admin Command Center</h1>
              <p className="text-slate-600 mt-1">Review and manage all document requests</p>
            </div>
            <div className="flex gap-3">
              <div className="bg-amber-100 text-amber-700 px-6 py-2.5 rounded-2xl text-sm font-medium">
                Pending Today: {requests.filter(r => r.status === 'Pending').length}
              </div>
              <div className="bg-emerald-100 text-emerald-700 px-6 py-2.5 rounded-2xl text-sm font-medium">
                Completed: {requests.filter(r => ['Approved', 'Ready'].includes(r.status)).length}
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-8">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search by ID, document, or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-3xl focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-3">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-2xl font-medium whitespace-nowrap transition-all ${
                  activeTab === tab ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
            <div className="grid grid-cols-12 bg-slate-50 px-8 py-5 text-sm font-semibold text-slate-500 border-b">
              <div className="col-span-2">Tracking ID</div>
              <div className="col-span-3">Document Type</div>
              <div className="col-span-2">Requester</div>
              <div className="col-span-2">Date Submitted</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>

            {filteredRequests.map((req, index) => (
              <div key={index} className="grid grid-cols-12 px-8 py-6 border-b hover:bg-slate-50 items-center">
                <div className="col-span-2 font-medium">{req.id}</div>
                <div className="col-span-3">{req.type}</div>
                <div className="col-span-2">{req.requester}</div>
                <div className="col-span-2 text-slate-600">{req.date}</div>
                <div className="col-span-2">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-medium ${
                    req.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                    req.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                    req.status === 'Under Review' ? 'bg-blue-100 text-blue-700' :
                    req.status === 'Ready' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {req.status}
                  </span>
                </div>
                <div className="col-span-1 text-right flex gap-2 justify-end">
                  <button onClick={() => handleView(req.id)} className="text-blue-600 hover:text-blue-700 p-1">
                    <Eye size={18} />
                  </button>
                  {req.status === 'Pending' || req.status === 'Under Review' ? (
                    <>
                      <button onClick={() => handleApprove(req.id)} className="text-emerald-600 hover:text-emerald-700 p-1">
                        <CheckCircle size={18} />
                      </button>
                      <button onClick={() => handleReject(req.id)} className="text-red-600 hover:text-red-700 p-1">
                        <XCircle size={18} />
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const NavItem = ({ label, active = false }) => (
  <div className={`px-5 py-3 rounded-2xl font-medium cursor-pointer transition ${
    active ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-100 text-slate-700'
  }`}>
    {label}
  </div>
);

export default AdminDashboard;