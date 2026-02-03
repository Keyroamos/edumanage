import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, LayoutDashboard, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PublicNavbar from '../components/layout/PublicNavbar';

const Login = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post('/api/login/', {
                username: formData.username,
                password: formData.password
            });

            if (response.data.success) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
                if (response.data.portal_slug) {
                    localStorage.setItem('portal_slug', response.data.portal_slug);
                }
                navigate(response.data.redirect_url || '/dashboard');
            }
        } catch (err) {
            console.error('Login failed', err);
            setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-white font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
            <PublicNavbar darkMode={false} />

            <div className="relative z-10 w-full max-w-7xl mx-auto flex items-center justify-center min-h-screen pt-20 pb-4 lg:p-8 lg:pt-24">
                <div className="w-full grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">

                    {/* Left Side: Brand & Welcome */}
                    <div className="hidden lg:flex flex-col justify-between h-full min-h-[500px] bg-slate-50 rounded-[2.5rem] border border-slate-100 p-12 relative overflow-hidden">

                        <div className="relative z-10 space-y-8 mt-4">
                            <div className="inline-flex items-center space-x-2 bg-white px-3 py-1 rounded-full border border-slate-200 text-slate-600 shadow-sm">
                                <Sparkles size={14} className="text-blue-500" />
                                <span className="text-xs font-bold uppercase tracking-wider">Student & Staff Portal</span>
                            </div>

                            <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
                                Welcome to your <br />
                                <span className="text-slate-400">digital campus.</span>
                            </h1>

                            <p className="text-lg text-slate-500 max-w-md leading-relaxed">
                                Access your courses, grades, assignments, and school updates from one central hub.
                            </p>
                        </div>

                        <div className="relative z-10 mt-auto">
                            <div className="flex items-center gap-4 text-slate-900">
                                <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
                                    <LayoutDashboard className="text-blue-600" size={24} />
                                </div>
                                <div>
                                    <p className="font-bold">Unified Dashboard</p>
                                    <p className="text-xs text-slate-500">Everything in one place</p>
                                </div>
                            </div>
                        </div>

                        {/* Subtle Decor */}
                        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-blue-100 rounded-full blur-3xl pointer-events-none opacity-60"></div>
                        <div className="absolute top-1/2 right-0 w-64 h-64 bg-violet-100 rounded-full blur-3xl pointer-events-none opacity-40"></div>
                    </div>

                    {/* Right Side: Login Card */}
                    <div className="w-full max-w-md mx-auto p-4">
                        <div className="text-center lg:text-left mb-10">
                            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Sign In</h2>
                            <p className="text-slate-500">Enter your credentials to access your account.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="flex items-start gap-3 p-4 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">
                                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                                    <p className="font-medium">{error}</p>
                                </div>
                            )}

                            <div className="space-y-5">
                                <Input
                                    label="Email or Username"
                                    type="text"
                                    placeholder="student@school.edu"
                                    icon={Mail}
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    required
                                    className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:ring-slate-100 h-12 rounded-xl"
                                />

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-semibold text-slate-700">Password</label>
                                        <a href="#" className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">
                                            Forgot password?
                                        </a>
                                    </div>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        icon={Lock}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                        className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:ring-slate-100 h-12 rounded-xl"
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-14 rounded-xl shadow-lg shadow-slate-200 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                                size="lg"
                                isLoading={loading}
                            >
                                <span className="flex items-center justify-center gap-2">
                                    Access Portal
                                    <ArrowRight size={18} />
                                </span>
                            </Button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-xs text-slate-400 flex items-center justify-center gap-2">
                                <ShieldCheck size={14} />
                                Secure SSL Encryption
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
