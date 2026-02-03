import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Mail, Lock, ShieldCheck, Sparkles
} from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import axios from 'axios';
import { useSchool } from '../context/SchoolContext';
import PublicNavbar from '../components/layout/PublicNavbar';

const SchoolLogin = () => {
    const navigate = useNavigate();
    const { config } = useSchool();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });

    const queryParams = new URLSearchParams(window.location.search);

    useEffect(() => {
        const urlSlug = queryParams.get('slug');
        if (urlSlug) {
            localStorage.setItem('portal_slug', urlSlug);
        }
    }, []);

    const portalSlug = queryParams.get('slug') || localStorage.getItem('portal_slug');

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await axios.post('/api/login/', {
                ...formData,
                portal_slug: portalSlug,
                is_admin_portal: true
            });
            if (response.data.success) {
                localStorage.setItem('user', JSON.stringify(response.data.user));

                if (response.data.portal_slug) {
                    localStorage.setItem('portal_slug', response.data.portal_slug);
                }

                navigate(response.data.redirect_url || '/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.error || "Invalid credentials. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-white font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
            <PublicNavbar darkMode={false} />

            <div className="relative z-10 w-full max-w-7xl mx-auto flex items-center justify-center min-h-screen pt-20 pb-4 lg:p-8 lg:pt-24">

                <div className="w-full grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">

                    {/* Left Panel - Brand/Marketing */}
                    <div className="hidden lg:flex flex-col justify-between h-full bg-slate-50 rounded-[2.5rem] border border-slate-100 p-12 relative overflow-hidden min-h-[600px]">
                        <div className="relative z-10 mt-8 space-y-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-full shadow-sm text-xs font-bold text-slate-600 uppercase tracking-wider">
                                <Sparkles size={12} className="text-blue-600" />
                                Admin Portal
                            </div>
                            <h1 className="text-5xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
                                Manage your school <br />
                                <span className="text-slate-400">with confidence.</span>
                            </h1>
                            <p className="text-lg text-slate-500 max-w-md leading-relaxed font-normal">
                                Access your administrative dashboard to oversee operations, finance, and academics in real-time.
                            </p>
                        </div>

                        <div className="relative z-10">
                            <div className="flex -space-x-3 mb-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 123}`} alt="User" />
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                                <div className="flex gap-0.5">
                                    {[1, 2, 3, 4, 5].map(s => <span key={s} className="text-yellow-400 text-base">★</span>)}
                                </div>
                                <span className="text-slate-500 font-medium ml-2">Trusted by 2,000+ Schools</span>
                            </div>
                        </div>

                        {/* Subtle Decor */}
                        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-50 rounded-full blur-3xl pointer-events-none opacity-50"></div>
                    </div>

                    {/* Right Panel - Login Form */}
                    <div className="w-full flex flex-col items-center justify-center p-6 lg:p-12">
                        <div className="w-full max-w-md space-y-8">

                            <div className="text-center lg:text-left space-y-2">
                                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back</h2>
                                <p className="text-slate-500">Please enter your details to sign in.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm flex items-start gap-2"
                                    >
                                        <ShieldCheck size={16} className="mt-0.5 shrink-0" />
                                        <span>{error}</span>
                                    </motion.div>
                                )}

                                <div className="space-y-4">
                                    <Input
                                        label="Email address"
                                        name="username"
                                        placeholder="name@school.com"
                                        required
                                        value={formData.username}
                                        onChange={handleChange}
                                        icon={Mail}
                                        className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:ring-slate-100 rounded-xl h-12"
                                    />

                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-semibold text-slate-700">Password</label>
                                            <button type="button" className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors">
                                                Forgot password?
                                            </button>
                                        </div>
                                        <Input
                                            type="password"
                                            name="password"
                                            placeholder="••••••••"
                                            required
                                            value={formData.password}
                                            onChange={handleChange}
                                            icon={Lock}
                                            className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:ring-slate-100 rounded-xl h-12"
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    size="lg"
                                    className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-12 font-bold shadow-lg shadow-slate-200 transition-all duration-300 hover:-translate-y-0.5"
                                    isLoading={loading}
                                >
                                    Sign In
                                </Button>
                            </form>

                            <div className="pt-6 text-center">
                                <p className="text-slate-500 text-sm">
                                    Don't have an account?{' '}
                                    <button onClick={() => navigate('/signup')} className="text-slate-900 font-bold hover:underline">
                                        Sign up for free
                                    </button>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SchoolLogin;
