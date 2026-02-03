import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Shield, Lock, Mail, Eye, EyeOff, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const SuperAdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post('/api/login/', {
                email: email,
                password: password,
                is_admin_portal: true
            });

            if (response.data.success) {
                const user = response.data.user;
                if (!user.is_superuser) {
                    toast.error('Access Denied: Not a superuser');
                    setLoading(false);
                    return;
                }

                localStorage.setItem('user', JSON.stringify(user));
                localStorage.removeItem('portal_slug'); // Ensure no school context for super admin
                toast.success('Access Granted. Welcome, Commander.');
                navigate('/ultimate-control-center');
            }
        } catch (error) {
            console.error('Login error:', error);
            const errorMsg = error.response?.data?.error || 'Authentication failed';
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-600/10 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>

            <div className="w-full max-w-md relative z-10 transition-all duration-500">
                {/* Logo & Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl mb-6 group hover:border-primary-500/50 transition-all duration-500">
                        <Shield className="w-10 h-10 text-primary-500 group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight mb-2">ULTIMATE CONTROL</h1>
                    <p className="text-slate-400 text-sm uppercase tracking-[0.2em] font-medium">Platform Command Center</p>
                </div>

                {/* Login Form Card */}
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Administrator Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary-500 transition-colors" />
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Access Key</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary-500 transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-12 text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2 group transition-all duration-300 ${loading ? 'opacity-70 cursor-wait' : ''}`}
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    AUTHORIZE ACCESS
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer Footer */}
                <div className="mt-8 text-center">
                    <p className="text-slate-600 text-xs font-medium tracking-wide">
                        SECURE TERMINAL &bull; ENCRYPTED SESSION &bull; v2.0.4
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminLogin;
