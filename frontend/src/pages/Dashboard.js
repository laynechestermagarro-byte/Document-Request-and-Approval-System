import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import neuLogo from '../assets/neu-logo.png';
import { Search, Plus, FileText, Clock, CheckCircle, User, LogOut } from 'lucide-react';
import Request from '../components/Request';

const NavItem = ({ icon, label, active = false }) => (
  <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl font-bold cursor-pointer transition 
    ${active ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
    {icon} <span className="text-sm">{label}</span>
  </div>
);

const StatCard = ({ title, count, color, icon, status }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    slate: "bg-slate-50 text-slate-600"
  };

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
          <h3 className="text-6xl font-black text-slate-900 mt-2">{count}</h3>
        </div>
        <div className={`p-4 rounded-2xl ${colors[color]}`}>{icon}</div>
      </div>
      <p className="text-xs font-bold text-slate-400 mt-6">{status}</p>
    </div>
  );
};

const RequestItem = ({ name, description, date, status, isAdmin, onApprove, onReject }) => {
  const styles = {
    "Approved": "bg-emerald-50 text-emerald-600 border-emerald-100",
    "Under Review": "bg-amber-50 text-amber-600 border-amber-100",
    "Ready": "bg-blue-50 text-blue-600 border-blue-100",
    "Rejected": "bg-red-50 text-red-600 border-red-100"
  };

  return (
    <div className="flex items-center justify-between p-6 rounded-2xl border border-slate-100 hover:bg-slate-50/50 transition-colors">
      <div className="flex items-center gap-5">
        <div className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
          <FileText size={24} />
        </div>
        <div className="text-left">
          <p className="font-bold text-slate-900">{name}</p>
          <p className="text-slate-400 text-xs font-medium">Submitted on {date}</p>
          {description && (
            <p className="text-slate-500 text-xs mt-2 italic bg-slate-50 px-3 py-1 rounded-lg inline-block">
              “{description}”
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${styles[status] || 'bg-slate-50'}`}>
          {status}
        </span>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const userName = localStorage.getItem('name') || "User";
  const userRole = localStorage.getItem('role') || "Requester";
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const axiosAuth = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: { Authorization: `Bearer ${token}` }
  });

  const fetchRequests = useCallback(async () => {
    if (!userId || !token) {
      setLoading(false);
      return;
    }

    try {
      const res = await axiosAuth.get('/docs/all', {
        params: { role: userRole, userId }
      });
      setRequests(res.data);
    } catch (err) {
      console.error("Error fetching requests:", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  }, [userRole, userId, token, axiosAuth]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleSignOut = () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      localStorage.clear();
      window.location.href = '/login';
    }
  };

  const activeCount = requests.filter(r => ['Pending', 'Under Review'].includes(r.status)).length;
  const readyCount = requests.filter(r => r.status === 'Ready').length;
  const totalCompleted = requests.filter(r => ['Approved', 'Ready'].includes(r.status)).length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      {/* Sidebar */}
      <div className="w-72 bg-white border-r border-slate-200 h-screen p-6 fixed shadow-sm">
        <div className="flex items-center gap-3 mb-12">
          <img src={neuLogo} alt="Logo" className="h-11 w-auto" />
          <div className="font-bold text-2xl text-slate-900 tracking-tight">DocTrack</div>
        </div>

        <nav className="space-y-2">
          <NavItem icon={<FileText size={20} />} label="Dashboard" active />
          <NavItem icon={<Clock size={20} />} label="My Requests" />
          <NavItem icon={<User size={20} />} label="Profile" />
        </nav>

        <div className="absolute bottom-8 left-6 right-6">
          <button onClick={handleSignOut} className="w-full bg-red-50 text-red-600 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-72">
        <nav className="bg-white border-b border-slate-200 px-10 py-5 flex justify-between items-center sticky top-0 z-10">
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input type="text" placeholder="Search..." className="w-full pl-12 pr-4 py-3 bg-slate-100 rounded-2xl text-sm outline-none focus:ring-2 ring-blue-100 transition" />
          </div>

          <div className="flex items-center gap-3 border-l pl-6 border-slate-200">
            <div className="text-right">
              <p className="font-bold text-slate-900 text-sm">{userName}</p>
              <p className="text-[10px] uppercase text-blue-500 font-bold">{userRole}</p>
            </div>
            <img className="w-10 h-10 rounded-full" src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=3b82f6&color=fff`} alt="profile" />
          </div>
        </nav>

        <main className="p-10 max-w-7xl mx-auto">
          <h1 className="text-4xl font-black text-slate-900 mb-10">Welcome back, {userName}!</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <StatCard title="Active Requests" count={activeCount} color="blue" icon={<FileText size={28} />} status="Pending Review" />
            <StatCard title="Ready for Pickup" count={readyCount} color="emerald" icon={<CheckCircle size={28} />} status="Available" />
            <StatCard title="Total Completed" count={totalCompleted} color="slate" icon={<Clock size={28} />} status="All Time" />
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <h2 className="text-2xl font-bold mb-8">Recent Activity</h2>
            <div className="space-y-4">
              {loading ? (
                <p className="text-center py-10 font-medium text-slate-400">Loading requests...</p>
              ) : requests.length > 0 ? (
                requests.map(req => (
                  <RequestItem
                    key={req._id}
                    name={req.documentType}
                    description={req.description}
                    date={new Date(req.createdAt || req.submittedAt).toLocaleDateString()}
                    status={req.status}
                    isAdmin={false}
                  />
                ))
              ) : (
                <p className="text-center text-slate-400 py-10 font-medium">No document requests found.</p>
              )}
            </div>
          </div>
        </main>
      </div>

      {userRole === 'Requester' && (
        <button onClick={() => setIsModalOpen(true)} className="fixed bottom-8 right-8 bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-xl hover:bg-blue-700">
          <Plus size={24} /> New Request
        </button>
      )}

      <Request isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchRequests} />
    </div>
  );
};

export default Dashboard;