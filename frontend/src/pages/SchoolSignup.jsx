import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Building2, Mail, Phone, MapPin, Lock, Camera,
    ArrowRight, ShieldCheck, CheckCircle2, Loader2, Zap, Star, Crown, Sparkles
} from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import axios from 'axios';
import PublicNavbar from '../components/layout/PublicNavbar';

import { useAppStatus } from '../context/AppStatusContext';

const SchoolSignup = () => {
    const { registration_open, loading: statusLoading } = useAppStatus();
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const selectedPlan = searchParams.get('plan') || 'Basic';

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        school_name: '',
        school_code: '',
        school_email: '',
        school_phone: '',
        school_address: '',
        password: '',
        confirm_password: '',
        school_logo: null,
        school_logo_preview: null
    });

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    school_logo: file,
                    school_logo_preview: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (formData.password !== formData.confirm_password) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            const data = new FormData();
            data.append('school_name', formData.school_name);
            data.append('school_code', formData.school_code);
            data.append('school_email', formData.school_email);
            data.append('school_phone', formData.school_phone);
            data.append('school_address', formData.school_address);
            data.append('password', formData.password);
            data.append('plan', selectedPlan);

            if (formData.school_logo) {
                data.append('school_logo', formData.school_logo);
            }

            const response = await axios.post('/api/school-signup/', data);

            if (response.data.success) {
                setSuccess(true);
                setTimeout(() => navigate('/login'), 3000);
            }
        } catch (err) {
            setError(err.response?.data?.error || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!statusLoading && !registration_open) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
                <div className="max-w-md w-full bg-white rounded-3xl p-12 shadow-xl border border-slate-100">
                    <div className="w-16 h-16 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                        <Lock size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Registration Closed</h2>
                    <p className="text-slate-500 mb-8 leading-relaxed">
                        We are currently reaching capacity for our beta phase.
                        Please contact <b className="text-slate-900">support@edumanage.com</b> for invitation-only access.
                    </p>
                    <Button onClick={() => navigate('/')} variant="outline" className="w-full">
                        Back to Home
                    </Button>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 border border-slate-100 flex flex-col items-center">
                    <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle2 size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Registration Successful!</h2>
                    <p className="text-slate-500 mb-8 leading-relaxed text-sm">
                        Your institution <b>{formData.school_name}</b> has been registered. Redirecting you to the portal...
                    </p>
                    <div className="flex gap-2 text-slate-900 font-semibold items-center text-sm">
                        <Loader2 className="animate-spin" size={16} />
                        <span>Redirecting...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
            <PublicNavbar alwaysSolid={false} />

            <div className="relative pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-24">

                {/* Left Side: Context & Info */}
                <div className="lg:w-1/3 lg:pt-12 space-y-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-xs font-bold text-slate-600 uppercase tracking-wider">
                        <Sparkles size={12} className="text-blue-600" />
                        Start your journey
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                        Create your school account.
                    </h1>
                    <p className="text-lg text-slate-500 leading-relaxed">
                        Join thousands of educational institutions modernizing their operations with EduManage.
                    </p>

                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedPlan === 'Basic' ? 'bg-emerald-100 text-emerald-600' :
                                    selectedPlan === 'Standard' ? 'bg-blue-100 text-blue-600' :
                                        'bg-violet-100 text-violet-600'
                                }`}>
                                {selectedPlan === 'Basic' && <Zap size={20} />}
                                {selectedPlan === 'Standard' && <Star size={20} />}
                                {selectedPlan === 'Enterprise' && <Crown size={20} />}
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Selected Plan</p>
                                <h4 className="text-base font-bold text-slate-900">{selectedPlan} Edition</h4>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-sm">
                            <span className="text-slate-500 font-medium">Trial Period</span>
                            <span className="text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-md">7 Days Free</span>
                        </div>
                    </div>

                    <div className="space-y-4 pt-2 hidden lg:block">
                        {[
                            'No credit card required',
                            'Cancel anytime',
                            'Free onboarding session'
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <CheckCircle2 size={16} className="text-blue-600" />
                                <span className="text-slate-600 text-sm font-medium">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="lg:w-2/3">
                    <div className="bg-white rounded-3xl lg:shadow-[0_0_40px_-10px_rgba(0,0,0,0.05)] lg:border lg:border-slate-100 lg:p-10">

                        {error && (
                            <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-start gap-3 text-sm">
                                <ShieldCheck size={18} className="mt-0.5 shrink-0" />
                                <span className="font-medium">{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-8">

                            {/* Logo Upload */}
                            <div className="flex flex-col sm:flex-row items-center gap-8 pb-8 border-b border-slate-100">
                                <div className="relative group shrink-0">
                                    <div className="w-24 h-24 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-blue-500 group-hover:bg-blue-50/50">
                                        {formData.school_logo_preview ? (
                                            <img src={formData.school_logo_preview} alt="Preview" className="w-full h-full object-contain" />
                                        ) : (
                                            <Building2 size={32} className="text-slate-300" />
                                        )}
                                    </div>
                                    <label className="absolute -bottom-2 -right-2 p-2 bg-slate-900 text-white rounded-xl shadow-lg cursor-pointer transition-all hover:scale-110 active:scale-95">
                                        <Camera size={14} />
                                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                    </label>
                                </div>
                                <div className="text-center sm:text-left">
                                    <p className="font-bold text-slate-900 mb-1">Upload School Logo</p>
                                    <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                                        Recommended: Square PNG/JPG, max 2MB.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-6 h-px bg-slate-200"></span>
                                    Institution Details
                                    <span className="flex-1 h-px bg-slate-200"></span>
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <Input
                                        label="School Name"
                                        name="school_name"
                                        placeholder="e.g. St. Jude Academy"
                                        required
                                        value={formData.school_name}
                                        onChange={handleChange}
                                        className="h-11 bg-slate-50 border-transparent focus:bg-white"
                                    />
                                    <Input
                                        label="School Code"
                                        name="school_code"
                                        placeholder="e.g. SJA01"
                                        required
                                        value={formData.school_code}
                                        onChange={handleChange}
                                        className="h-11 bg-slate-50 border-transparent focus:bg-white"
                                    />
                                    <Input
                                        label="Official Phone"
                                        name="school_phone"
                                        placeholder="+254..."
                                        value={formData.school_phone}
                                        onChange={handleChange}
                                        className="h-11 bg-slate-50 border-transparent focus:bg-white"
                                    />
                                    <Input
                                        label="Support Email"
                                        type="email"
                                        name="school_email"
                                        placeholder="admin@school.com"
                                        required
                                        value={formData.school_email}
                                        onChange={handleChange}
                                        className="h-11 bg-slate-50 border-transparent focus:bg-white"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">School Address</label>
                                    <textarea
                                        name="school_address"
                                        className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none min-h-[100px] text-sm text-slate-700 resize-none"
                                        placeholder="Physical Location..."
                                        value={formData.school_address}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="space-y-6 pt-4">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-6 h-px bg-slate-200"></span>
                                    Admin Security
                                    <span className="flex-1 h-px bg-slate-200"></span>
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <Input
                                        label="Password"
                                        type="password"
                                        name="password"
                                        placeholder="••••••••"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="h-11 bg-slate-50 border-transparent focus:bg-white"
                                    />
                                    <Input
                                        label="Confirm Password"
                                        type="password"
                                        name="confirm_password"
                                        placeholder="••••••••"
                                        required
                                        value={formData.confirm_password}
                                        onChange={handleChange}
                                        className="h-11 bg-slate-50 border-transparent focus:bg-white"
                                    />
                                </div>
                            </div>

                            <div className="pt-6">
                                <Button
                                    type="submit"
                                    size="lg"
                                    className="w-full py-4 text-base font-bold rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-xl hover:-translate-y-0.5 transition-all bg-slate-900 text-white hover:bg-slate-800"
                                    isLoading={loading}
                                >
                                    Create Account
                                    <ArrowRight size={18} className="ml-2" />
                                </Button>
                                <p className="text-center text-xs text-slate-400 mt-4">
                                    By registering, you agree to our Terms of Service & Privacy Policy.
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SchoolSignup;
