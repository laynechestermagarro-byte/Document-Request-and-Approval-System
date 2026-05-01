import React, { useState } from 'react';
import neuLogo from '../assets/neu-logo.png';
import { Search, Bell, Plus, FileText, Clock, CheckCircle, User } from 'lucide-react';
import Request from '../components/Request';

const Dashboard = () => {
  const userName = "Badong";
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle Sign Out
  const handleSignOut = () => {
    const confirmLogout = window.confirm("Are you sure you want to sign out?");

    if (confirmLogout) {
      // Clear authentication data
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('name');

      // Redirect to login page
      window.location.href = '/login';   // Change this if your login route is different
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      {/* Sidebar */}
      <div className="w-72 bg-white border-r border-slate-200 h-screen p-6 fixed">
        <div className="flex items-center gap-3 mb-12">
          <img 
            src={neuLogo} 
            alt="Logo" 
            className="h-11 w-auto"
          />
          <div>
            <span className="font-bold text-2xl text-slate-900 tracking-tight">DocTrack</span>
            <p className="text-xs text-slate-500 -mt-1">Document Request and Approval System</p>
          </div>
        </div>

        <nav className="space-y-2">
          <NavItem icon={<FileText size={20} />} label="Dashboard" active />
          <NavItem icon={<FileText size={20} />} label="Documents" />
          <NavItem icon={<Clock size={20} />} label="My Requests" />
          <NavItem icon={<CheckCircle size={20} />} label="History" />
          <NavItem icon={<User size={20} />} label="Profile" />
        </nav>

        {/* Sign Out Button - Now Working */}
        <div className="absolute bottom-8 left-6 right-6">
          <button 
            onClick={handleSignOut}
            className="w-full bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 py-3.5 rounded-2xl font-medium transition-all flex items-center justify-center gap-2"
          >
            ← Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-72">
        {/* Top Navigation */}
        <nav className="bg-white border-b border-slate-200 px-10 py-5 flex justify-between items-center">
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search requests, documents..." 
              className="w-full pl-12 pr-4 py-3 bg-slate-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-6">
            <Bell className="text-slate-400 hover:text-slate-600 cursor-pointer transition" size={22} />
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="font-semibold text-slate-900 text-sm">Hello, {userName}</p>
                <p className="text-xs text-slate-500">Requester</p>
              </div>
              <div className="w-10 h-10 bg-slate-200 rounded-full overflow-hidden border-2 border-white">
                <img 
                  src={`https://ui-avatars.com/api/?name=${userName}&background=3b82f6&color=fff`} 
                  alt="profile" 
                />
              </div>
            </div>
          </div>
        </nav>

        {/* Dashboard Content */}
        <main className="p-10 max-w-7xl mx-auto">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-slate-900">
              Good morning, {userName}!
            </h1>
            <p className="text-slate-600 mt-2 text-lg">
              Here's what's happening with your document requests today.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <StatCard title="Active Requests" count="0" status="+2 this week" color="blue" icon={<FileText size={28} />} />
            <StatCard title="Ready for Pickup" count="0" status="Action Required" color="emerald" icon={<CheckCircle size={28} />} />
            <StatCard title="Total Completed" count="0" status="All Time" color="slate" icon={<Clock size={28} />} />
          </div>

          {/* Recent Requests */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900">Recent Document Requests</h2>
              <button className="text-blue-600 font-medium hover:underline">View all →</button>
            </div>

            <div className="space-y-3">
              <RequestItem name="Transcript of Records" date="April 18, 2026" status="Under Review" />
              <RequestItem name="Certificate of Good Moral" date="April 08, 2026" status="Approved" />
              <RequestItem name="Diploma Request" date="April 05, 2026" status="Ready for Pickup" />
            </div>
          </div>
        </main>
      </div>

      {/* Floating New Request Button */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-xl transition-all active:scale-95"
      >
        <Plus size={24} strokeWidth={3} />
        New Request
      </button>

      {/* Modal */}
      <Request 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

// Sub Components
const NavItem = ({ icon, label, active = false }) => (
  <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl font-medium cursor-pointer transition
    ${active ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-100 text-slate-700'}`}>
    {icon}
    <span>{label}</span>
  </div>
);

const StatCard = ({ title, count, status, color, icon }) => {
  const colorMap = {
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
    slate: "text-slate-600 bg-slate-50 border-slate-100"
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
      <div className="flex justify-between items-start">
        <div>
          <p className="uppercase text-xs tracking-widest font-bold text-slate-400">{title}</p>
          <h3 className="text-6xl font-black text-slate-900 mt-4">{count}</h3>
        </div>
        <div className={`p-4 rounded-2xl ${colorMap[color]}`}>
          {icon}
        </div>
      </div>
      <p className="text-sm text-slate-500 mt-6">{status}</p>
    </div>
  );
};

const RequestItem = ({ name, date, status }) => {
  const statusStyles = {
    "Approved": "bg-emerald-100 text-emerald-700",
    "Ready for Pickup": "bg-blue-100 text-blue-700",
    "Under Review": "bg-amber-100 text-amber-700"
  };

  return (
    <div className="flex items-center justify-between p-6 rounded-2xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all">
      <div className="flex items-center gap-5">
        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500">
          <FileText size={28} />
        </div>
        <div>
          <p className="font-semibold text-slate-900 text-lg">{name}</p>
          <p className="text-slate-500 text-sm">Requested on {date}</p>
        </div>
      </div>
      <span className={`px-6 py-2.5 rounded-2xl text-sm font-bold ${statusStyles[status] || 'bg-slate-100 text-slate-600'}`}>
        {status}
      </span>
    </div>
  );
};

export default Dashboard;