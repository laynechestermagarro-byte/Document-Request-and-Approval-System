import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import neuLogo from '../assets/neu-logo.png';
import { 
  Search, Plus, FileText, Clock, CheckCircle, Edit3,
  User, LogOut, LayoutDashboard, ChevronRight, Bell
} from 'lucide-react';
import Request from '../components/Request';

const Dashboard = () => {
  const userName = localStorage.getItem('name') || "User";
  const userRole = localStorage.getItem('role') || "Requester";
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null); // Track request to edit
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchMyRequests = useCallback(async () => {
    if (!token || !userId || userId === 'undefined') {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/docs/all', {
        headers: { Authorization: `Bearer ${token}` },
        params: { role: userRole, userId: userId }
      });
      setRequests(res.data || []);
    } catch (err) {
      console.error("Error fetching requests:", err.response?.data || err);
      if (err.response?.status === 401) {
        alert("Session expired. Please log in again.");
        localStorage.clear();
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  }, [token, userId, userRole]);

  useEffect(() => {
    fetchMyRequests();
  }, [fetchMyRequests]);

  // Logic to handle opening modal for editing
  const handleEdit = (req) => {
    setEditingRequest(req);
    setIsModalOpen(true);
  };

  // Logic to handle opening modal for new request
  const handleNewRequest = () => {
    setEditingRequest(null);
    setIsModalOpen(true);
  };

  // Search Logic
  const filteredRequests = useMemo(() => {
    return requests.filter(req => 
      req.documentType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req._id?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [requests, searchTerm]);

  // Stats Logic
  const activeCount = requests.filter(r => ['Pending', 'Under Review'].includes(r.status)).length;
  const readyCount = requests.filter(r => ['Ready for Pickup'].includes(r.status)).length;
  const totalCompleted = requests.filter(r => ['Approved', 'Completed'].includes(r.status)).length;

  const handleSignOut = () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      localStorage.clear();
      window.location.href = '/login';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 h-screen p-6 fixed z-20">
        <div className="flex items-center gap-3 mb-12 px-2 cursor-pointer" onClick={() => setActiveTab('Dashboard')}>
          <img src={neuLogo} alt="Logo" className="h-10 w-auto" />
          <div className="font-black text-2xl tracking-tighter text-slate-800">DocTrack</div>
        </div>

        <nav className="space-y-1">
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={activeTab === 'Dashboard'} onClick={() => setActiveTab('Dashboard')} />
          <NavItem icon={<Clock size={20} />} label="My Requests" active={activeTab === 'My Requests'} onClick={() => setActiveTab('My Requests')} />
          <NavItem icon={<User size={20} />} label="Profile" active={activeTab === 'Profile'} onClick={() => setActiveTab('Profile')} />
        </nav>

        <div className="absolute bottom-8 left-6 right-6 space-y-4">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
             <p className="text-[10px] font-black text-slate-400 uppercase mb-3">System Status</p>
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs font-bold text-slate-600">Servers Online</span>
             </div>
          </div>
          <button onClick={handleSignOut} className="w-full bg-rose-50 text-rose-600 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-rose-100 transition-all active:scale-95">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-72">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-10 py-5 flex justify-between items-center sticky top-0 z-10">
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search tracking ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-100 border-transparent focus:bg-white focus:border-blue-500 rounded-2xl text-sm outline-none transition-all font-medium" 
            />
          </div>

          <div className="flex items-center gap-5">
            <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors relative" onClick={() => alert("No new notifications")}>
               <Bell size={22} />
               <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-white" />
            </button>
            <div className="flex items-center gap-3 border-l pl-5 border-slate-200 cursor-pointer hover:opacity-80" onClick={() => setActiveTab('Profile')}>
              <div className="text-right">
                <p className="font-bold text-slate-900 text-sm leading-none mb-1">{userName}</p>
                <p className="text-[9px] uppercase tracking-widest text-blue-500 font-black">{userRole}</p>
              </div>
              <img className="w-10 h-10 rounded-xl object-cover ring-2 ring-blue-50" src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=3b82f6&color=fff&bold=true`} alt="profile" />
            </div>
          </div>
        </header>

        <main className="p-10 max-w-7xl mx-auto">
          {activeTab === 'Dashboard' && (
            <>
              <div className="mb-10">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Student Portal</h1>
                <p className="text-slate-500 font-medium mt-1">Manage and track your document requests.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <StatCard title="Active" count={activeCount} color="blue" icon={<FileText size={24} />} status="In Progress" />
                <StatCard title="Ready for Pickup" count={readyCount} color="emerald" icon={<CheckCircle size={24} />} status="Available Now" />
                <StatCard title="Total Completed" count={totalCompleted} color="slate" icon={<Clock size={24} />} status="All Time" />
              </div>

              <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-black text-slate-800">Recent Activity</h2>
                  <button onClick={() => setActiveTab('My Requests')} className="text-sm font-bold text-blue-600 hover:underline">View All</button>
                </div>

                <div className="space-y-3">
                  {loading ? (
                    <div className="text-center py-20">
                       <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                       <p className="font-bold text-slate-400">Updating your records...</p>
                    </div>
                  ) : filteredRequests.length > 0 ? (
                    filteredRequests.slice(0, 5).map(req => (
                      <RequestItem 
                        key={req._id} 
                        req={req} 
                        onEdit={() => handleEdit(req)} 
                      />
                    ))
                  ) : (
                    <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                      <p className="text-slate-400 font-bold">No requests found.</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === 'My Requests' && (
             <div className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm">
                <h2 className="text-3xl font-black mb-8">All Document Requests</h2>
                <div className="space-y-3">
                  {filteredRequests.map(req => (
                    <RequestItem 
                      key={req._id} 
                      req={req} 
                      onEdit={() => handleEdit(req)} 
                    />
                  ))}
                  {filteredRequests.length === 0 && <p className="text-center py-10 font-bold text-slate-400">No matching records.</p>}
                </div>
             </div>
          )}

          {activeTab === 'Profile' && (
             <div className="max-w-2xl mx-auto bg-white rounded-[32px] p-10 border border-slate-200 shadow-sm text-center">
                <img className="w-32 h-32 rounded-3xl mx-auto mb-6 ring-4 ring-blue-50" src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=3b82f6&color=fff&size=128&bold=true`} alt="profile" />
                <h2 className="text-3xl font-black text-slate-900">{userName}</h2>
                <p className="text-blue-500 font-black uppercase tracking-widest text-xs mt-2">{userRole}</p>
                <div className="mt-10 grid grid-cols-1 gap-4 text-left">
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase">Student ID</p>
                    <p className="font-bold text-slate-700">{userId}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase">Account Status</p>
                    <p className="font-bold text-emerald-600">Verified</p>
                  </div>
                </div>
             </div>
          )}
        </main>
      </div>

      {/* FAB - Action Button */}
      <button 
        onClick={handleNewRequest} 
        className="fixed bottom-10 right-10 bg-slate-900 text-white pl-6 pr-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-2xl hover:bg-blue-600 transition-all active:scale-95 group z-30"
      >
        <div className="bg-white/20 p-1 rounded-lg group-hover:rotate-90 transition-transform">
           <Plus size={20} />
        </div>
        NEW REQUEST
      </button>

      {/* Updated Request Modal call */}
      <Request 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchMyRequests} 
        initialData={editingRequest} 
      />
    </div>
  );
};

// --- Sub-components ---
const NavItem = ({ icon, label, active = false, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl font-black transition-all group ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
    <div className="flex items-center gap-4">{icon} <span className="text-sm uppercase tracking-widest">{label}</span></div>
    {active && <ChevronRight size={16} />}
  </button>
);

const StatCard = ({ title, count, color, icon, status }) => {
  const colors = { blue: "bg-blue-50 text-blue-600", emerald: "bg-emerald-50 text-emerald-600", slate: "bg-slate-50 text-slate-600" };
  return (
    <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
      <div className="flex justify-between items-start mb-6">
        <div className={`p-4 rounded-2xl ${colors[color]}`}>{icon}</div>
        <div className="text-right">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
           <h3 className="text-5xl font-black text-slate-900 mt-1">{count}</h3>
        </div>
      </div>
      <div className="flex items-center gap-2 pt-4 border-t border-slate-50">
         <div className={`w-1.5 h-1.5 rounded-full ${color === 'blue' ? 'bg-blue-500' : color === 'emerald' ? 'bg-emerald-500' : 'bg-slate-500'}`} />
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{status}</p>
      </div>
    </div>
  );
};

// Updated RequestItem to include Edit Button
const RequestItem = ({ req, onEdit }) => {
  const { _id, documentType, createdAt, status } = req;
  const date = new Date(createdAt).toLocaleDateString();

  const statusStyles = { 
    "Approved": "bg-emerald-100 text-emerald-700", 
    "Under Review": "bg-amber-100 text-amber-700", 
    "Ready for Pickup": "bg-blue-100 text-blue-700", 
    "Rejected": "bg-rose-100 text-rose-700", 
    "Pending": "bg-slate-100 text-slate-700" 
  };

  return (
    <div className="group flex items-center justify-between p-5 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all">
      <div className="flex items-center gap-5">
        <div className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors shadow-sm"><FileText size={20} /></div>
        <div>
          <p className="font-bold text-slate-800">{documentType}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-mono font-bold text-blue-500">#{_id.slice(-6).toUpperCase()}</span>
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{date}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {/* Only show edit button if status is Pending */}
        {status === 'Pending' && (
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(); }} 
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            title="Edit info"
          >
            <Edit3 size={18} />
          </button>
        )}
        <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${statusStyles[status] || 'bg-slate-100 text-slate-600'}`}>{status}</span>
        <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-400" />
      </div>
    </div>
  );
};

export default Dashboard;