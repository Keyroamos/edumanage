import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Calendar, BookOpen, CreditCard, Clock,
    MapPin, Phone, Mail, ChevronLeft, Download, Award,
    Edit, AlertCircle, CheckCircle, Smartphone, Shield,
    Activity, ArrowUpRight, Copy, PieChart, BarChart3,
    TrendingUp, TrendingDown, X, UserCheck, XCircle
} from 'lucide-react';
import Button from '../../components/ui/Button';
import axios from 'axios';

// --- Sub-components for Clean Layout ---

const StatCard = ({ label, value, icon: Icon, color, trend }) => (
    <div className={`p-5 rounded-2xl border ${color} bg-white dark:bg-slate-900/50 backdrop-blur-sm`}>
        <div className="flex justify-between items-start mb-2">
            <div className={`p-2 rounded-lg ${color.replace('border-', 'bg-').replace('200', '50')} dark:bg-opacity-20`}>
                <Icon size={20} className={color.replace('border-', 'text-').replace('200', '600')} />
            </div>
            {trend && (
                <span className="flex items-center text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">
                    <ArrowUpRight size={12} className="mr-1" />
                    {trend}
                </span>
            )}
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">{label}</p>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</h3>
    </div>
);

const DetailItem = ({ icon: Icon, label, value, subValue }) => (
    <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
        <div className="h-10 w-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-primary-500 group-hover:shadow-sm transition-all">
            <Icon size={18} />
        </div>
        <div className="flex-1">
            <p className="text-xs font-medium text-slate-400 uppercase mb-0.5">{label}</p>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{value || 'N/A'}</p>
            {subValue && <p className="text-xs text-slate-500">{subValue}</p>}
        </div>
    </div>
);

const TabButton = ({ id, label, icon: Icon, active, onClick }) => (
    <button
        onClick={() => onClick(id)}
        className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${active
            ? 'text-white'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
    >
        {active && (
            <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-slate-900 dark:bg-primary-600 rounded-full"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
        )}
        <span className="relative z-10 flex items-center gap-2">
            <Icon size={16} />
            {label}
        </span>
    </button>
);

// Academic Records Component - Advanced Summary View
const AcademicRecords = ({ studentId, student }) => {
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
                <p className="text-slate-500 text-sm">No assessment records found for this student.</p>
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
        <div className="space-y-4">
            {/* Stats Overview - Compact */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-3 md:p-4 border border-blue-100 dark:border-blue-800/30">
                    <div className="flex items-center gap-2 mb-1 md:mb-2">
                        <div className="h-6 w-6 md:h-8 md:w-8 bg-blue-500 rounded-lg flex items-center justify-center">
                            <Award size={14} className="md:w-4 md:h-4 text-white" />
                        </div>
                        <p className="text-[10px] md:text-xs text-blue-700 dark:text-blue-400 font-bold uppercase truncate">Average</p>
                    </div>
                    <p className="text-xl md:text-3xl font-black text-blue-900 dark:text-blue-300">{academicData.stats.average_score}%</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-3 md:p-4 border border-purple-100 dark:border-purple-800/30">
                    <div className="flex items-center gap-2 mb-1 md:mb-2">
                        <div className="h-6 w-6 md:h-8 md:w-8 bg-purple-500 rounded-lg flex items-center justify-center">
                            <BookOpen size={14} className="md:w-4 md:h-4 text-white" />
                        </div>
                        <p className="text-[10px] md:text-xs text-purple-700 dark:text-purple-400 font-bold uppercase truncate">Exams</p>
                    </div>
                    <p className="text-xl md:text-3xl font-black text-purple-900 dark:text-purple-300">{academicData.stats.total_assessments}</p>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-3 md:p-4 border border-emerald-100 dark:border-emerald-800/30">
                    <div className="flex items-center gap-2 mb-1 md:mb-2">
                        <div className="h-6 w-6 md:h-8 md:w-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                            <BookOpen size={14} className="md:w-4 md:h-4 text-white" />
                        </div>
                        <p className="text-[10px] md:text-xs text-emerald-700 dark:text-emerald-400 font-bold uppercase truncate">Subjects</p>
                    </div>
                    <p className="text-xl md:text-3xl font-black text-emerald-900 dark:text-emerald-300">{academicData.stats.subjects_count}</p>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-3 md:p-4 border border-amber-100 dark:border-amber-800/30">
                    <div className="flex items-center gap-2 mb-1 md:mb-2">
                        <div className="h-6 w-6 md:h-8 md:w-8 bg-amber-500 rounded-lg flex items-center justify-center">
                            <Calendar size={14} className="md:w-4 md:h-4 text-white" />
                        </div>
                        <p className="text-[10px] md:text-xs text-amber-700 dark:text-amber-400 font-bold uppercase truncate">Term</p>
                    </div>
                    <p className="text-lg md:text-xl font-black text-amber-900 dark:text-amber-300 truncate">{academicData.stats.latest_term}</p>
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
                            onClick={() => {
                                const user = JSON.parse(localStorage.getItem('user') || '{}');
                                const teacherId = user?.teacher?.pk || user?.id || '';
                                if (teacherId) {
                                    navigate(`/teacher/${teacherId}/student/${studentId}/report`);
                                }
                            }}
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
                            <p className="text-xs text-slate-500 dark:text-slate-400">This student hasn't been assessed yet.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 gap-3">
                <button
                    onClick={() => {
                        const user = JSON.parse(localStorage.getItem('user') || '{}');
                        const teacherId = user?.teacher?.pk || user?.id || '';
                        const gradeId = student?.academic?.grade_id || student?.grade_id || '';
                        if (teacherId) {
                            navigate(`/teacher/${teacherId}/academics?student=${studentId}&grade=${gradeId}`);
                        }
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
        </div>
    );
};



const TeacherStudentDetail = () => {
    const { id } = useParams(); // This is the student ID
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [attendanceLoading, setAttendanceLoading] = useState(false);

    // Get teacher ID from localStorage for navigation
    const getTeacherId = () => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user?.teacher?.pk || user?.id || '';
    };

    useEffect(() => {
        const fetchStudent = async () => {
            try {
                // Use the same API as Admin
                const response = await axios.get(`/api/students/${id}/`);
                setStudent(response.data.student);
            } catch (error) {
                console.error('Error fetching student:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStudent();
    }, [id]);

    // Fetch attendance records when attendance tab is active
    useEffect(() => {
        const fetchAttendance = async () => {
            if (activeTab === 'attendance' && id) {
                setAttendanceLoading(true);
                try {
                    const response = await axios.get(`/api/students/${id}/attendance/`);
                    setAttendanceRecords(response.data.attendance || []);
                } catch (error) {
                    console.error('Error fetching attendance:', error);
                    setAttendanceRecords([]);
                } finally {
                    setAttendanceLoading(false);
                }
            }
        };
        fetchAttendance();
    }, [activeTab, id]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-indigo-600"></div>
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
            <Button variant="outline" onClick={() => navigate(-1)}>Return to Class</Button>
        </div>
    );

    // Calculate attendance statistics
    const calculateAttendanceStats = () => {
        if (!attendanceRecords || attendanceRecords.length === 0) {
            return {
                total: 0,
                present: 0,
                absent: 0,
                late: 0,
                rate: 0
            };
        }

        const present = attendanceRecords.filter(r => r.status === 'PRESENT').length;
        const absent = attendanceRecords.filter(r => r.status === 'ABSENT').length;
        const late = attendanceRecords.filter(r => r.status === 'LATE').length;
        const total = attendanceRecords.length;
        const rate = total > 0 ? ((present / total) * 100).toFixed(1) : 0;

        return { total, present, absent, late, rate };
    };

    const attendanceStats = calculateAttendanceStats();

    // Get recent attendance records (last 7 days)
    const recentAttendance = attendanceRecords.slice(0, 7);

    // Get calendar data for current month
    const getCalendarData = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const calendarData = [];
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const record = attendanceRecords.find(r => r.date === dateStr);
            calendarData.push({
                day,
                status: record ? record.status.toLowerCase() : null
            });
        }
        return calendarData;
    };

    const calendarData = getCalendarData();
    const currentMonthName = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    // --- Content Renderers ---

    const renderOverview = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Guardian Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 md:p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm md:text-base">
                        <MapPin size={18} className="text-purple-500 md:w-5 md:h-5" />
                        Guardian Info
                    </h3>
                </div>
                <div className="space-y-4">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 md:p-4 rounded-2xl flex items-center gap-3 md:gap-4">
                        <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center font-bold text-lg">
                            {student.guardian.name ? student.guardian.name.charAt(0) : 'G'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="font-bold text-slate-900 dark:text-white truncate text-sm md:text-base">{student.guardian.name || 'No Guardian Name'}</p>
                            <p className="text-xs text-slate-500">Primary Guardian</p>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <DetailItem icon={Phone} label="Phone Number" value={student.guardian.phone} />
                        <DetailItem icon={Mail} label="Email Address" value={student.guardian.email || 'No email provided'} />
                    </div>
                </div>
            </div>

            {/* Academic Snapshot */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 md:p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm md:text-base">
                        <BookOpen size={18} className="text-blue-500 md:w-5 md:h-5" />
                        Academic Status
                    </h3>
                    <span className="text-xs font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-full">ACTIVE</span>
                </div>
                <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
                    <div className="p-3 md:p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/10 text-center">
                        <p className="text-[10px] md:text-xs text-blue-600 dark:text-blue-400 font-bold uppercase mb-1">Grade</p>
                        <p className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">{student.personal.grade}</p>
                    </div>
                    <div className="p-3 md:p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/10 text-center">
                        <p className="text-[10px] md:text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase mb-1">Rank</p>
                        <p className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">#{student.academic.position}</p>
                    </div>
                </div>
            </div>

            {/* Attendance Snapshot */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-5 md:p-6 text-white shadow-lg md:col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                    <h3 className="font-bold flex items-center gap-2 text-sm md:text-base">
                        <Clock size={18} className="text-emerald-400 md:w-5 md:h-5" />
                        Attendance
                    </h3>
                    <span className="text-xs font-medium bg-white/10 px-2 py-1 rounded-lg">This Term</span>
                </div>

                <div className="flex items-center justify-center py-2 md:py-4">
                    {/* Simple Circular Progress Visual */}
                    <div className="relative h-28 w-28 md:h-32 md:w-32 flex items-center justify-center">
                        <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                            <path className="text-white/10" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                            <path className="text-emerald-400" strokeDasharray={`${student.attendance.attendance_rate}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                            <span className="text-2xl md:text-3xl font-bold">{student.attendance.attendance_rate}%</span>
                            <span className="text-[10px] text-slate-300 uppercase tracking-widest">Present</span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between text-sm mt-2 px-2">
                    <div className="text-center">
                        <p className="text-slate-400 text-xs uppercase">Absent</p>
                        <p className="font-bold">{student.attendance.absent_days} Days</p>
                    </div>
                    <div className="text-center">
                        <p className="text-slate-400 text-xs uppercase">Late</p>
                        <p className="font-bold">{student.attendance.late_days} Days</p>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderFinancials = () => (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800">
                <CreditCard size={48} className="mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Financial Access Restricted</h3>
                <p className="text-slate-500 text-sm">You do not have permission to view detailed financial records.</p>
            </div>
        </div>
    );

    return (
        <div className="bg-slate-50 dark:bg-slate-950 pb-20 min-h-screen">
            <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 md:px-8 py-3 md:py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <button
                        onClick={() => {
                            const teacherId = getTeacherId();
                            if (teacherId) {
                                navigate(`/teacher/${teacherId}/class`);
                            } else {
                                navigate(-1);
                            }
                        }}
                        className="group flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                    >
                        <div className="p-1.5 md:p-2 rounded-full group-hover:bg-slate-100 dark:group-hover:bg-slate-800 transition-colors">
                            <ChevronLeft size={20} className="md:w-5 md:h-5 w-4 h-4" />
                        </div>
                        <span className="font-medium text-sm md:text-base">Back to Class</span>
                    </button>
                    <div className="flex gap-3">
                        {/* Teacher Actions (Limited) */}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8 space-y-6 md:space-y-8">
                {/* Hero Header */}
                <div className="relative">
                    {/* Background Banner */}
                    <div className="h-32 md:h-48 w-full bg-gradient-to-r from-indigo-900 to-indigo-800 dark:from-slate-800 dark:to-slate-900 rounded-2xl md:rounded-3xl overflow-hidden shadow-sm">
                        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                        <div className="absolute bottom-0 right-0 p-8 md:p-12 opacity-10">
                            <Activity size={120} className="md:w-[200px] md:h-[200px]" />
                        </div>
                    </div>

                    {/* Profile Overlay */}
                    <div className="relative -mt-16 md:-mt-20 px-4 md:px-10 flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6 text-center md:text-left">
                        <div className="relative group">
                            <div className="h-32 w-32 md:h-40 md:w-40 rounded-3xl border-4 border-white dark:border-slate-950 bg-white dark:bg-slate-900 shadow-xl overflow-hidden p-1 flex items-center justify-center">
                                {student.personal.photo ? (
                                    <img
                                        src={student.personal.photo}
                                        alt={student.personal.full_name}
                                        className="w-full h-full object-cover rounded-2xl"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
                                        <User size={48} className="md:w-16 md:h-16" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pb-2 md:pb-4 flex-1 w-full">
                            <div className="flex flex-col md:flex-row items-center md:items-end md:gap-4 mb-3 md:mb-2">
                                <h1 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">{student.personal.full_name}</h1>
                            </div>
                            <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 md:gap-4 text-slate-600 dark:text-slate-400 font-medium text-xs md:text-sm">
                                <span className="bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-1.5">
                                    <Shield size={12} className="md:w-3.5 md:h-3.5 text-indigo-500" />
                                    ID: {student.personal.admission_number}
                                </span>
                                <span className="flex items-center gap-1">
                                    <MapPin size={14} className="md:w-4 md:h-4" />
                                    {student.personal.location}
                                </span>
                                <span className="hidden md:inline w-1 h-1 rounded-full bg-slate-300"></span>
                                <span className="flex items-center gap-1">
                                    <Calendar size={14} className="md:w-4 md:h-4" />
                                    Born {student.personal.dob}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex justify-start overflow-x-auto pb-2 md:pb-0 hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                    <div className="flex p-1 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm whitespace-nowrap">
                        <TabButton id="overview" label="Overview" icon={Activity} active={activeTab === 'overview'} onClick={setActiveTab} />
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
                        {activeTab === 'academic' && <AcademicRecords studentId={id} student={student} />}
                        {activeTab === 'attendance' && (
                            <div className="space-y-4">
                                {attendanceLoading ? (
                                    <div className="bg-white dark:bg-slate-900 rounded-xl p-12 text-center">
                                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-primary-600 mx-auto mb-4"></div>
                                        <p className="text-slate-500 text-sm">Loading attendance records...</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Compact Stats Row - 2x2 on mobile, 4x1 on desktop */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-3 md:p-4 border border-emerald-100 dark:border-emerald-800/30">
                                                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                                                    <div className="h-8 w-8 md:h-10 md:w-10 bg-emerald-500 rounded-lg flex items-center justify-center shrink-0">
                                                        <CheckCircle size={16} className="md:w-[18px] md:h-[18px] text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] md:text-xs text-emerald-700 dark:text-emerald-400 font-bold uppercase">Rate</p>
                                                        <p className="text-xl md:text-2xl font-black text-emerald-900 dark:text-emerald-300">{attendanceStats.rate}%</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-3 md:p-4 border border-blue-100 dark:border-blue-800/30">
                                                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                                                    <div className="h-8 w-8 md:h-10 md:w-10 bg-blue-500 rounded-lg flex items-center justify-center shrink-0">
                                                        <Calendar size={16} className="md:w-[18px] md:h-[18px] text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] md:text-xs text-blue-700 dark:text-blue-400 font-bold uppercase">Present</p>
                                                        <p className="text-xl md:text-2xl font-black text-blue-900 dark:text-blue-300">{attendanceStats.present}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 rounded-xl p-3 md:p-4 border border-rose-100 dark:border-rose-800/30">
                                                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                                                    <div className="h-8 w-8 md:h-10 md:w-10 bg-rose-500 rounded-lg flex items-center justify-center shrink-0">
                                                        <XCircle size={16} className="md:w-[18px] md:h-[18px] text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] md:text-xs text-rose-700 dark:text-rose-400 font-bold uppercase">Absent</p>
                                                        <p className="text-xl md:text-2xl font-black text-rose-900 dark:text-rose-300">{attendanceStats.absent}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-3 md:p-4 border border-amber-100 dark:border-amber-800/30">
                                                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                                                    <div className="h-8 w-8 md:h-10 md:w-10 bg-amber-500 rounded-lg flex items-center justify-center shrink-0">
                                                        <Clock size={16} className="md:w-[18px] md:h-[18px] text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] md:text-xs text-amber-700 dark:text-amber-400 font-bold uppercase">Late</p>
                                                        <p className="text-xl md:text-2xl font-black text-amber-900 dark:text-amber-300">{attendanceStats.late}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Two Column Layout */}
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                            {/* Recent Attendance - Compact */}
                                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                                                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                                                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">Recent Attendance</h3>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">Last 7 days</p>
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
        </div>
    );
};

export default TeacherStudentDetail;
