import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    User, Phone, Mail, MapPin, Calendar, BookOpen,
    Award, DollarSign, Clock, Shield, CheckCircle, Briefcase, Camera, X, Save,
    FileText, CreditCard, ChevronRight, Star, Activity, LayoutGrid, List,
    TrendingUp, ShieldCheck
} from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

// --- Reusable Components ---

const Card = ({ children, className = "" }) => (
    <div className={`bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden ${className}`}>
        {children}
    </div>
);

const Badge = ({ children, color = "slate" }) => {
    const colors = {
        green: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        yellow: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
        red: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400",
        primary: "bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400",
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide uppercase ${colors[color] || colors.slate}`}>
            {children}
        </span>
    );
};

const StatCard = ({ icon: Icon, label, value, trend, color = "primary" }) => (
    <Card className="p-4 md:p-5 flex items-center gap-4 hover:shadow-md transition-shadow cursor-default">
        <div className={`p-3 md:p-4 rounded-xl bg-${color}-50 dark:bg-${color}-900/20 text-${color}-600 dark:text-${color}-400 shrink-0`}>
            <Icon className="w-5 h-5 md:w-6 md:h-6" />
        </div>
        <div className="min-w-0">
            <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
            <h4 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white truncate">{value}</h4>
        </div>
    </Card>
);

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-lg shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/20 dark:border-slate-800 overflow-hidden relative z-10"
                >
                    <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">{title}</h3>
                        <button onClick={onClose} className="h-10 w-10 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                            <X size={18} />
                        </button>
                    </div>
                    <div className="p-8">
                        {children}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

const TabButton = ({ active, onClick, children, icon: Icon }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all relative shrink-0 ${active
            ? "text-primary-600 dark:text-primary-400"
            : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
    >
        {Icon && <Icon className="w-4 h-4" />}
        <span>{children}</span>
        {active && (
            <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400"
            />
        )}
    </button>
);

// --- Main Page Component ---

const TeacherDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [teacher, setTeacher] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    // Options for Edit Form
    const [grades, setGrades] = useState([]);
    const [branches, setBranches] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [departments, setDepartments] = useState([]);

    // Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({});
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [certificateFile, setCertificateFile] = useState(null);

    // Request Modal States
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [showAdvanceModal, setShowAdvanceModal] = useState(false);
    const [requestLoading, setRequestLoading] = useState(false);
    const [leaveForm, setLeaveForm] = useState({ leave_type: 'SICK', start_date: '', end_date: '', reason: '' });
    const [advanceForm, setAdvanceForm] = useState({ amount: '', reason: '' });
    const [activeScheduleDay, setActiveScheduleDay] = useState('Monday');

    useEffect(() => {
        fetchTeacher();
        fetchOptions();
    }, [id]);

    const fetchOptions = async () => {
        try {
            const [gradesRes, subjectsRes, branchesRes, deptsRes] = await Promise.all([
                axios.get('/api/grades/'),
                axios.get('/api/subjects/'),
                axios.get('/api/branches/'),
                axios.get('/api/departments/')
            ]);
            setGrades(gradesRes.data.grades);
            setSubjects(subjectsRes.data.subjects);
            setBranches(branchesRes.data.branches);
            setDepartments(deptsRes.data.departments);
        } catch (err) {
            console.error("Error fetching options:", err);
            // Fallback for departments if endpoint fails
            if (!departments.length) {
                setDepartments([{ id: 1, name: 'Languages' }, { id: 2, name: 'Sciences' }, { id: 3, name: 'Humanities' }]);
            }
        }
    };

    const fetchTeacher = async () => {
        try {
            const response = await axios.get(`/api/teachers/${id}/`);
            const t = response.data.teacher;
            setTeacher(t);
            setEditData({
                // Personal
                first_name: t.personal.first_name,
                last_name: t.personal.last_name,
                email: t.personal.email,
                phone: t.personal.phone,
                national_id: t.personal.national_id,
                address: t.personal.address,
                dob: t.personal.dob,
                gender: t.personal.gender, // 'M' or 'F'
                marital_status: t.personal.marital_status,
                religion: t.personal.religion,
                nationality: t.personal.nationality,

                // Professional
                tsc_number: t.personal.tsc_number,
                date_joined: t.professional.date_joined,
                status: t.professional.status,
                position: t.professional.position, // Code
                qualifications: t.professional.qualifications, // Code
                years_of_experience: t.professional.years_of_experience,

                // Relations / Work
                department: t.professional.department_id,
                branch: t.professional.branch_id,
                is_class_teacher: t.professional.is_class_teacher,
                grade: t.professional.grade_id,
                subjects: t.professional.subject_ids || []
            });
        } catch (error) {
            console.error('Error fetching teacher details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        const formData = new FormData();
        Object.keys(editData).forEach(key => {
            if (key === 'subjects' && Array.isArray(editData[key])) {
                editData[key].forEach(sub => formData.append('subjects', sub));
            } else if (editData[key] !== null && editData[key] !== undefined) {
                formData.append(key, editData[key]);
            }
        });
        if (avatarFile) formData.append('avatar', avatarFile);
        if (certificateFile) formData.append('certificate', certificateFile);

        try {
            setLoading(true);
            await axios.post(`/api/teachers/${id}/`, formData);
            setIsEditing(false);
            setAvatarFile(null);
            setCertificateFile(null);
            fetchTeacher();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to update teacher.');
        } finally {
            setLoading(false);
        }
    };

    const handleLeaveRequest = async (e) => {
        e.preventDefault();
        try {
            setRequestLoading(true);
            await axios.post(`/api/teachers/${id}/request-leave/`, leaveForm);
            setShowLeaveModal(false);
            fetchTeacher();
            setLeaveForm({ leave_type: 'SICK', start_date: '', end_date: '', reason: '' });
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to submit request');
        } finally {
            setRequestLoading(false);
        }
    };

    const handleAdvanceRequest = async (e) => {
        e.preventDefault();
        try {
            setRequestLoading(true);
            await axios.post(`/api/teachers/${id}/request-advance/`, advanceForm);
            setShowAdvanceModal(false);
            fetchTeacher();
            setAdvanceForm({ amount: '', reason: '' });
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to submit request');
        } finally {
            setRequestLoading(false);
        }
    };

    const handleDeleteTeacher = async () => {
        if (window.confirm('Are you sure you want to delete this teacher? This will also remove their user account and cannot be undone.')) {
            try {
                setLoading(true);
                await axios.delete(`/api/teachers/${id}/`);
                navigate('/teachers?deleted=true');
            } catch (error) {
                alert(error.response?.data?.error || "Failed to delete teacher");
                setLoading(false);
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked, files, options } = e.target;
        if (type === 'file') {
            // handled via specific handlers usually, or generic here if needed
        } else if (type === 'checkbox') {
            setEditData(prev => ({ ...prev, [name]: checked }));
        } else if (name === 'subjects') {
            const selected = Array.from(options).filter(o => o.selected).map(o => o.value);
            setEditData(prev => ({ ...prev, [name]: selected }));
        } else {
            setEditData(prev => ({ ...prev, [name]: value }));
        }
    };

    if (loading && !teacher) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!teacher) return <div className="p-8 text-center bg-slate-50 dark:bg-slate-900 h-screen">Teacher Not Found</div>;

    const tabs = [
        { id: 'overview', label: 'Overview', icon: LayoutGrid },
        { id: 'schedule', label: 'Schedule', icon: Calendar },
        { id: 'financials', label: 'Financials & Requests', icon: DollarSign },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            {/* Header Banner */}
            <div className="h-48 md:h-80 bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-950 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-24 md:-mt-32 relative z-10">
                <Card className="mb-6 border-none shadow-2xl">
                    <div className="p-6 md:p-10">
                        <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center md:items-end">
                            {/* Avatar */}
                            <div className="relative group shrink-0 -mt-16 md:mt-0">
                                <div className="h-28 w-28 md:h-40 md:w-40 rounded-2xl ring-[4px] md:ring-[8px] ring-white dark:ring-slate-900 overflow-hidden bg-white dark:bg-slate-800 shadow-xl group-hover:scale-[1.02] transition-transform duration-500">
                                    {avatarPreview || (teacher.personal && teacher.personal.avatar) ? (
                                        <img src={avatarPreview || teacher.personal.avatar} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-indigo-600 text-white text-4xl md:text-6xl font-bold">
                                            {teacher.personal ? teacher.personal.first_name[0] : '?'}
                                        </div>
                                    )}
                                </div>
                                {isEditing && (
                                    <label className="absolute inset-0 flex items-center justify-center bg-indigo-600/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer rounded-2xl ring-4 ring-transparent border-4 border-white dark:border-slate-900">
                                        <Camera className="text-white" size={24} />
                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                setAvatarFile(file);
                                                setAvatarPreview(URL.createObjectURL(file));
                                            }
                                        }} />
                                    </label>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 w-full text-center md:text-left">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="space-y-3">
                                        <div className="flex flex-col md:flex-row items-center gap-3">
                                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                                                {teacher.personal.full_name}
                                            </h1>
                                            {!isEditing && (
                                                <Badge color={teacher.professional.status === 'ACTIVE' ? 'green' : 'red'}>
                                                    {teacher.professional.status}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2.5 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-800 md:bg-transparent md:border-none md:p-0"><Briefcase size={14} className="text-indigo-500" /> {teacher.professional.position_display}</span>
                                            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-800 md:bg-transparent md:border-none md:p-0"><Mail size={14} className="text-indigo-500" /> {teacher.personal.email}</span>
                                            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-800 md:bg-transparent md:border-none md:p-0"><Phone size={14} className="text-indigo-500" /> {teacher.personal.phone}</span>
                                            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-800 md:bg-transparent md:border-none md:p-0 opacity-70"><Shield size={14} className="text-indigo-500" /> TSC: {teacher.personal.tsc_number || 'N/A'}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                                        {isEditing ? (
                                            <>
                                                <Button onClick={handleSave} isLoading={loading} className="w-full h-11 rounded-xl bg-indigo-600 shadow-lg shadow-indigo-500/10 font-bold px-6"><Save size={18} className="mr-2" /> Save Changes</Button>
                                                <Button variant="secondary" onClick={() => setIsEditing(false)} className="w-full h-11 rounded-xl font-bold px-6"><X size={18} className="mr-2" /> Cancel</Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button size="lg" className="w-full h-11 md:h-12 rounded-xl bg-slate-900 dark:bg-white dark:text-slate-900 font-bold px-8" onClick={() => setIsEditing(true)}>Edit Profile</Button>
                                                <Button size="lg" variant="outline" className="w-full h-11 md:h-12 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 font-bold px-8" onClick={handleDeleteTeacher}>Delete</Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="px-2 md:px-10 border-t border-slate-100 dark:border-slate-800 flex gap-2 overflow-x-auto no-scrollbar scroll-smooth">
                        {tabs.map(tab => (
                            <TabButton
                                key={tab.id}
                                active={activeTab === tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                icon={tab.icon}
                            >
                                {tab.label}
                            </TabButton>
                        ))}
                    </div>
                </Card>

                {/* Content Area */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'overview' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Stats & Quick Info */}
                                <div className="space-y-6 md:col-span-2">
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                        <StatCard icon={CheckCircle} label="Class Assigned" value={teacher.professional.grade_assigned || "None"} color="indigo" />
                                        <StatCard icon={BookOpen} label="Subjects" value={teacher.professional.subjects.length} color="indigo" />
                                        <div className="col-span-2 lg:col-span-1">
                                            <StatCard icon={Clock} label="Years Exp." value={teacher.professional.experience} color="indigo" />
                                        </div>
                                    </div>

                                    <Card>
                                        <div className="p-6 md:p-8">
                                            <h3 className="text-lg font-bold mb-6 text-slate-800 dark:text-white flex items-center gap-3">
                                                <div className="h-9 w-9 md:h-10 md:w-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                                                    <User size={18} />
                                                </div>
                                                Personal Information
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                                                <Input label="First Name" name="first_name" value={isEditing ? editData.first_name : teacher.personal.first_name} disabled={!isEditing} onChange={handleInputChange} className="font-bold" />
                                                <Input label="Last Name" name="last_name" value={isEditing ? editData.last_name : teacher.personal.last_name} disabled={!isEditing} onChange={handleInputChange} className="font-bold" />
                                                <Input label="Date of Birth" name="dob" value={isEditing ? editData.dob : teacher.personal.dob} type="date" disabled={!isEditing} onChange={handleInputChange} className="font-bold" />
                                                <Input label="Address" name="address" value={isEditing ? editData.address : teacher.personal.address} disabled={!isEditing} onChange={handleInputChange} className="font-bold" />

                                                <div className="space-y-1">
                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Gender</label>
                                                    {isEditing ? (
                                                        <select name="gender" value={editData.gender} onChange={handleInputChange} className="w-full rounded-xl h-11 border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-primary-500 font-bold px-4">
                                                            <option value="M">Male</option>
                                                            <option value="F">Female</option>
                                                        </select>
                                                    ) : (
                                                        <div className="h-11 flex items-center px-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800/50 text-sm font-bold">{teacher.personal.gender_display}</div>
                                                    )}
                                                </div>

                                                <Input label="Date of Birth" name="dob" value={isEditing ? editData.dob : teacher.personal.dob} type="date" disabled={!isEditing} onChange={handleInputChange} className="font-bold" />
                                                <Input label="Address" name="address" value={isEditing ? editData.address : teacher.personal.address} disabled={!isEditing} onChange={handleInputChange} className="font-bold" />

                                                {/* New Fields */}
                                                <div className="space-y-1">
                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Marital Status</label>
                                                    {isEditing ? (
                                                        <select name="marital_status" value={editData.marital_status} onChange={handleInputChange} className="w-full rounded-xl h-11 border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-primary-500 font-bold px-4">
                                                            {['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED'].map(s => <option key={s} value={s}>{s}</option>)}
                                                        </select>
                                                    ) : (
                                                        <div className="h-11 flex items-center px-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800/50 text-sm font-bold capitalize">{teacher.personal.marital_status?.toLowerCase()}</div>
                                                    )}
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Religion</label>
                                                    {isEditing ? (
                                                        <select name="religion" value={editData.religion} onChange={handleInputChange} className="w-full rounded-xl h-11 border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-primary-500 font-bold px-4">
                                                            {['CHRISTIAN', 'MUSLIM', 'HINDU', 'OTHER'].map(s => <option key={s} value={s}>{s}</option>)}
                                                        </select>
                                                    ) : (
                                                        <div className="h-12 flex items-center px-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/50 text-sm font-bold capitalize">{teacher.personal.religion?.toLowerCase()}</div>
                                                    )}
                                                </div>

                                                <Input label="Nationality" name="nationality" value={isEditing ? editData.nationality : (teacher.personal.nationality || 'Kenyan')} disabled={!isEditing} onChange={handleInputChange} className="font-bold" />
                                            </div>
                                        </div>
                                    </Card>

                                    <Card>
                                        <div className="p-6 md:p-10">
                                            <h3 className="text-xl font-black mb-8 text-slate-800 dark:text-white flex items-center gap-3">
                                                <div className="h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-600">
                                                    <Briefcase size={20} />
                                                </div>
                                                Employment Details
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                                                <div className="space-y-1">
                                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Position</label>
                                                    {isEditing ? (
                                                        <select name="position" value={editData.position} onChange={handleInputChange} className="w-full rounded-2xl h-12 border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-primary-500 font-bold px-4">
                                                            {['TEACHER', 'HOD', 'DEPUTY', 'PRINCIPAL', 'ADMIN'].map(p => <option key={p} value={p}>{p}</option>)}
                                                        </select>
                                                    ) : (
                                                        <div className="h-12 flex items-center px-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/50 text-sm font-bold">{teacher.professional.position_display}</div>
                                                    )}
                                                </div>

                                                <Input label="TSC Number" name="tsc_number" value={isEditing ? editData.tsc_number : teacher.personal.tsc_number} disabled={!isEditing} onChange={handleInputChange} className="font-bold" />
                                                <Input label="Date Joined" name="date_joined" value={isEditing ? editData.date_joined : teacher.professional.date_joined} type="date" disabled={!isEditing} onChange={handleInputChange} className="font-bold" />

                                                <div className="space-y-1">
                                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Status</label>
                                                    {isEditing ? (
                                                        <select name="status" value={editData.status} onChange={handleInputChange} className="w-full rounded-2xl h-12 border-slate-200 dark:border-slate-700 dark:bg-slate-800 font-bold px-4">
                                                            <option value="ACTIVE">Active</option>
                                                            <option value="ON_LEAVE">On Leave</option>
                                                            <option value="INACTIVE">Inactive</option>
                                                        </select>
                                                    ) : (
                                                        <div className="h-12 flex items-center px-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/50 text-sm font-bold">
                                                            {teacher.professional.status}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Department</label>
                                                    {isEditing ? (
                                                        <select name="department" value={editData.department || ''} onChange={handleInputChange} className="w-full rounded-2xl h-12 border-slate-200 dark:border-slate-700 dark:bg-slate-800 font-bold px-4">
                                                            <option value="">Select Dept</option>
                                                            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                                        </select>
                                                    ) : (
                                                        <div className="h-12 flex items-center px-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/50 text-sm font-bold">{teacher.professional.department_name || 'N/A'}</div>
                                                    )}
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Campus/Branch</label>
                                                    {isEditing ? (
                                                        <select name="branch" value={editData.branch || ''} onChange={handleInputChange} className="w-full rounded-2xl h-12 border-slate-200 dark:border-slate-700 dark:bg-slate-800 font-bold px-4">
                                                            <option value="">Select Branch</option>
                                                            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                                        </select>
                                                    ) : (
                                                        <div className="h-12 flex items-center px-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/50 text-sm font-bold">{teacher.professional.branch_name || 'N/A'}</div>
                                                    )}
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Qualification</label>
                                                    {isEditing ? (
                                                        <select name="qualifications" value={editData.qualifications} onChange={handleInputChange} className="w-full rounded-2xl h-12 border-slate-200 dark:border-slate-700 dark:bg-slate-800 font-bold px-4">
                                                            {['CERT', 'DIP', 'DEG', 'MAST', 'PHD'].map(q => <option key={q} value={q}>{q}</option>)}
                                                        </select>
                                                    ) : (
                                                        <div className="h-12 flex items-center px-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/50 text-sm font-bold">{teacher.professional.qualifications_display}</div>
                                                    )}
                                                </div>

                                                <Input type="number" label="Years Experience" name="years_of_experience" value={isEditing ? editData.years_of_experience : teacher.professional.years_of_experience} disabled={!isEditing} onChange={handleInputChange} className="font-bold" />

                                                {/* Class Teacher Logic */}
                                                <div className="md:col-span-2 p-6 bg-slate-100/30 dark:bg-slate-800/30 rounded-3xl border border-slate-100 dark:border-slate-800">
                                                    <div className="flex items-center gap-4 mb-4">
                                                        {isEditing ? (
                                                            <input type="checkbox" name="is_class_teacher" checked={editData.is_class_teacher} onChange={handleInputChange} className="w-6 h-6 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                                                        ) : (
                                                            teacher.professional.is_class_teacher && <CheckCircle size={24} className="text-emerald-500" />
                                                        )}
                                                        <span className="text-sm font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">Class Teacher Responsibilities</span>
                                                    </div>

                                                    {(isEditing ? editData.is_class_teacher : teacher.professional.is_class_teacher) && (
                                                        <div className="pl-10 space-y-2">
                                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Assigned Class / Grade</label>
                                                            {isEditing ? (
                                                                <select name="grade" value={editData.grade || ''} onChange={handleInputChange} className="w-full md:w-1/2 block rounded-2xl h-12 border-slate-200 dark:border-slate-700 dark:bg-slate-800 font-bold px-4">
                                                                    <option value="">Select Grade</option>
                                                                    {grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                                                </select>
                                                            ) : (
                                                                <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">{teacher.professional.grade_assigned}</p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="md:col-span-2">
                                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Highest Qualification Certificate</label>
                                                    {isEditing ? (
                                                        <div className="flex items-center gap-2">
                                                            <input type="file" onChange={e => setCertificateFile(e.target.files[0])} className="block w-full text-xs text-slate-400 file:mr-4 file:py-2.5 file:px-6 file:rounded-2xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all" />
                                                        </div>
                                                    ) : (
                                                        teacher.professional.certificate ? (
                                                            <a href={teacher.professional.certificate} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 px-6 py-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 text-xs font-black uppercase tracking-widest text-indigo-600 hover:scale-[1.02] transition-transform">
                                                                <FileText size={18} /> View Document
                                                            </a>
                                                        ) : <span className="text-slate-400 italic text-xs font-bold uppercase tracking-widest">No document available</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                                <div className="space-y-6">
                                    <Card className="h-full">
                                        <div className="p-6 md:p-8">
                                            <h3 className="text-lg font-black mb-6 text-slate-800 dark:text-white uppercase tracking-widest">Assigned Subjects</h3>

                                            {isEditing ? (
                                                <div className="space-y-3">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hold Ctrl/Cmd to select multiple</p>
                                                    <select
                                                        name="subjects"
                                                        multiple
                                                        value={editData.subjects}
                                                        onChange={handleInputChange}
                                                        className="w-full h-64 rounded-2xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 p-4 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none no-scrollbar"
                                                    >
                                                        {subjects.map(s => (
                                                            <option key={s.id} value={s.id} className="py-2">{s.name} ({s.code})</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            ) : (
                                                <div className="flex flex-wrap gap-2.5 mb-8">
                                                    {teacher.professional.subjects.length > 0 ? (
                                                        teacher.professional.subjects.map(sub => (
                                                            <div key={sub.id} className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800/50">
                                                                {sub.name}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest bg-slate-50 dark:bg-slate-800/50 w-full p-4 rounded-xl text-center">No assignments</p>
                                                    )}
                                                </div>
                                            )}

                                            <h3 className="text-lg font-black mb-6 text-slate-800 dark:text-white uppercase tracking-widest mt-12">Performance</h3>
                                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-8 text-center border border-slate-100 dark:border-slate-800">
                                                <div className="h-14 w-14 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center mx-auto mb-4 text-slate-300">
                                                    <Activity size={24} />
                                                </div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-relaxed">System performance analytical module coming soon.</p>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        )}

                        {activeTab === 'schedule' && (
                            <Card className="min-h-[500px] border-none shadow-2xl overflow-visible">
                                <div className="p-6 md:p-12">
                                    <div className="flex flex-wrap md:flex-row justify-between items-center gap-6 mb-10">
                                        <div className="text-center md:text-left">
                                            <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight mb-1.5">Weekly Master Schedule</h3>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Academic Delivery Plan • FY 2024</p>
                                        </div>
                                        <button
                                            className="w-full md:w-auto h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-indigo-500/10 transition-all active:scale-95 flex items-center justify-center gap-3"
                                            onClick={() => navigate(`/teachers/${id}/schedule`)}
                                        >
                                            <Calendar size={18} /> Configure Schedule
                                        </button>
                                    </div>

                                    {/* Mobile Day Selector Tabs */}
                                    <div className="md:hidden flex overflow-x-auto gap-2 pb-6 scrollbar-none">
                                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                                            <button
                                                key={day}
                                                onClick={() => setActiveScheduleDay(day)}
                                                className={`px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all border ${activeScheduleDay === day
                                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                                                    : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800'
                                                    }`}
                                            >
                                                {day}
                                            </button>
                                        ))}
                                    </div>

                                    {teacher.schedule && teacher.schedule.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
                                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day, idx) => {
                                                const daysClasses = teacher.schedule.filter(s => s.day.toUpperCase() === day.toUpperCase());
                                                return (
                                                    <div key={day} className={`${activeScheduleDay === day ? 'flex' : 'hidden md:flex'} rounded-2xl p-5 md:p-6 border-2 h-full flex flex-col min-h-[300px] md:min-h-[350px] transition-all hover:shadow-lg ${idx % 2 === 0
                                                        ? "bg-slate-50/50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800"
                                                        : "bg-white dark:bg-slate-900 border-indigo-500/5"
                                                        }`}>
                                                        <h4 className="font-bold text-indigo-600 dark:text-indigo-400 mb-6 flex justify-between items-center">
                                                            <span className="text-xs uppercase tracking-widest">{day}</span>
                                                            <span className="text-[10px] bg-white dark:bg-slate-800 px-3 py-1 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm">{daysClasses.length} sessions</span>
                                                        </h4>
                                                        <div className="space-y-4 flex-1">
                                                            {daysClasses.length > 0 ? (
                                                                daysClasses.map(cls => (
                                                                    <div key={cls.id} className="bg-white dark:bg-slate-800 p-4 md:p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50 group hover:border-indigo-500/30 transition-all">
                                                                        <div className="flex justify-between items-start mb-2.5">
                                                                            <div className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/50 px-2 py-1 rounded-lg border border-indigo-100/50 dark:border-indigo-800/30">
                                                                                {cls.time}
                                                                            </div>
                                                                        </div>
                                                                        <div className="font-bold text-slate-800 dark:text-white text-sm mb-2.5 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{cls.subject}</div>
                                                                        <div className="flex items-center gap-2 pt-2.5 border-t border-slate-50 dark:border-slate-700">
                                                                            <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 text-[8px] font-bold">
                                                                                {cls.grade?.charAt(0)}
                                                                            </div>
                                                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{cls.grade}</span>
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-20 py-10 scale-90">
                                                                    <div className="h-16 w-16 bg-slate-200 dark:bg-slate-800 rounded-3xl mb-4 flex items-center justify-center text-slate-400">
                                                                        <Clock size={24} />
                                                                    </div>
                                                                    <p className="text-[10px] font-black uppercase tracking-widest">No Lectures</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-10 md:p-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800">
                                            <div className="h-16 w-16 md:h-20 md:w-20 bg-white dark:bg-slate-800 rounded-xl md:rounded-[2rem] shadow-xl flex items-center justify-center mx-auto mb-6 md:mb-8 text-slate-300">
                                                <Calendar size={32} />
                                            </div>
                                            <h4 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-3 md:mb-4">No Schedule Configured</h4>
                                            <p className="text-xs md:text-sm text-slate-400 max-w-sm mx-auto mb-8 md:mb-10 leading-relaxed font-medium">This teacher hasn't been assigned any academic sessions for the current semester yet.</p>
                                            <button
                                                className="h-12 px-10 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95"
                                                onClick={() => navigate(`/teachers/${id}/schedule`)}
                                            >
                                                Assign Classes
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        )}

                        {activeTab === 'financials' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
                                <div className="lg:col-span-2 space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Card className="p-6 md:p-8 bg-gradient-to-br from-slate-900 to-indigo-950 text-white border-none shadow-xl relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 h-32 w-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-indigo-500/20 transition-colors"></div>
                                            <div className="flex items-center gap-4 mb-4 opacity-50">
                                                <DollarSign size={18} className="text-indigo-400" />
                                                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Gross Monthly Package</span>
                                            </div>
                                            <div className="text-3xl md:text-4xl font-bold tracking-tighter mb-4">
                                                <span className="text-lg md:text-xl opacity-40 mr-2 font-bold uppercase tracking-normal">KES</span>
                                                {teacher.financial.basic_salary?.toLocaleString()}
                                            </div>
                                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-bold uppercase tracking-widest text-indigo-300">
                                                <Activity size={10} /> Fully Taxable
                                            </div>
                                        </Card>

                                        <Card className="p-6 md:p-8 bg-white dark:bg-slate-900 border-2 border-indigo-500/10 shadow-lg relative overflow-hidden group">
                                            <div className="absolute bottom-0 right-0 h-32 w-32 bg-emerald-500/5 rounded-full -mr-16 -mb-16 blur-2xl"></div>
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-lg">
                                                    <CreditCard size={18} />
                                                </div>
                                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Net Take Home</span>
                                            </div>
                                            <div className="text-3xl md:text-4xl font-bold tracking-tighter mb-4 text-slate-900 dark:text-white">
                                                <span className="text-lg md:text-xl opacity-20 mr-2 font-bold uppercase tracking-normal">KES</span>
                                                {teacher.financial.net_salary?.toLocaleString()}
                                            </div>
                                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-[9px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                                                <ShieldCheck size={10} /> Audit Verified
                                            </div>
                                        </Card>
                                    </div>

                                    {/* Financial Breakdown */}
                                    <Card className="overflow-hidden border-2 border-slate-100 dark:border-slate-800 shadow-lg">
                                        <div className="p-5 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                                                <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></div>
                                                Compensation Architecture
                                            </h3>
                                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full uppercase tracking-widest">FY 2024-25</span>
                                        </div>
                                        <div className="p-0">
                                            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
                                                <div className="p-6 space-y-5">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Base Allowances</span>
                                                        <span className="text-lg font-bold text-emerald-600">+ KES {teacher.financial.allowances?.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center opacity-40 grayscale">
                                                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Statutory Benefits</span>
                                                        <span className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-widest">Included</span>
                                                    </div>
                                                </div>
                                                <div className="p-6 space-y-4 bg-slate-50/20 dark:bg-slate-900/20">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">PAYE / Regular Deductions</span>
                                                        <span className="text-xs font-bold text-rose-500">- KES {teacher.financial.deductions?.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Social Security (NSSF)</span>
                                                        <span className="text-xs font-bold text-rose-500">- KES {teacher.financial.nssf?.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-5">
                                                        <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">Internal Liabilities</span>
                                                        <span className="text-xs font-bold text-rose-600 underline decoration-rose-200">- KES {teacher.financial.loans?.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[10px] text-orange-500 font-bold uppercase tracking-widest">Salary Advance Deduction</span>
                                                        <span className="text-xs font-bold text-orange-600 underline decoration-orange-200">- KES {teacher.financial.advances?.toLocaleString() || '0'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>

                                    <Card className="border-none shadow-lg">
                                        <div className="p-6 md:p-8">
                                            <h4 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-8 flex items-center gap-4">
                                                <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                                    <Activity size={18} />
                                                </div>
                                                Audit Trail & Requests
                                            </h4>

                                            <div className="space-y-10">
                                                <div>
                                                    <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-500 mb-6 flex items-center gap-3">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-500"></div>
                                                        Vacation & Personal Leave Log
                                                    </h5>
                                                    {teacher.leaves && teacher.leaves.length > 0 ? (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {teacher.leaves.map((leave, i) => (
                                                                <div key={i} className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800/50 group hover:border-indigo-500/20 transition-colors">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg text-slate-400 group-hover:text-indigo-500 transition-colors shadow-sm"><Calendar size={16} /></div>
                                                                        <div>
                                                                            <p className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-widest mb-0.5">{leave.type}</p>
                                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{leave.start_date} → {leave.end_date}</p>
                                                                        </div>
                                                                    </div>
                                                                    <Badge color={leave.status === 'APPROVED' ? 'green' : leave.status === 'REJECTED' ? 'red' : 'yellow'}>
                                                                        {leave.status}
                                                                    </Badge>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300 bg-slate-50 dark:bg-slate-800/30 p-6 rounded-xl text-center border border-dashed border-slate-200 dark:border-slate-800">No active leave records found.</p>}
                                                </div>

                                                <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                                                    <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500 mb-6 flex items-center gap-3">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                                                        Financial Advances / Short-term Credit
                                                    </h5>
                                                    {teacher.advances && teacher.advances.length > 0 ? (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {teacher.advances.map((adv, i) => (
                                                                <div key={i} className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800/50 group hover:border-emerald-500/20 transition-colors">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg text-slate-400 group-hover:text-emerald-500 transition-colors shadow-sm"><CreditCard size={16} /></div>
                                                                        <div>
                                                                            <p className="text-sm font-bold text-slate-800 dark:text-white">KES {adv.amount.toLocaleString()}</p>
                                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{adv.date}</p>
                                                                        </div>
                                                                    </div>
                                                                    <Badge color={adv.status === 'DEDUCTED' ? 'blue' : adv.status === 'APPROVED' ? 'green' : adv.status === 'REJECTED' ? 'red' : 'yellow'}>
                                                                        {adv.status === 'DEDUCTED' ? 'RECOUPED' : adv.status}
                                                                    </Badge>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300 bg-slate-50 dark:bg-slate-800/30 p-6 rounded-xl text-center border border-dashed border-slate-200 dark:border-slate-800">No advance requests initiated.</p>}
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </div>

                                <div className="space-y-8">
                                    <div className="bg-slate-900 dark:bg-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-24 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-indigo-500/20 transition-colors"></div>
                                        <h3 className="text-lg font-bold mb-2 relative z-10 tracking-tight">Executive Actions</h3>
                                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-8 relative z-10 opacity-60">Operations management console</p>

                                        <div className="space-y-3 relative z-10">
                                            <button onClick={() => setShowLeaveModal(true)} className="w-full h-14 px-5 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-between transition-all border border-white/5 active:scale-95 group/btn">
                                                <span className="font-bold text-xs uppercase tracking-widest flex items-center gap-3">
                                                    <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400 group-hover/btn:scale-110 transition-transform"><Calendar size={16} /></div>
                                                    Initiate Leave
                                                </span>
                                                <ChevronRight size={16} className="text-slate-600" />
                                            </button>
                                            <button onClick={() => setShowAdvanceModal(true)} className="w-full h-14 px-5 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-between transition-all border border-white/5 active:scale-95 group/btn">
                                                <span className="font-bold text-xs uppercase tracking-widest flex items-center gap-3">
                                                    <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400 group-hover/btn:scale-110 transition-transform"><DollarSign size={16} /></div>
                                                    Salary Advance
                                                </span>
                                                <ChevronRight size={16} className="text-slate-600" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="bg-indigo-50/50 dark:bg-slate-800/50 rounded-2xl p-8 border-2 border-indigo-500/5 text-center shadow-sm">
                                        <div className="h-12 w-12 bg-white dark:bg-slate-900 rounded-xl shadow-sm flex items-center justify-center mx-auto mb-6 text-indigo-500">
                                            <TrendingUp size={20} />
                                        </div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-6 leading-relaxed">Adjust salary structures or view historical payroll records?</p>
                                        <Button
                                            className="w-full h-12 rounded-xl bg-slate-900 dark:bg-white dark:text-slate-900 font-bold text-xs uppercase tracking-widest shadow-lg shadow-slate-900/5 active:scale-95"
                                            onClick={() => navigate('/finance/salaries', { state: { search: teacher.personal.full_name } })}
                                        >
                                            Manage Payroll
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Modals */}
                <Modal isOpen={showLeaveModal} onClose={() => setShowLeaveModal(false)} title="Request Leave">
                    <form onSubmit={handleLeaveRequest} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Leave Type</label>
                            <select
                                className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-primary-500"
                                value={leaveForm.leave_type}
                                onChange={e => setLeaveForm({ ...leaveForm, leave_type: e.target.value })}
                            >
                                <option value="SICK">Sick Leave</option>
                                <option value="ANNUAL">Annual Leave</option>
                                <option value="MATERNITY">Maternity Leave</option>
                                <option value="PATERNITY">Paternity Leave</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input type="date" label="Start Date" value={leaveForm.start_date} onChange={e => setLeaveForm({ ...leaveForm, start_date: e.target.value })} required />
                            <Input type="date" label="End Date" value={leaveForm.end_date} onChange={e => setLeaveForm({ ...leaveForm, end_date: e.target.value })} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Reason</label>
                            <textarea
                                className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-primary-500 p-2"
                                rows="3"
                                value={leaveForm.reason}
                                onChange={e => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                                required
                            ></textarea>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <Button type="button" variant="secondary" onClick={() => setShowLeaveModal(false)}>Cancel</Button>
                            <Button type="submit" isLoading={requestLoading}>Submit Request</Button>
                        </div>
                    </form>
                </Modal>

                <Modal isOpen={showAdvanceModal} onClose={() => setShowAdvanceModal(false)} title="Request Salary Advance">
                    <form onSubmit={handleAdvanceRequest} className="space-y-4">
                        <Input
                            type="number"
                            label="Amount (KES)"
                            value={advanceForm.amount}
                            onChange={e => setAdvanceForm({ ...advanceForm, amount: e.target.value })}
                            required
                            min="100"
                        />
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Reason for Advance</label>
                            <textarea
                                className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-primary-500 p-2"
                                rows="3"
                                value={advanceForm.reason}
                                onChange={e => setAdvanceForm({ ...advanceForm, reason: e.target.value })}
                                required
                            ></textarea>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <Button type="button" variant="secondary" onClick={() => setShowAdvanceModal(false)}>Cancel</Button>
                            <Button type="submit" isLoading={requestLoading}>Submit Request</Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </div>
    );
};

export default TeacherDetail;
