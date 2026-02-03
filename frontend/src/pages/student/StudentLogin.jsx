import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import axios from 'axios';

import { useSchool } from '../../context/SchoolContext';

const StudentLogin = () => {
    const navigate = useNavigate();
    const { config } = useSchool();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
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

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post('/api/login/', {
                username: formData.username,
                password: formData.password,
                portal_slug: portalSlug // Send portal slug for validation
            });

            if (response.data.success) {
                // Store user data
                localStorage.setItem('user', JSON.stringify(response.data.user));

                // Store portal slug if provided (overwrite any existing one)
                if (response.data.portal_slug) {
                    localStorage.setItem('portal_slug', response.data.portal_slug);
                }

                // Check if user is a student
                if (response.data.user.role === 'student' && response.data.user.student_id) {
                    navigate(`/student/${response.data.user.student_id}`);
                } else {
                    setError('This portal is for students only');
                }
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-900 selection:bg-green-100 selection:text-green-900">
            <div className="w-full max-w-md bg-white rounded-3xl p-8 lg:p-10 shadow-xl shadow-slate-200/50 border border-slate-100">

                {/* Logo & Title */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 text-green-600 rounded-2xl mb-6">
                        <GraduationCap size={32} />
                    </div>
                    {loadingSchool ? (
                        <div className="animate-pulse space-y-2">
                            <div className="h-6 bg-slate-100 rounded w-3/4 mx-auto"></div>
                            <div className="h-4 bg-slate-50 rounded w-1/2 mx-auto"></div>
                        </div>
                    ) : (
                        <>
                            <h1 className="text-2xl font-bold text-slate-900 mb-2">
                                {schoolConfig?.school_name || 'Student Portal'}
                            </h1>
                            <p className="text-slate-500">
                                Sign in to check your grades & schedule
                            </p>
                            {portalSlug && (
                                <div className="mt-4">
                                    <span className="text-xs font-bold text-slate-400 bg-slate-50 border border-slate-100 px-3 py-1 rounded-full uppercase tracking-wider">
                                        {portalSlug}
                                    </span>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                        <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm font-medium text-red-700">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <Input
                        label="Student ID"
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Enter your student ID"
                        required
                        autoFocus
                        icon={User}
                        className="bg-white"
                    />

                    <div>
                        <Input
                            label="Password"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            required
                            icon={Lock}
                            className="bg-white"
                        />
                        <div className="flex justify-end mt-1">
                            <a href="#" className="text-xs font-semibold text-green-600 hover:text-green-700">
                                Forgot password?
                            </a>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-12 rounded-xl shadow-lg shadow-slate-200"
                        isLoading={loading}
                    >
                        <span className="flex items-center justify-center gap-2">
                            Sign In
                            <ArrowRight size={16} />
                        </span>
                    </Button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-50 text-center text-xs text-slate-400">
                    Need help? Contact your school administrator
                </div>
            </div>
        </div>
    );
};

export default StudentLogin;
