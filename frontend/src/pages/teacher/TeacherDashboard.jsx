import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TeacherRequests from './TeacherRequests';
import {
    User, BookOpen, Calendar, Clock, LogOut, CheckCircle,
    Bell, Search, Users, FileText, ChevronRight, Activity, X,
    Mail, Phone, Briefcase, MapPin, Shield
} from 'lucide-react';
import Button from '../../components/ui/Button';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const TeacherDashboard = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // URL parameter or from user context
    const [teacher, setTeacher] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('profile');
    const [students, setStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);

    const fetchTeacherData = async () => {
        try {
            // If id is present in URL, use it. Otherwise, try to infer or redirect.
            // For this component we assume :id is passed based on login redirect.
            const response = await axios.get(`/api/teachers/${id}/`);
            setTeacher(response.data.teacher);

            // If class teacher, fetch students
            if (response.data.teacher.professional.is_class_teacher && response.data.teacher.professional.grade_id) {
                fetchStudents(response.data.teacher.professional.grade_id);
            }
        } catch (error) {
            console.error("Error fetching teacher:", error);
            // Handle error (redirect to login or show message)
            if (error.response && error.response.status === 404) {
                alert('Teacher profile not found.');
                navigate('/teacher-login');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchTeacherData();
        }
    }, [id]);

    const fetchStudents = async (gradeId) => {
        try {
            setLoadingStudents(true);
            const response = await axios.get(`/api/students/?grade=${gradeId}`);
            setStudents(response.data.students);
        } catch (error) {
            console.error("Error fetching students:", error);
        } finally {
            setLoadingStudents(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/teacher-login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!teacher) return <div className="p-10 text-center">Profile not found.</div>;

    const InfoRow = ({ label, value, icon: Icon }) => (
        <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            {Icon && <Icon className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />}
            <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white mt-0.5">{value || 'N/A'}</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20 md:pb-0">
            {/* Top Navigation */}
            <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center gap-3">
                            <div className="bg-indigo-600 p-2 rounded-lg text-white">
                                <BookOpen size={24} />
                            </div>
                            <span className="font-bold text-xl text-slate-800 dark:text-white hidden sm:block">Teacher Portal</span>
                        </div>
                        <div className="flex items-center gap-3 md:gap-4">
                            <div className="flex items-center gap-2 md:gap-3 bg-slate-100 dark:bg-slate-700 px-2 md:px-3 py-1.5 rounded-full">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-sm">
                                    {teacher.personal.first_name[0]}
                                </div>
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200 pr-2 hidden sm:block">
                                    {teacher.personal.first_name} {teacher.personal.last_name}
                                </span>
                            </div>
                            <button onClick={handleLogout} className="text-slate-500 hover:text-red-600 transition-colors p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg" title="Logout">
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
                {/* Welcome Section */}
                <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome, Tr. {teacher.personal.first_name}</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base">Manage your profile and classes.</p>
                    </div>

                    {/* Tabs - Scrollable on mobile */}
                    <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                        <div className="bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 inline-flex whitespace-nowrap">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${activeTab === 'profile' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                            >
                                <User size={16} /> My Profile
                            </button>
                            {teacher.professional.is_class_teacher && (
                                <button
                                    onClick={() => setActiveTab('my_class')}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${activeTab === 'my_class' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                                >
                                    <Users size={16} /> My Class ({teacher.professional.grade_assigned})
                                </button>
                            )}
                            <button
                                onClick={() => setActiveTab('schedule')}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${activeTab === 'schedule' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                            >
                                <Calendar size={16} /> Schedule
                            </button>
                            <button
                                onClick={() => setActiveTab('requests')}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${activeTab === 'requests' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                            >
                                <FileText size={16} /> Requests
                            </button>
                        </div>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'profile' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                                {/* Left Column: Identity Card */}
                                <div className="space-y-6">
                                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center">
                                        <div className="w-28 h-28 md:w-32 md:h-32 mb-4 md:mb-6 relative">
                                            {teacher.personal.avatar ? (
                                                <img src={teacher.personal.avatar} alt="Profile" className="w-full h-full rounded-full object-cover shadow-lg ring-4 ring-white dark:ring-slate-700" />
                                            ) : (
                                                <div className="w-full h-full rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-3xl md:text-4xl font-bold text-indigo-600 shadow-inner">
                                                    {teacher.personal.first_name[0]}{teacher.personal.last_name[0]}
                                                </div>
                                            )}
                                            <div className="absolute bottom-1 right-1 bg-green-500 w-5 h-5 md:w-6 md:h-6 rounded-full border-4 border-white dark:border-slate-800" title="Active"></div>
                                        </div>

                                        <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-1">{teacher.personal.full_name}</h2>
                                        <p className="text-indigo-600 dark:text-indigo-400 font-medium mb-4 text-sm md:text-base">{teacher.professional.position}</p>

                                        <div className="flex flex-wrap justify-center gap-2 mb-6">
                                            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                                                {teacher.professional.status}
                                            </span>
                                            {teacher.professional.is_class_teacher && (
                                                <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 rounded-full text-xs font-semibold text-blue-600 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                                                    CT: {teacher.professional.grade_assigned}
                                                </span>
                                            )}
                                        </div>

                                        <div className="w-full grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-700 pt-6">
                                            <div className="text-center">
                                                <div className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">{teacher.professional.subjects?.length || 0}</div>
                                                <div className="text-[10px] md:text-xs text-slate-500 uppercase tracking-wide">Subjects</div>
                                            </div>
                                            <div className="text-center border-l border-slate-100 dark:border-slate-700">
                                                <div className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">{teacher.schedule?.length || 0}</div>
                                                <div className="text-[10px] md:text-xs text-slate-500 uppercase tracking-wide">Classes/Wk</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Card */}
                                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-5 md:p-6 text-white shadow-md">
                                        <h3 className="font-bold text-lg mb-2">Need Assistance?</h3>
                                        <p className="text-indigo-100 text-xs md:text-sm mb-4">You can request leave or salary advances through the HR portal.</p>
                                        <button
                                            onClick={() => setActiveTab('requests')}
                                            className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm py-2 rounded-lg text-sm font-bold transition-colors">
                                            Go to Requests
                                        </button>
                                    </div>
                                </div>

                                {/* Right Column: Details Grid */}
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Personal Info */}
                                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                                        <div className="px-5 md:px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                                            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm md:text-base">
                                                <User size={18} className="text-indigo-500" /> Personal Information
                                            </h3>
                                        </div>
                                        <div className="p-5 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <InfoRow label="Full Name" value={teacher.personal.full_name} />
                                            <InfoRow label="Email Address" value={teacher.personal.email} icon={Mail} />
                                            <InfoRow label="Phone Number" value={teacher.personal.phone} icon={Phone} />
                                            <InfoRow label="National ID / Passport" value={teacher.personal.national_id} icon={Shield} />
                                            <InfoRow label="Gender" value={teacher.personal.gender_display} />
                                            <InfoRow label="Date of Birth" value={teacher.personal.dob} />
                                            <InfoRow label="Marital Status" value={teacher.personal.marital_status} />
                                            <InfoRow label="Nationality" value={teacher.personal.nationality} />
                                            <InfoRow label="Address" value={teacher.personal.address} icon={MapPin} />
                                            <InfoRow label="Religion" value={teacher.personal.religion} />
                                        </div>
                                    </div>

                                    {/* Professional Info */}
                                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                                        <div className="px-5 md:px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                                            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm md:text-base">
                                                <Briefcase size={18} className="text-indigo-500" /> Professional Details
                                            </h3>
                                        </div>
                                        <div className="p-5 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <InfoRow label="TSC Number" value={teacher.personal.tsc_number} icon={Shield} />
                                            <InfoRow label="Position" value={teacher.professional.position_display} />
                                            <InfoRow label="Department" value={teacher.professional.department_name} />
                                            <InfoRow label="Campus / Branch" value={teacher.professional.branch_name} />
                                            <InfoRow label="Date Joined" value={teacher.professional.date_joined} icon={Calendar} />
                                            <InfoRow label="Experience" value={`${teacher.professional.years_of_experience || 0} Years`} />
                                            <InfoRow label="Qualifications" value={teacher.professional.qualifications_display} />
                                            <InfoRow label="Employment Status" value={teacher.professional.status} />
                                        </div>
                                    </div>

                                    {/* Subjects */}
                                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                                        <div className="px-5 md:px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                                            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm md:text-base">
                                                <BookOpen size={18} className="text-indigo-500" /> Assigned Subjects
                                            </h3>
                                        </div>
                                        <div className="p-5 md:p-6">
                                            {teacher.professional.subjects && teacher.professional.subjects.length > 0 ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {teacher.professional.subjects.map((sub, idx) => (
                                                        <span key={idx} className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm font-medium border border-indigo-100 dark:border-indigo-800">
                                                            {sub.name} ({sub.code})
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-slate-500 italic text-sm">No subjects assigned.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'my_class' && (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 md:p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="font-bold text-base md:text-lg text-slate-900 dark:text-white">Class List: {teacher.professional.grade_assigned}</h3>
                                        <p className="text-xs md:text-sm text-slate-500">Manage students in your assigned class.</p>
                                    </div>
                                    <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs md:text-sm font-bold">
                                        {students.length} Students
                                    </div>
                                </div>

                                {loadingStudents ? (
                                    <div className="py-10 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div></div>
                                ) : students.length > 0 ? (
                                    <div>
                                        {/* Desktop Table */}
                                        <div className="hidden md:block overflow-x-auto">
                                            <table className="w-full text-sm text-left">
                                                <thead className="bg-slate-50 dark:bg-slate-700 text-slate-500 font-medium">
                                                    <tr>
                                                        <th className="px-4 py-3 rounded-l-lg">Adm No</th>
                                                        <th className="px-4 py-3">Student Name</th>
                                                        <th className="px-4 py-3">Gender</th>
                                                        <th className="px-4 py-3 rounded-r-lg">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                                    {students.map(student => (
                                                        <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer" onClick={() => navigate(`/teacher/${id}/student/${student.id}`)}>
                                                            <td className="px-4 py-3 font-mono text-slate-500">{student.admission_number}</td>
                                                            <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                                                                {student.first_name} {student.last_name}
                                                            </td>
                                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{student.gender}</td>
                                                            <td className="px-4 py-3">
                                                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${student.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                                    }`}>
                                                                    {student.status}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Mobile Card List */}
                                        <div className="md:hidden space-y-3">
                                            {students.map(student => (
                                                <div
                                                    key={student.id}
                                                    onClick={() => navigate(`/teacher/${id}/student/${student.id}`)}
                                                    className="flex items-center p-3 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                                                >
                                                    <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-sm mr-3">
                                                        {student.first_name?.[0]}{student.last_name?.[0]}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{student.first_name} {student.last_name}</h4>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-xs font-mono text-slate-500">{student.admission_number}</span>
                                                            <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-slate-500">{student.gender}</span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${student.status === 'ACTIVE' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
                                                            }`}>
                                                            {student.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-6 px-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                                        <p className="text-slate-400 text-sm italic">No students are currently enrolled in this class repository.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'schedule' && (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 md:p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Weekly Schedule</h3>

                                {teacher.schedule && teacher.schedule.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                        {teacher.schedule.map(cls => (
                                            <div key={cls.id} className="flex gap-4 p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-indigo-300 transition-colors bg-slate-50/50 dark:bg-slate-800">
                                                <div className="flex flex-col items-center justify-center w-14 h-14 bg-white dark:bg-slate-700 rounded-lg text-center shadow-sm border border-slate-100 dark:border-slate-600">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase leading-tight">{cls.day.substring(0, 3)}</span>
                                                    <span className="font-bold text-lg text-indigo-600 leading-tight">{cls.time.split(':')[0]}</span>
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-slate-900 dark:text-white text-base">{cls.subject}</h4>
                                                    <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                                                        <div className="flex items-center gap-1">
                                                            <Users size={14} /> <span>{cls.grade}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Clock size={14} /> <span>{cls.time}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-6 px-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                                        <p className="text-slate-400 text-sm italic text-center">Your weekly schedule is currently clear.</p>
                                    </div>
                                )}
                            </div>
                        )}
                        {activeTab === 'requests' && (
                            <TeacherRequests teacher={teacher} onRefresh={fetchTeacherData} />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default TeacherDashboard;
