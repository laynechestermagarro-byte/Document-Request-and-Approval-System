import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import neuLogo from '../assets/neu-logo.png';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const validateForm = () => {
        const newErrors = {};
        if (!email.trim()) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Please enter a valid email";

        if (!password) newErrors.password = "Password is required";
        else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async (e) => {
    e.preventDefault();
    setMsg("");
    
    if (!validateForm()) return;
    setLoading(true);

    try {
        const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
        const data = res.data;

        // 1. Extract the ID with fallbacks
        const userId = data.id || data.userId || data._id;

        if (!userId) {
            console.error("❌ Backend did not return a User ID!");
            setMsg("❌ Server error: Missing User ID. Contact Admin.");
            setLoading(false);
            return;
        }

        // 2. Save to localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('name', data.name || 'User');
        localStorage.setItem('userId', userId); // No more "undefined" strings

        console.log("✅ Login successful. Saved User ID:", userId);
        setMsg("✅ Login Successful! Redirecting...");

        setTimeout(() => {
            if (data.role === 'Admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        }, 1000);

    } catch (err) {
        setMsg(`❌ ${err.response?.data?.message || "Invalid credentials"}`);
    } finally {
        setLoading(false);
    }
};

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md">
                <img src={neuLogo} alt="NEU Logo" className="w-20 h-20 mx-auto mb-6" />
                
                <h2 className="text-3xl font-extrabold text-center mb-1">DocTrack</h2>
                <p className="text-slate-500 text-center mb-10">Sign in to your account</p>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold mb-1.5 text-slate-700">Email</label>
                        <input 
                            type="email" 
                            placeholder="you@example.com" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`w-full px-4 py-3.5 border rounded-xl focus:ring-2 outline-none transition ${errors.email ? 'border-red-500' : 'border-slate-200 focus:ring-blue-500'}`} 
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1.5 text-slate-700">Password</label>
                        <input 
                            type="password" 
                            placeholder="••••••••" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`w-full px-4 py-3.5 border rounded-xl focus:ring-2 outline-none transition ${errors.password ? 'border-red-500' : 'border-slate-200 focus:ring-blue-500'}`} 
                        />
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                    </div>

                    <button 
                        disabled={loading} 
                        className={`w-full py-4 rounded-xl font-bold text-white transition-all ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {loading ? "Authenticating..." : "Sign In"}
                    </button>
                </form>

                {msg && (
                    <div className={`mt-6 text-center p-3 rounded-xl text-sm font-bold ${msg.includes('✅') ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                        {msg}
                    </div>
                )}

                <p className="mt-10 text-center text-slate-600 text-sm font-medium">
                    Don't have an account? <Link to="/register" className="text-blue-600 font-bold hover:underline">Register</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;