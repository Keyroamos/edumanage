import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, DollarSign, AlertCircle, TrendingUp, PieChart, Wallet } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import axios from 'axios';
import { useSchool } from '../../context/SchoolContext';

const FinanceLogin = () => {
    const navigate = useNavigate();
    const { config } = useSchool();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [schoolConfig, setSchoolConfig] = useState(null);
    const [loadingSchool, setLoadingSchool] = useState(true);

    // Get portal slug from URL query param or localStorage (set by PortalRouter)
    const queryParams = new URLSearchParams(window.location.search);
    const portalSlug = queryParams.get('slug') || localStorage.getItem('portal_slug');

    // Store it in localStorage if found in URL to ensure consistency
    if (queryParams.get('slug')) {
        localStorage.setItem('portal_slug', queryParams.get('slug'));
    }

    // Fetch school config based on portal slug
    React.useEffect(() => {
        const fetchSchoolConfig = async () => {
            if (portalSlug) {
                try {
                    const response = await axios.get('/api/config/', {
                        headers: {
                            'X-Portal-Slug': portalSlug
                        }
                    });
                    setSchoolConfig(response.data);
                } catch (err) {
                    console.error('Failed to fetch school config:', err);
                    setSchoolConfig(config);
                } finally {
                    setLoadingSchool(false);
                }
            } else {
                setSchoolConfig(config);
                setLoadingSchool(false);
            }
        };

        fetchSchoolConfig();
    }, [portalSlug, config]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post('/api/auth/login/', {
                ...formData,
                portal_slug: portalSlug
            });

            if (response.data.success) {
                localStorage.setItem('user', JSON.stringify(response.data.user));

                // Store portal slug if provided (overwrite any existing one)
                if (response.data.portal_slug) {
                    localStorage.setItem('portal_slug', response.data.portal_slug);
                }

                if (response.data.user.role === 'admin' || response.data.user.is_staff) {
                    navigate('/finance-portal/dashboard');
                } else {
                    if (response.data.user.role === 'student' || response.data.user.role === 'teacher' || response.data.user.role === 'driver') {
                        setError('Access Denied. This portal is for Finance Staff only.');
                        localStorage.removeItem('user');
                    } else {
                        navigate('/finance-portal/dashboard');
                    }
                }
            } else {
                setError(response.data.error || 'Login failed');
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-slate-50 dark:bg-slate-900 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-green-500/20 rounded-full blur-3xl"></div>
            </div>

            {/* Left Side - Hero Section */}
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-emerald-600 to-emerald-800 relative overflow-hidden items-center justify-center p-12">
                {/* Grid Pattern */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M0 0 L100 0 L100 100 L0 100 Z" fill="url(#grid)" />
                        <defs>
                            <pattern id="grid" width="4" height="4" patternUnits="userSpaceOnUse">
                                <path d="M 4 0 L 0 0 0 4" fill="none" stroke="currentColor" strokeWidth="0.5" />
                            </pattern>
                        </defs>
                    </svg>
                </div>

                {/* Floating Blobs */}
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

                <div className="relative z-10 text-white max-w-lg">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="h-16 w-16 bg-white/10 backdrop-blur-lg rounded-2xl flex items-center justify-center mb-8 border border-white/20">
                            <DollarSign size={32} className="text-white" />
                        </div>
                        <h1 className="text-5xl font-bold mb-6 leading-tight">
                            Finance <span className="text-emerald-300">Portal</span>
                        </h1>
                        <p className="text-lg text-emerald-100 mb-8 leading-relaxed">
                            Manage student accounts, track payments, and oversee all financial operations with precision and ease.
                        </p>

                        <div className="space-y-4">
                            <div className="flex items-center space-x-4 bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
                                <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                    <TrendingUp className="text-emerald-300" size={20} />
                                </div>
                                <div>
                                    <p className="font-medium">Revenue Tracking</p>
                                    <p className="text-sm text-emerald-200">Monitor income in real-time</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4 bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
                                <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                    <PieChart className="text-emerald-300" size={20} />
                                </div>
                                <div>
                                    <p className="font-medium">Financial Reports</p>
                                    <p className="text-sm text-emerald-200">Generate comprehensive analytics</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4 bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
                                <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                    <Wallet className="text-emerald-300" size={20} />
                                </div>
                                <div>
                                    <p className="font-medium">Payment Processing</p>
                                    <p className="text-sm text-emerald-200">Secure transaction management</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="w-full max-w-md"
                >
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex justify-center mb-8">
                        <div className="h-20 w-20 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 text-white">
                            <DollarSign size={40} />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-8 border border-slate-100 dark:border-slate-800">
                        <div className="text-center lg:text-left mb-8">
                            {loadingSchool ? (
                                <div className="animate-pulse">
                                    <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                                </div>
                            ) : (
                                <>
                                    <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                                        {schoolConfig?.school_name || 'School'} Finance Portal
                                    </h2>
                                    <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm lg:text-base">
                                        Sign in to manage accounts & payments
                                    </p>
                                    {portalSlug && (
                                        <p className="mt-2 text-xs text-slate-400 dark:text-slate-500 font-mono bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded inline-block">
                                            Portal: {portalSlug}
                                        </p>
                                    )}
                                </>
                            )}
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2 p-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/50 mb-6"
                            >
                                <AlertCircle size={16} className="shrink-0" />
                                <p>{error}</p>
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <Input
                                label="Email Address or Username"
                                type="text"
                                placeholder="name@school.com or username"
                                icon={Mail}
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                                className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                            />

                            <Input
                                label="Password"
                                type="password"
                                placeholder="••••••••"
                                icon={Lock}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                            />

                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all"
                                size="lg"
                                isLoading={loading}
                            >
                                Sign In
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </form>
                    </div>

                    {/* Footer */}
                    <p className="mt-8 text-center text-sm text-slate-400 dark:text-slate-500">
                        © {new Date().getFullYear()} {schoolConfig?.school_name || config.school_name}. All rights reserved.
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default FinanceLogin;
