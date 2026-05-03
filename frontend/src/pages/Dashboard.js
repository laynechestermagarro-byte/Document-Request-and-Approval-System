import React, { useState, useEffect } from 'react';
import axios from 'axios';
import neuLogo from '../assets/neu-logo.png';
// Task 3.5: Cleaned up imports to fix "defined but never used" warnings
import { Search, Bell, Plus, FileText, Clock, CheckCircle, User, LogOut } from 'lucide-react';
import Request from '../components/Request';

const Dashboard = () => {
  const userName = localStorage.getItem('name') || "User";
  const userRole = localStorage.getItem('role') || "Requester";
  const userId = localStorage.getItem('userId');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Task 3.4: Integration of Document APIs
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/docs/all`, {
          params: { role: userRole, userId: userId }
        });
        setRequests(res.data);
      } catch (err) {
        console.error("Error fetching requests:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [userRole, userId]);

  const handleSignOut = () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      localStorage.clear();
      window.location.href = '/login';
    }
  };

  const activeCount = requests.filter(r => r.status === 'Under Review').length;
  const readyCount = requests.filter(r => r.status === 'Ready for Pickup').length;
  const totalCompleted = requests.filter(r => r.status === 'Approved').length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      {/* Sidebar */}
      <div className="w-72 bg-white border-r border-slate-200 h-screen p-6 fixed">
        <div className="flex items-center gap-3 mb-12">
          <img src={neuLogo} alt="Logo" className="h-11 w-auto" />
          <div>
            <span className="font-bold text-2xl text-slate-900 tracking-tight">DocTrack</span>
            <p className="text-xs text-slate-500 -mt-1">Document Request System</p>
          </div>
        </div>

        <nav className="space-y-2">
          <NavItem icon={<FileText size={20} />} label="Dashboard" active />
          <NavItem icon={<FileText size={20} />} label="Documents" />
          <NavItem icon={<Clock size={20} />} label="My Requests" />
          <NavItem icon={<CheckCircle size={20} />} label="History" />
          <NavItem icon={<User size={20} />} label="Profile" />
        </nav>

        <div className="absolute bottom-8 left-6 right-6">
          <button onClick={handleSignOut} className="w-full bg-red-50 text-red-600 py-3.5 rounded-2xl font-medium flex items-center justify-center gap-2">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-72">
        <nav className="bg-white border-b border-slate-200 px-10 py-5 flex justify-between items-center">
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input type="text" placeholder="Search..." className="w-full pl-12 pr-4 py-3 bg-slate-100 rounded-2xl text-sm outline-none" />
          </div>

          <div className="flex items-center gap-6">
            <Bell className="text-slate-400" size={22} />
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="font-semibold text-slate-900 text-sm">{userName}</p>
                <p className="text-xs text-slate-500">{userRole}</p>
              </div>
              <img className="w-10 h-10 rounded-full" src={`https://ui-avatars.com/api/?name=${userName}&background=3b82f6&color=fff`} alt="profile" />
            </div>
          </div>
        </nav>

        <main className="p-10 max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-slate-900">Good morning, {userName}!</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-12">
            <StatCard title="Active Requests" count={activeCount} color="blue" icon={<FileText size={28} />} status="Pending" />
            <StatCard title="Ready for Pickup" count={readyCount} color="emerald" icon={<CheckCircle size={28} />} status="Action Required" />
            <StatCard title="Total Completed" count={totalCompleted} color="slate" icon={<Clock size={28} />} status="All Time" />
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <h2 className="text-2xl font-bold mb-8">Recent Document Requests</h2>
            <div className="space-y-3">
              {loading ? <p>Loading...</p> : requests.map(req => (
                <RequestItem 
                  key={req._id} 
                  name={userRole === 'Admin' ? `${req.requester?.name} - ${req.documentType}` : req.documentType} 
                  date={new Date(req.createdAt).toLocaleDateString()} 
                  status={req.status} 
                />
              ))}
            </div>
          </div>
        </main>
      </div>

      {userRole === 'Requester' && (
        <button onClick={() => setIsModalOpen(true)} className="fixed bottom-8 right-8 bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-xl">
          <Plus size={24} /> New Request
        </button>
      )}
      <Request isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

// --- SUB-COMPONENTS (These fix the "is not defined" errors) ---

const NavItem = ({ icon, label, active = false }) => (
  <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl font-medium cursor-pointer transition ${active ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-100'}`}>
    {icon} <span>{label}</span>
  </div>
);

const StatCard = ({ title, count, color, icon, status }) => {
  const colors = { blue: "bg-blue-50 text-blue-600", emerald: "bg-emerald-50 text-emerald-600", slate: "bg-slate-50 text-slate-600" };
  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
      <div className="flex justify-between">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</p>
          <h3 className="text-6xl font-black mt-4">{count}</h3>
        </div>
        <div className={`p-4 rounded-2xl ${colors[color]}`}>{icon}</div>
      </div>
      <p className="text-sm text-slate-500 mt-6">{status}</p>
    </div>
  );
};

const RequestItem = ({ name, date, status }) => {
  const styles = { "Approved": "bg-emerald-100 text-emerald-700", "Under Review": "bg-amber-100 text-amber-700", "Ready for Pickup": "bg-blue-100 text-blue-700" };
  return (
    <div className="flex items-center justify-between p-6 rounded-2xl border border-slate-100">
      <div className="flex items-center gap-5">
        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500"><FileText size={28} /></div>
        <div>
          <p className="font-semibold text-lg">{name}</p>
          <p className="text-slate-500 text-sm">Requested on {date}</p>
        </div>
      </div>
      <span className={`px-6 py-2.5 rounded-2xl text-sm font-bold ${styles[status] || 'bg-slate-100'}`}>{status}</span>
    </div>
  );
};

export default Dashboard;