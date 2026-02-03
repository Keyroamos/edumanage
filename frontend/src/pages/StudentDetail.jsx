import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Calendar, BookOpen, CreditCard, Clock,
    MapPin, Phone, Mail, ChevronLeft, Download, Award,
    Edit, AlertCircle, CheckCircle, Smartphone, Shield,
    Activity, ArrowUpRight, Copy, PieChart, BarChart3,
    TrendingUp, TrendingDown, X, XCircle, Plus, PlusCircle,
    Wallet, Receipt, History, Landmark, GraduationCap, LogOut
} from 'lucide-react';
import Button from '../components/ui/Button';
import axios from 'axios';
import { useSchool } from '../context/SchoolContext';

// --- Sub-components for Clean Layout ---

const StatCard = ({ label, value, icon: Icon, color, trend }) => (
    <div className={`p-2.5 md:p-3.5 rounded-xl border ${color} bg-white dark:bg-slate-900/50 backdrop-blur-sm flex flex-col items-center text-center md:items-start md:text-left relative overflow-hidden group`}>
        <div className="flex justify-center md:justify-between items-center w-full mb-1.5 md:mb-3">
            <div className={`p-1.5 rounded-lg ${color.replace('border-', 'bg-').replace('200', '50').replace('text-', 'bg-')} dark:bg-opacity-20 group-hover:scale-110 transition-transform shadow-sm`}>
                <Icon size={16} className={color.replace('border-', 'text-').replace('bg-', 'text-').includes('text-') ? color.replace('border-', 'text-') : 'text-primary-600'} />
            </div>
            {trend && (
                <span className="hidden md:flex items-center text-[9px] font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-1.5 py-0.5 rounded-md">
                    <ArrowUpRight size={10} className="mr-1" />
                    {trend}
                </span>
            )}
        </div>
        <div className="space-y-0.5">
            <p className="text-slate-500 dark:text-slate-400 text-[8px] md:text-[10px] font-bold uppercase tracking-widest leading-none">{label}</p>
            <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white leading-tight">{value}</h3>
        </div>
    </div>
);

const DetailItem = ({ icon: Icon, label, value, subValue }) => (
    <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
        <div className="h-8 w-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-primary-500 group-hover:shadow-sm transition-all">
            <Icon size={14} />
        </div>
        <div className="flex-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1 tracking-wider">{label}</p>
            <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">{value || 'N/A'}</p>
            {subValue && <p className="text-[11px] text-slate-500 mt-0.5">{subValue}</p>}
        </div>
    </div>
);

const TabButton = ({ id, label, icon: Icon, active, onClick }) => (
    <button
        onClick={() => onClick(id)}
        className={`relative flex items-center gap-1 md:gap-1.5 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[10px] md:text-xs font-black transition-all shrink-0 uppercase tracking-tighter ${active
            ? 'text-white'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
    >
        {active && (
            <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-slate-900 dark:bg-primary-600 rounded-full shadow-lg"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
        )}
        <span className="relative z-10 flex items-center gap-1 md:gap-1.5">
            <Icon size={12} className="md:w-3.5 md:h-3.5" />
            {label}
        </span>
    </button>
);

// Academic Records Component - Advanced Summary View
const AcademicRecords = ({ studentId, student, isManageable }) => {
    const navigate = useNavigate();
    const [academicData, setAcademicData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAcademicRecords = async () => {
            try {
                const response = await axios.get(`/api/students/${studentId}/academics/`);
                setAcademicData(response.data);
            } catch (error) {
                console.error('Error fetching academic records:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAcademicRecords();
    }, [studentId]);

    if (loading) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-primary-600 mx-auto mb-4"></div>
                <p className="text-slate-500 text-sm">Loading academic records...</p>
            </div>
        );
    }

    if (!academicData || !academicData.success) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800">
                <Award size={48} className="mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Academic Records</h3>
                <p className="text-slate-500 text-sm mb-6">No assessment records found for this student.</p>
                {/* Only show this to staff/admins, students just see "No records" */}
                {isManageable && (
                    <Button onClick={() => {
                        const gradeId = student?.academic?.grade_id || student?.grade_id || '';
                        navigate(`/academics?student=${studentId}&grade=${gradeId}`);
                    }}>
                        Record First Assessment
                    </Button>
                )}
            </div>
        );
    }

    const totalRecords = Object.values(academicData.records).reduce((acc, term) => {
        return acc + Object.keys(term).length;
    }, 0);

    // Calculate subject averages
    const subjectAverages = {};
    Object.values(academicData.records).forEach(assessments => {
        Object.values(assessments).forEach(data => {
            data.subjects.forEach(subject => {
                if (!subjectAverages[subject.subject_name]) {
                    subjectAverages[subject.subject_name] = { total: 0, count: 0 };
                }
                subjectAverages[subject.subject_name].total += subject.marks;
                subjectAverages[subject.subject_name].count += 1;
            });
        });
    });

    const subjectPerformance = Object.entries(subjectAverages).map(([name, data]) => ({
        name,
        average: (data.total / data.count).toFixed(1)
    })).sort((a, b) => b.average - a.average);

    const maxScore = Math.max(...subjectPerformance.map(s => parseFloat(s.average)));

    return (
        <div className="space-y-3 md:space-y-4">
            {/* Stats Overview - Compact */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-3 md:p-4 border border-blue-100 dark:border-blue-800/30">
                    <div className="flex items-center gap-2 mb-1.5 md:mb-2 text-left">
                        <div className="h-7 w-7 md:h-8 md:w-8 bg-blue-500 rounded-lg flex items-center justify-center shrink-0">
                            <Award size={14} className="text-white" />
                        </div>
                        <p className="text-[10px] text-blue-700 dark:text-blue-400 font-bold uppercase truncate">Average</p>
                    </div>
                    <p className="text-xl md:text-3xl font-black text-blue-900 dark:text-blue-300 text-left">{academicData.stats.average_score}%</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-3 md:p-4 border border-purple-100 dark:border-purple-800/30">
                    <div className="flex items-center gap-2 mb-1.5 md:mb-2 text-left">
                        <div className="h-7 w-7 md:h-8 md:w-8 bg-purple-500 rounded-lg flex items-center justify-center shrink-0">
                            <BookOpen size={14} className="text-white" />
                        </div>
                        <p className="text-[10px] text-purple-700 dark:text-purple-400 font-bold uppercase truncate">Assessments</p>
                    </div>
                    <p className="text-xl md:text-3xl font-black text-purple-900 dark:text-purple-300 text-left">{academicData.stats.total_assessments}</p>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-3 md:p-4 border border-emerald-100 dark:border-emerald-800/30">
                    <div className="flex items-center gap-2 mb-1.5 md:mb-2 text-left">
                        <div className="h-7 w-7 md:h-8 md:w-8 bg-emerald-500 rounded-lg flex items-center justify-center shrink-0">
                            <BookOpen size={14} className="text-white" />
                        </div>
                        <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase truncate">Subjects</p>
                    </div>
                    <p className="text-xl md:text-3xl font-black text-emerald-900 dark:text-emerald-300 text-left">{academicData.stats.subjects_count}</p>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-3 md:p-4 border border-amber-100 dark:border-amber-800/30">
                    <div className="flex items-center gap-2 mb-1.5 md:mb-2 text-left">
                        <div className="h-7 w-7 md:h-8 md:w-8 bg-amber-500 rounded-lg flex items-center justify-center shrink-0">
                            <Calendar size={14} className="text-white" />
                        </div>
                        <p className="text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase truncate">Term</p>
                    </div>
                    <p className="text-sm md:text-xl font-black text-amber-900 dark:text-amber-300 text-left uppercase truncate">T{academicData.stats.latest_term}</p>
                </div>
            </div>

            {/* Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Performance Distribution Chart */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Performance Distribution</h3>
                        <PieChart size={16} className="text-slate-400" />
                    </div>

                    <div className="space-y-2.5">
                        {[
                            { level: '4', label: 'Exceeding', count: academicData.performance_distribution.exceeding, color: 'emerald' },
                            { level: '3', label: 'Meeting', count: academicData.performance_distribution.meeting, color: 'blue' },
                            { level: '2', label: 'Approaching', count: academicData.performance_distribution.approaching, color: 'amber' },
                            { level: '1', label: 'Below', count: academicData.performance_distribution.below, color: 'rose' }
                        ].map((item) => {
                            const percentage = ((item.count / (academicData.stats.total_assessments || 1)) * 100).toFixed(0);
                            return (
                                <div key={item.level} className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-medium text-slate-700 dark:text-slate-300">{item.label} ({item.level})</span>
                                        <span className="font-bold text-slate-900 dark:text-white">{item.count} <span className="text-slate-400 text-[10px]">({percentage}%)</span></span>
                                    </div>
                                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full bg-${item.color}-500 transition-all duration-500`}
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Subject Performance Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Subject Performance</h3>
                        <BarChart3 size={16} className="text-slate-400" />
                    </div>

                    <div className="space-y-2">
                        {subjectPerformance.slice(0, 6).map((subject, idx) => (
                            <div key={idx} className="group">
                                <div className="flex items-center justify-between text-xs mb-0.5">
                                    <span className="font-medium text-slate-700 dark:text-slate-300">{subject.name}</span>
                                    <span className="font-bold text-slate-900 dark:text-white">{subject.average}%</span>
                                </div>
                                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-primary-500 to-primary-600 group-hover:from-primary-600 group-hover:to-primary-700 transition-all duration-300"
                                        style={{ width: `${(parseFloat(subject.average) / maxScore) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Assessments Summary */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <BookOpen size={16} className="text-primary-500" />
                                Assessment Summary
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                {totalRecords} assessment{totalRecords !== 1 ? 's' : ''} across {Object.keys(academicData.records).length} term{Object.keys(academicData.records).length !== 1 ? 's' : ''}
                            </p>
                        </div>
                        <Button
                            onClick={() => navigate(`/students/${studentId}/academic-report`)}
                            size="sm"
                            className="text-xs"
                        >
                            View Full Report
                            <ArrowUpRight size={14} className="ml-1.5" />
                        </Button>
                    </div>
                </div>

                <div className="p-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {Object.entries(academicData.records).slice(0, 3).map(([term, assessments]) => (
                            <div key={term} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 hover:border-primary-200 dark:hover:border-primary-800 transition-all cursor-pointer group">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{term}</span>
                                    <Calendar size={14} className="text-slate-400 group-hover:text-primary-500 transition-colors" />
                                </div>
                                <p className="text-2xl font-black text-slate-900 dark:text-white mb-0.5">
                                    {Object.keys(assessments).length}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Assessment{Object.keys(assessments).length !== 1 ? 's' : ''}
                                </p>
                            </div>
                        ))}
                    </div>

                    {Object.keys(academicData.records).length === 0 && (
                        <div className="text-center py-8">
                            <BookOpen size={40} className="mx-auto text-slate-300 mb-3" />
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">No Assessments Yet</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">This student hasn't been assessed yet.</p>
                            <Button onClick={() => navigate('/academics')} size="sm">
                                Record First Assessment
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions - Only for Manageable roles */}
            {isManageable && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                        onClick={() => navigate(`/students/${studentId}/academic-report`)}
                        className="group p-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 transition-all text-left"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="h-10 w-10 rounded-lg bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Download size={18} className="text-primary-600" />
                            </div>
                            <ArrowUpRight size={16} className="text-slate-400 group-hover:text-primary-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">View Detailed Report</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Complete academic analysis with charts</p>
                    </button>

                    <button
                        onClick={() => {
                            const gradeId = student?.academic?.grade_id || student?.grade_id || '';
                            navigate(`/academics?student=${studentId}&grade=${gradeId}`);
                        }}
                        className="group p-4 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border border-primary-200 dark:border-primary-800 hover:border-primary-300 dark:hover:border-primary-700 transition-all text-left"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="h-10 w-10 rounded-lg bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Edit size={18} className="text-primary-600" />
                            </div>
                            <ArrowUpRight size={16} className="text-primary-400 group-hover:text-primary-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">Record New Assessment</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Add marks for this student</p>
                    </button>
                </div>
            )}
        </div>
    );
};



const StudentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { config, hasFeature } = useSchool();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    // User check for permission management
    const activeUser = JSON.parse(localStorage.getItem('user') || '{}');
    const isStudentUser = activeUser.role === 'student';
    const isManageable = activeUser.is_superuser || activeUser.role === 'admin' || activeUser.role === 'staff';

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/student-login');
    };

    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [attendanceLoading, setAttendanceLoading] = useState(false);
    const [headerVisible, setHeaderVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    // Smart Header Logic
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Show header if scrolling up or at the very top
            if (currentScrollY < 10) {
                setHeaderVisible(true);
            } else if (currentScrollY > lastScrollY) {
                setHeaderVisible(false); // Scrolling down
            } else {
                setHeaderVisible(true); // Scrolling up
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    // Payment Modal State
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [submittingPayment, setSubmittingPayment] = useState(false);
    const [paymentForm, setPaymentForm] = useState({
        amount: '',
        payment_method: 'CASH',
        reference: '',
        term: '',
        description: ''
    });

    // Attendance Modal State
    const [showAttendanceModal, setShowAttendanceModal] = useState(false);
    const [submittingAttendance, setSubmittingAttendance] = useState(false);
    const [attendanceForm, setAttendanceForm] = useState({
        date: new Date().toISOString().split('T')[0],
        status: 'PRESENT',
        remark: ''
    });

    const handleDeleteStudent = async () => {
        if (!isManageable) {
            alert("You do not have permission to delete student records.");
            return;
        }
        if (window.confirm('Are you sure you want to delete this student record? This action cannot be undone.')) {
            try {
                setLoading(true);
                await axios.delete(`/api/students/${id}/`);
                navigate('/students?deleted=true');
            } catch (error) {
                alert(error.response?.data?.error || "Failed to delete student");
                setLoading(false);
            }
        }
    };

    const fetchStudent = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/students/${id}/`);
            setStudent(response.data.student);
        } catch (error) {
            console.error('Error fetching student:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudent();
    }, [id]);

    useEffect(() => {
        if (activeTab === 'attendance' && id) {
            setAttendanceLoading(true);
            axios.get(`/api/students/${id}/attendance/`)
                .then(res => setAttendanceHistory(res.data.attendance || []))
                .catch(err => console.error("Error fetching attendance history:", err))
                .finally(() => setAttendanceLoading(false));
        }
    }, [activeTab, id]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-primary-600"></div>
                <p className="text-slate-500 font-medium">Loading Student Profile...</p>
            </div>
        </div>
    );

    if (!student) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 gap-4">
            <div className="h-20 w-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
                <User size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Student Not Found</h2>
            <Button variant="outline" onClick={() => navigate(-1)}>Return to Dashboard</Button>
        </div>
    );

    // Calculate attendance statistics
    const calculateAttendanceStats = () => {
        if (!attendanceHistory || attendanceHistory.length === 0) {
            return {
                total: 0,
                present: 0,
                absent: 0,
                late: 0,
                rate: 0
            };
        }

        const present = attendanceHistory.filter(r => r.status === 'PRESENT').length;
        const absent = attendanceHistory.filter(r => r.status === 'ABSENT').length;
        const late = attendanceHistory.filter(r => r.status === 'LATE').length;
        const total = attendanceHistory.length;
        const rate = total > 0 ? ((present / total) * 100).toFixed(1) : 0;

        return { total, present, absent, late, rate };
    };

    const attendanceStats = calculateAttendanceStats();

    // Get recent attendance records (last 7 days)
    const recentAttendance = attendanceHistory.slice(0, 7);

    // Get calendar data for current month
    const getCalendarData = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const calendarData = [];
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const record = attendanceHistory.find(r => r.date === dateStr);
            calendarData.push({
                day,
                status: record ? record.status.toLowerCase() : null
            });
        }
        return calendarData;
    };

    const calendarData = getCalendarData();
    const currentMonthName = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        if (!isManageable) {
            alert("Permission denied.");
            return;
        }
        setSubmittingPayment(true);
        try {
            await axios.post(`/api/students/${id}/payment/add/`, paymentForm);
            setShowPaymentModal(false);
            setPaymentForm({
                amount: '',
                payment_method: 'CASH',
                reference: '',
                term: student?.personal?.current_term || '',
                description: ''
            });
            fetchStudent(); // Refresh data
        } catch (error) {
            alert(error.response?.data?.error || "Failed to record payment");
        } finally {
            setSubmittingPayment(false);
        }
    };

    const handleAttendanceSubmit = async (e) => {
        e.preventDefault();
        if (!isManageable) {
            alert("Permission denied.");
            return;
        }
        setSubmittingAttendance(true);
        try {
            await axios.post(`/api/students/${id}/attendance/mark/`, attendanceForm);
            setShowAttendanceModal(false);
            // Refresh attendance history
            const res = await axios.get(`/api/students/${id}/attendance/`);
            setAttendanceHistory(res.data.attendance || []);
            fetchStudent(); // Refresh general stats
        } catch (error) {
            alert(error.response?.data?.error || "Failed to record attendance");
        } finally {
            setSubmittingAttendance(false);
        }
    };

    // --- Content Renderers ---

    const renderOverview = () => (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 text-left">
            {/* Guardian Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 md:p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm md:text-base">
                        <MapPin size={18} className="text-purple-500" />
                        Guardian Info
                    </h3>
                    {isManageable && <Button variant="ghost" size="sm" className="h-7 w-7 md:h-8 md:w-8 p-0 rounded-full"><Edit size={14} /></Button>}
                </div>
                <div className="space-y-4">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 md:p-4 rounded-2xl flex items-center gap-4">
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center font-bold text-base md:text-lg shrink-0">
                            {student.guardian.name ? student.guardian.name.charAt(0) : 'G'}
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold text-slate-900 dark:text-white truncate text-sm md:text-base">{student.guardian.name || 'No Guardian'}</p>
                            <p className="text-[10px] md:text-xs text-slate-500 font-medium">Primary Guardian</p>
                        </div>
                    </div>
                    <div className="space-y-0.5">
                        <DetailItem icon={Phone} label="Phone Number" value={student.guardian.phone} />
                        <DetailItem icon={Mail} label="Email Address" value={student.guardian.email || 'No email provided'} />
                    </div>
                </div>
            </div>

            {/* Academic Snapshot */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 md:p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm md:text-base">
                        <BookOpen size={18} className="text-blue-500" />
                        Academic Status
                    </h3>
                    <span className="text-[10px] font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-full uppercase tracking-tighter">ACTIVE</span>
                </div>
                <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
                    <div className="p-3 md:p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/10 text-center">
                        <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase mb-0.5">Grade</p>
                        <p className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">{student.personal.grade}</p>
                    </div>
                    <div className="p-3 md:p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/10 text-center">
                        <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase mb-0.5">Rank</p>
                        <p className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">#{student.academic.position}</p>
                    </div>
                </div>
                <Button className="w-full justify-between group h-10 md:h-11 text-xs md:text-sm font-bold" variant="outline">
                    View Full Report
                    <ArrowUpRight size={14} className="text-slate-400 group-hover:text-primary-600 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Button>
            </div>

            {/* Attendance Snapshot */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-5 md:p-6 text-white shadow-lg overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Clock size={120} />
                </div>
                <div className="flex items-center justify-between mb-4 md:mb-6 relative z-10">
                    <h3 className="font-bold flex items-center gap-2 text-sm md:text-base">
                        <Clock size={18} className="text-emerald-400" />
                        Attendance
                    </h3>
                    <span className="text-[10px] font-black bg-white/10 px-2 py-1 rounded-lg uppercase tracking-tight">Term {student.personal.current_term}</span>
                </div>

                <div className="flex items-center justify-center py-2 md:py-4 relative z-10">
                    <div className="relative h-24 w-24 md:h-32 md:w-32 flex items-center justify-center">
                        <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                            <path className="text-white/10" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5" />
                            <path className="text-emerald-400" strokeDasharray={`${student.attendance.attendance_rate}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                            <span className="text-2xl md:text-3xl font-black tracking-tighter">{student.attendance.attendance_rate}%</span>
                            <span className="text-[8px] md:text-[10px] text-slate-400 uppercase font-black tracking-widest">Score</span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between text-xs mt-4 px-2 relative z-10">
                    <div className="text-center">
                        <p className="text-slate-500 text-[9px] uppercase font-black">Absent</p>
                        <p className="font-black text-sm">{student.attendance.absent_days}D</p>
                    </div>
                    <div className="text-center">
                        <p className="text-slate-500 text-[9px] uppercase font-black">Late</p>
                        <p className="font-black text-sm">{student.attendance.late_days}D</p>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderFinancials = () => (
        <div className="space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
                <StatCard
                    label="Billed"
                    value={`${config.currency}${student.financial.total_fees.toLocaleString()}`}
                    icon={CreditCard}
                    color="border-slate-200"
                />
                <StatCard
                    label="Paid"
                    value={`${config.currency}${student.financial.total_paid.toLocaleString()}`}
                    icon={CheckCircle}
                    color="border-emerald-200"
                />
                <StatCard
                    label="Total Balance"
                    value={`${config.currency}${student.financial.balance.toLocaleString()}`}
                    icon={AlertCircle}
                    color={student.financial.balance > 0 ? "border-rose-200" : "border-slate-200"}
                />
            </div>

            {/* Transaction History */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-center sm:text-left">
                        <h3 className="font-bold text-slate-900 dark:text-white">Transaction History</h3>
                        <p className="text-xs text-slate-500">Record and monitor fee payments</p>
                    </div>
                    <div className="flex w-full sm:w-auto gap-2">
                        {isManageable && (
                            <Button
                                variant="primary"
                                className="flex-1 sm:flex-none text-xs h-9"
                                onClick={() => {
                                    setPaymentForm({
                                        ...paymentForm,
                                        term: student.personal.current_term || 1
                                    });
                                    setShowPaymentModal(true);
                                }}
                            >
                                <PlusCircle size={14} className="mr-1.5" />
                                Record Payment
                            </Button>
                        )}
                        <Button variant="ghost" className="flex-1 sm:flex-none text-xs h-9">
                            <Download size={14} className="mr-1.5" />
                            Statement
                        </Button>
                    </div>
                </div>

                {/* Mobile View: Card List */}
                <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                    {student.financial.history.map((tx) => (
                        <div key={tx.id} className="p-4 space-y-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Term {tx.term} Fees</p>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase">{tx.date}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-slate-900 dark:text-white">{config.currency}{tx.amount.toLocaleString()}</p>
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[8px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 uppercase tracking-widest border border-emerald-500/10">
                                        Success
                                    </span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center text-[9px] bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                <div className="flex items-center gap-2">
                                    <History size={10} className="text-slate-400" />
                                    <span className="font-mono text-slate-400 uppercase tracking-tighter shrink-0">{tx.reference.substring(0, 10)}...</span>
                                </div>
                                <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                                    <Landmark size={10} />
                                    <span className="font-black uppercase">{tx.method}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop View: Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ref ID</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Method</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {student.financial.history.map((tx) => (
                                <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">{tx.date}</td>
                                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white font-medium">Term {tx.term} Fees</td>
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded select-all cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700">
                                            {tx.reference}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{tx.method}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-right text-slate-900 dark:text-white">{config.currency}{tx.amount.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                            Success
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
            {/* Top Navigation Bar (Smart Hide/Show) */}
            <motion.div
                initial={{ y: 0 }}
                animate={{ y: headerVisible ? 0 : -100 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-4"
            >
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    {isManageable && (
                        <button
                            onClick={() => navigate('/students')}
                            className="group flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                        >
                            <div className="p-2 rounded-full group-hover:bg-slate-100 dark:group-hover:bg-slate-800 transition-colors">
                                <ChevronLeft size={20} />
                            </div>
                            <span className="font-medium">Directory</span>
                        </button>
                    )}
                    {isStudentUser && (
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold">
                                <GraduationCap size={24} />
                                <span>My Profile</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 transition-all font-bold text-xs border border-red-100 dark:border-red-900/20"
                            >
                                <LogOut size={14} />
                                Logout
                            </button>
                        </div>
                    )}
                    <div className="flex gap-3">
                        <Button variant="outline" size="sm" className="hidden sm:flex" onClick={() => {
                            navigator.clipboard.writeText(student.personal.admission_number);
                            alert('Admission ID copied!');
                        }}>
                            <Copy size={16} className="mr-2" /> Copy ID
                        </Button>
                        {isManageable && (
                            <>
                                <Button variant="primary" size="sm" onClick={() => navigate(`/students/${id}/edit`)}>
                                    Edit Profile
                                </Button>
                                <Button variant="secondary" size="sm" className="bg-red-50 text-red-600 hover:bg-red-100 border-red-100" onClick={handleDeleteStudent}>
                                    Delete Student
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </motion.div>

            <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 md:py-8 space-y-6 md:space-y-8">
                {/* Hero Header */}
                <div className="relative">
                    {/* Background Banner */}
                    <div className="h-28 md:h-48 w-full bg-gradient-to-br from-slate-900 via-slate-800 to-primary-900 rounded-3xl md:rounded-[2rem] overflow-hidden shadow-lg border border-slate-200/10 dark:border-white/5">
                        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                        <div className="absolute -bottom-10 -right-10 p-12 opacity-10 rotate-12">
                            <GraduationCap size={240} className="text-white" />
                        </div>
                    </div>

                    {/* Profile Overlay */}
                    <div className="relative -mt-14 md:-mt-20 px-4 md:px-10 flex flex-col md:flex-row items-center md:items-end gap-3 md:gap-8">
                        {/* Profile Photo */}
                        <div className="relative group">
                            <div className="h-28 w-28 md:h-44 md:w-44 rounded-2xl md:rounded-[2rem] border-4 md:border-[6px] border-white dark:border-slate-950 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden p-1 flex items-center justify-center transform transition-transform group-hover:scale-[1.02]">
                                {student.personal.photo ? (
                                    <img
                                        src={student.personal.photo}
                                        alt={student.personal.full_name}
                                        className="w-full h-full object-cover rounded-xl md:rounded-[1.6rem]"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-slate-50 dark:bg-slate-800/50 rounded-xl md:rounded-[1.6rem] flex items-center justify-center text-slate-300">
                                        <User size={64} />
                                    </div>
                                )}
                            </div>
                            {isManageable && (
                                <button className="absolute bottom-1 right-1 md:bottom-3 md:right-3 p-2 bg-primary-600 text-white rounded-xl md:rounded-2xl shadow-xl hover:bg-primary-700 transition-all hover:scale-110 border-2 md:border-4 border-white dark:border-slate-950">
                                    <Edit size={14} className="md:w-4 md:h-4" />
                                </button>
                            )}
                        </div>

                        {/* Profile Info Card Content */}
                        <div className="pb-1 md:pb-6 flex-1 flex flex-col items-center md:items-start text-center md:text-left w-full md:w-auto mt-1 md:mt-0">
                            <div className="flex flex-col md:flex-row md:items-center gap-1.5 md:gap-3 mb-2 md:mb-3">
                                <h1 className="text-2xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight uppercase">
                                    {student.personal.full_name}
                                </h1>
                                {student.financial.balance <= 0 && (
                                    <div className="flex justify-center md:justify-start">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[9px] md:text-xs font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm backdrop-blur-md">
                                            <CheckCircle size={12} className="mr-1 md:mr-1.5" />
                                            CLEARED
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 md:gap-4">
                                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-2 text-xs md:text-sm font-bold text-slate-700 dark:text-slate-300">
                                    <Shield size={14} className="text-primary-500" />
                                    ID: {student.personal.admission_number}
                                </div>
                                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 font-semibold text-xs md:text-sm px-1">
                                    <span className="flex items-center gap-1.5">
                                        <MapPin size={16} className="text-slate-400" />
                                        {student.personal.location}
                                    </span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                                    <span className="flex items-center gap-1.5">
                                        <Calendar size={16} className="text-slate-400" />
                                        {student.personal.dob}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex md:justify-start overflow-x-auto pb-2 md:pb-0 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                    <div className="flex p-1 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none min-w-max">
                        <TabButton id="overview" label="Overview" icon={Activity} active={activeTab === 'overview'} onClick={setActiveTab} />
                        {hasFeature('FINANCE_MANAGEMENT') && (
                            <TabButton id="financial" label="Financials" icon={CreditCard} active={activeTab === 'financial'} onClick={setActiveTab} />
                        )}
                        <TabButton id="academic" label="Academics" icon={BookOpen} active={activeTab === 'academic'} onClick={setActiveTab} />
                        <TabButton id="attendance" label="Attendance" icon={Clock} active={activeTab === 'attendance'} onClick={setActiveTab} />
                    </div>
                </div>

                {/* Main Content Area */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'overview' && renderOverview()}
                        {activeTab === 'financial' && renderFinancials()}
                        {activeTab === 'academic' && <AcademicRecords studentId={id} student={student} isManageable={isManageable} />}
                        {activeTab === 'attendance' && (
                            <div className="space-y-4">
                                {attendanceLoading ? (
                                    <div className="bg-white dark:bg-slate-900 rounded-xl p-12 text-center">
                                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-primary-600 mx-auto mb-4"></div>
                                        <p className="text-slate-500 text-sm">Loading attendance records...</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Compact Stats Row */}
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                            <div className="bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-3 md:p-4 border border-emerald-100 dark:border-emerald-800/30">
                                                <div className="flex items-center gap-2 md:gap-3 text-left">
                                                    <div className="h-8 w-8 md:h-10 md:w-10 bg-emerald-500 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                                                        <CheckCircle size={16} className="text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase">Rate</p>
                                                        <p className="text-xl md:text-2xl font-black text-emerald-900 dark:text-emerald-300 leading-none">{attendanceStats.rate}%</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-3 md:p-4 border border-blue-100 dark:border-blue-800/30">
                                                <div className="flex items-center gap-2 md:gap-3 text-left">
                                                    <div className="h-8 w-8 md:h-10 md:w-10 bg-blue-500 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                                                        <Calendar size={16} className="text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-blue-700 dark:text-blue-400 font-bold uppercase">Present</p>
                                                        <p className="text-xl md:text-2xl font-black text-blue-900 dark:text-blue-300 leading-none">{attendanceStats.present}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-gradient-to-br from-rose-50/50 to-pink-50/50 dark:from-rose-900/20 dark:to-pink-900/20 rounded-xl p-3 md:p-4 border border-rose-100 dark:border-rose-800/30">
                                                <div className="flex items-center gap-2 md:gap-3 text-left">
                                                    <div className="h-8 w-8 md:h-10 md:w-10 bg-rose-500 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                                                        <XCircle size={16} className="text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-rose-700 dark:text-rose-400 font-bold uppercase">Absent</p>
                                                        <p className="text-xl md:text-2xl font-black text-rose-900 dark:text-rose-300 leading-none">{attendanceStats.absent}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-gradient-to-br from-amber-50/50 to-orange-50/50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-3 md:p-4 border border-amber-100 dark:border-amber-800/30">
                                                <div className="flex items-center gap-2 md:gap-3 text-left">
                                                    <div className="h-8 w-8 md:h-10 md:w-10 bg-amber-500 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                                                        <Clock size={16} className="text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase">Late</p>
                                                        <p className="text-xl md:text-2xl font-black text-amber-900 dark:text-amber-300 leading-none">{attendanceStats.late}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Two Column Layout */}
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                            {/* Recent Attendance - Compact */}
                                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                                                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                                                    <div>
                                                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">Recent Attendance</h3>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">Last 7 days</p>
                                                    </div>
                                                    {isManageable && (
                                                        <Button
                                                            size="sm"
                                                            className="text-xs h-8"
                                                            onClick={() => setShowAttendanceModal(true)}
                                                        >
                                                            <Plus size={14} className="mr-1" />
                                                            Mark Attendance
                                                        </Button>
                                                    )}
                                                </div>

                                                <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-80 overflow-y-auto">
                                                    {recentAttendance.length > 0 ? recentAttendance.map((record, idx) => (
                                                        <div key={idx} className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${record.status === 'PRESENT' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                                                                        record.status === 'LATE' ? 'bg-amber-100 dark:bg-amber-900/30' :
                                                                            'bg-rose-100 dark:bg-rose-900/30'
                                                                        }`}>
                                                                        {record.status === 'PRESENT' ? (
                                                                            <CheckCircle size={16} className="text-emerald-600 dark:text-emerald-400" />
                                                                        ) : record.status === 'LATE' ? (
                                                                            <Clock size={16} className="text-amber-600 dark:text-amber-400" />
                                                                        ) : (
                                                                            <XCircle size={16} className="text-rose-600 dark:text-rose-400" />
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-semibold text-sm text-slate-900 dark:text-white">
                                                                            {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short' })}
                                                                        </p>
                                                                        <p className="text-xs text-slate-500 dark:text-slate-400">{record.date}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                                                        {record.time_in || '-'}
                                                                    </p>
                                                                    <span className={`text-xs font-bold uppercase ${record.status === 'PRESENT' ? 'text-emerald-600 dark:text-emerald-400' :
                                                                        record.status === 'LATE' ? 'text-amber-600 dark:text-amber-400' :
                                                                            'text-rose-600 dark:text-rose-400'
                                                                        }`}>
                                                                        {record.status}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )) : (
                                                        <div className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                                                            <Clock size={32} className="mx-auto mb-2 opacity-50" />
                                                            <p className="text-sm">No attendance records yet</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Compact Calendar */}
                                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">{currentMonthName}</h3>
                                                    <div className="flex gap-1">
                                                        <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                                            <ChevronLeft size={16} className="text-slate-600 dark:text-slate-400" />
                                                        </button>
                                                        <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                                            <ChevronLeft size={16} className="text-slate-600 dark:text-slate-400 rotate-180" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Compact Calendar Grid */}
                                                <div className="grid grid-cols-7 gap-1">
                                                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                                                        <div key={i} className="text-center py-1">
                                                            <span className="text-xs font-bold text-slate-400 dark:text-slate-500">{day}</span>
                                                        </div>
                                                    ))}

                                                    {calendarData.map((dayData, i) => (
                                                        <div
                                                            key={i}
                                                            className={`aspect-square rounded-md flex items-center justify-center text-xs font-semibold cursor-pointer transition-all hover:scale-110 ${dayData.status === 'present' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                                dayData.status === 'late' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                                    dayData.status === 'absent' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                                                                        'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                                                                }`}
                                                        >
                                                            {dayData.day}
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Legend */}
                                                <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="h-3 w-3 rounded bg-emerald-500"></div>
                                                        <span className="text-xs text-slate-600 dark:text-slate-400">Present</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="h-3 w-3 rounded bg-amber-500"></div>
                                                        <span className="text-xs text-slate-600 dark:text-slate-400">Late</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="h-3 w-3 rounded bg-rose-500"></div>
                                                        <span className="text-xs text-slate-600 dark:text-slate-400">Absent</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Weekly Trend - Compact */}
                                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">Weekly Trend</h3>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">Last 7 days pattern</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-7 gap-2">
                                                {recentAttendance.slice(0, 7).reverse().map((record, idx) => {
                                                    const status = record.status.toLowerCase();
                                                    const height = status === 'present' ? 90 : status === 'late' ? 75 : 0;

                                                    return (
                                                        <div key={idx} className="flex flex-col items-center gap-1.5">
                                                            <div className="w-full h-20 bg-slate-100 dark:bg-slate-800 rounded-lg relative overflow-hidden">
                                                                <div
                                                                    className={`absolute bottom-0 w-full transition-all duration-500 ${status === 'present' ? 'bg-gradient-to-t from-emerald-500 to-emerald-400' :
                                                                        status === 'late' ? 'bg-gradient-to-t from-amber-500 to-amber-400' :
                                                                            'bg-gradient-to-t from-rose-500 to-rose-400'
                                                                        }`}
                                                                    style={{ height: `${height}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                                                                {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short' })}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Record Payment Modal */}
            <AnimatePresence>
                {showPaymentModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
                        >
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Record Fee Payment</h3>
                                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-0.5">Payment for {student.personal.full_name}</p>
                                </div>
                                <button
                                    onClick={() => setShowPaymentModal(false)}
                                    className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handlePaymentSubmit} className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Payment Amount</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">{config.currency}</span>
                                            <input
                                                type="number"
                                                required
                                                placeholder="0.00"
                                                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 rounded-2xl outline-none transition-all font-bold text-lg"
                                                value={paymentForm.amount}
                                                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Term</label>
                                        <select
                                            required
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 rounded-2xl outline-none transition-all font-semibold"
                                            value={paymentForm.term}
                                            onChange={(e) => setPaymentForm({ ...paymentForm, term: e.target.value })}
                                        >
                                            <option value="">Select Term</option>
                                            <option value="1">Term 1</option>
                                            <option value="2">Term 2</option>
                                            <option value="3">Term 3</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Payment Method</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {[
                                            { id: 'CASH', label: 'Cash', icon: Wallet },
                                            { id: 'MPESA', label: 'M-Pesa', icon: Smartphone },
                                            { id: 'BANK', label: 'Bank', icon: Landmark },
                                            { id: 'CHEQUE', label: 'Cheque', icon: Receipt },
                                        ].map((method) => (
                                            <button
                                                key={method.id}
                                                type="button"
                                                onClick={() => setPaymentForm({ ...paymentForm, payment_method: method.id })}
                                                className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${paymentForm.payment_method === method.id
                                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600'
                                                    : 'border-slate-100 dark:border-slate-800 text-slate-400 hover:border-slate-200 dark:hover:border-slate-700'
                                                    }`}
                                            >
                                                <method.icon size={20} />
                                                <span className="text-[10px] font-bold uppercase">{method.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Reference Number / Description</label>
                                    <input
                                        type="text"
                                        placeholder="M-Pesa Code, Bank Ref, or Description"
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 rounded-2xl outline-none transition-all"
                                        value={paymentForm.reference}
                                        onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                                    />
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <Button
                                        variant="outline"
                                        className="flex-1 rounded-2xl py-4"
                                        onClick={() => setShowPaymentModal(false)}
                                        type="button"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="primary"
                                        className="flex-[2] rounded-2xl py-4 shadow-lg shadow-primary-500/25"
                                        type="submit"
                                        disabled={submittingPayment}
                                    >
                                        {submittingPayment ? 'Recording...' : 'Complete Payment'}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Mark Attendance Modal */}
            <AnimatePresence>
                {showAttendanceModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
                        >
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Mark Attendance</h3>
                                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-0.5">{student.personal.full_name}</p>
                                </div>
                                <button
                                    onClick={() => setShowAttendanceModal(false)}
                                    className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleAttendanceSubmit} className="p-6 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 rounded-2xl outline-none transition-all font-semibold"
                                        value={attendanceForm.date}
                                        onChange={(e) => setAttendanceForm({ ...attendanceForm, date: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Status</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { id: 'PRESENT', label: 'Present', icon: CheckCircle, color: 'emerald' },
                                            { id: 'LATE', label: 'Late', icon: Clock, color: 'amber' },
                                            { id: 'ABSENT', label: 'Absent', icon: XCircle, color: 'rose' },
                                        ].map((status) => (
                                            <button
                                                key={status.id}
                                                type="button"
                                                onClick={() => setAttendanceForm({ ...attendanceForm, status: status.id })}
                                                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${attendanceForm.status === status.id
                                                    ? `border-${status.color}-500 bg-${status.color}-50 dark:bg-${status.color}-900/20 text-${status.color}-600`
                                                    : 'border-slate-100 dark:border-slate-800 text-slate-400 hover:border-slate-200 dark:hover:border-slate-700'
                                                    }`}
                                            >
                                                <status.icon size={24} />
                                                <span className="text-[10px] font-bold uppercase">{status.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Remark (Optional)</label>
                                    <textarea
                                        placeholder="Reason for late/absent, etc."
                                        rows="2"
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 rounded-2xl outline-none transition-all resize-none"
                                        value={attendanceForm.remark}
                                        onChange={(e) => setAttendanceForm({ ...attendanceForm, remark: e.target.value })}
                                    />
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <Button
                                        variant="outline"
                                        className="flex-1 rounded-2xl py-4"
                                        onClick={() => setShowAttendanceModal(false)}
                                        type="button"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="primary"
                                        className="flex-[2] rounded-2xl py-4 shadow-lg shadow-primary-500/25"
                                        type="submit"
                                        disabled={submittingAttendance}
                                    >
                                        {submittingAttendance ? 'Saving...' : 'Save Record'}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div >
    );
};

export default StudentDetail;
