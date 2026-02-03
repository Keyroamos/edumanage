import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Users, Search, Filter, Download, MoreVertical,
    GraduationCap, UserCheck, UserX, TrendingUp
} from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';

const TeacherClasses = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [teacher, setTeacher] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    useEffect(() => {
        const fetchTeacherData = async () => {
            try {
                const response = await axios.get(`/api/teachers/${id}/`);
                setTeacher(response.data.teacher);

                if (response.data.teacher.professional.is_class_teacher && response.data.teacher.professional.grade_id) {
                    fetchStudents(response.data.teacher.professional.grade_id);
                }
            } catch (error) {
                console.error("Error fetching teacher:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTeacherData();
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

    // Derived State for Stats
    const totalStudents = students.length;
    const boysCount = students.filter(s => s.gender === 'M' || s.gender === 'Male').length;
    const girlsCount = students.filter(s => s.gender === 'F' || s.gender === 'Female').length;
    const activeCount = students.filter(s => s.status === 'ACTIVE').length;

    // Filter Logic
    const filteredStudents = students.filter(student => {
        const matchesSearch =
            (student.first_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (student.last_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (student.admission_number || '').toString().toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter = filterStatus === 'ALL' || student.status === filterStatus;

        return matchesSearch && matchesFilter;
    });

    const getInitials = (first, last) => `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase();
    const getRandomColor = (id) => {
        const colors = ['bg-indigo-500', 'bg-rose-500', 'bg-emerald-500', 'bg-amber-500', 'bg-cyan-500', 'bg-purple-500'];
        return colors[id % colors.length];
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    if (!teacher || !teacher.professional.is_class_teacher) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8"
            >
                <div className="bg-slate-100 dark:bg-slate-800 p-8 rounded-full mb-6">
                    <Users size={64} className="text-slate-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">No Class Assigned</h2>
                <p className="text-slate-500 max-w-md mx-auto">
                    You are not currently assigned as a class teacher.
                    Please contact the school administrator to assign you a class.
                </p>
            </motion.div>
        );
    }

    return (
        <div className="space-y-6 pb-20 md:pb-10 px-4 md:px-0">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-4 md:mt-0">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        Class {teacher.professional.grade_assigned}
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-bold dark:bg-indigo-900/30 dark:text-indigo-400">
                            Term {teacher.professional?.current_term || 1} {new Date().getFullYear()}
                        </span>
                    </h1>
                    <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 mt-1">
                        Manage your students, track attendance, and view performance.
                    </p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                        <Download size={18} />
                        <span className="text-sm font-medium">Export</span>
                    </button>
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all transform hover:scale-[1.02]">
                        <MoreVertical size={18} />
                        <span className="text-sm font-medium">Actions</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards - 2x2 Grid on Mobile */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                <StatCard
                    title="Total Students"
                    value={totalStudents}
                    icon={GraduationCap}
                    color="from-indigo-500 to-purple-500"
                    trend="+2 new"
                />
                <StatCard
                    title="Boys"
                    value={boysCount}
                    icon={UserCheck}
                    color="from-blue-500 to-cyan-500"
                    subtitle={`${((boysCount / totalStudents || 0) * 100).toFixed(0)}% of class`}
                />
                <StatCard
                    title="Girls"
                    value={girlsCount}
                    icon={Users}
                    color="from-pink-500 to-rose-500"
                    subtitle={`${((girlsCount / totalStudents || 0) * 100).toFixed(0)}% of class`}
                />
                <StatCard
                    title="Active Status"
                    value={`${((activeCount / totalStudents || 0) * 100).toFixed(0)}%`}
                    icon={TrendingUp}
                    color="from-emerald-500 to-teal-500"
                    subtitle="Attendance"
                />
            </div>

            {/* Main Content Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                {/* Filters Bar */}
                <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-3 md:gap-4">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search students..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all dark:text-white"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative w-full sm:w-auto">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full sm:w-auto appearance-none pl-9 pr-8 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                            >
                                <option value="ALL">All Status</option>
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                            </select>
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        </div>
                    </div>
                </div>

                {/* Table / Grid View */}
                {/* Grid View of Student Tiles - 2 Columns on Mobile */}
                <div className="p-4 md:p-6">
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                        {loadingStudents ? (
                            [...Array(8)].map((_, i) => (
                                <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-4 md:p-6 shadow-sm border border-slate-100 dark:border-slate-700 animate-pulse">
                                    <div className="h-16 w-16 md:h-20 md:w-20 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-4"></div>
                                    <div className="h-3 md:h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mx-auto mb-2"></div>
                                    <div className="h-2 md:h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mx-auto"></div>
                                </div>
                            ))
                        ) : filteredStudents.length > 0 ? (
                            filteredStudents.map((student) => (
                                <motion.div
                                    key={student.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    whileHover={{ y: -5 }}
                                    className="group bg-white dark:bg-slate-800 rounded-2xl p-4 md:p-6 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:shadow-indigo-500/10 transition-all cursor-pointer relative overflow-hidden"
                                    onClick={() => navigate(`/teacher/${id}/student/${student.id}`)}
                                >
                                    <div className="absolute top-0 left-0 w-full h-20 md:h-24 bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 z-0"></div>

                                    <div className="relative z-10 flex flex-col items-center">
                                        <div className="relative mb-3 md:mb-4">
                                            <div className="h-20 w-20 md:h-24 md:w-24 rounded-full border-4 border-white dark:border-slate-800 shadow-md overflow-hidden bg-white dark:bg-slate-700 flex items-center justify-center">
                                                {student.photo ? (
                                                    <img
                                                        src={student.photo}
                                                        alt={student.full_name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className={`w-full h-full flex items-center justify-center text-white text-xl md:text-2xl font-bold ${getRandomColor(student.id)}`}>
                                                        {getInitials(student.first_name, student.last_name)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className={`absolute bottom-1 right-1 w-4 h-4 md:w-5 md:h-5 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center ${student.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400'
                                                }`}>
                                                {student.status === 'ACTIVE' && <div className="w-1 md:w-1.5 h-1 md:h-1.5 bg-white rounded-full"></div>}
                                            </div>
                                        </div>

                                        <h3 className="text-sm md:text-lg font-bold text-slate-900 dark:text-white text-center mb-1 line-clamp-1 w-full px-1">
                                            {student.full_name}
                                        </h3>

                                        <div className="flex flex-wrap justify-center items-center gap-1.5 md:gap-2 mb-3 md:mb-4">
                                            <span className="text-[10px] md:text-xs font-mono text-slate-500 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                                                {student.admission_number}
                                            </span>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${student.gender === 'Female' || student.gender === 'F'
                                                ? 'bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400'
                                                : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                                }`}>
                                                {student.gender === 'Female' || student.gender === 'F' ? 'Girl' : 'Boy'}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 w-full gap-2 mt-auto">
                                            <button className="flex items-center justify-center gap-1 md:gap-2 py-1.5 md:py-2 px-2 md:px-3 rounded-lg md:rounded-xl bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-[10px] md:text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                                <TrendingUp size={12} className="md:w-3.5 md:h-3.5" />
                                                Results
                                            </button>
                                            <button className="flex items-center justify-center gap-1 md:gap-2 py-1.5 md:py-2 px-2 md:px-3 rounded-lg md:rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[10px] md:text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors">
                                                <Users size={12} className="md:w-3.5 md:h-3.5" />
                                                Profile
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-full flex flex-col items-center justify-center py-10 md:py-20 text-slate-400">
                                <UserX size={48} md:size={64} className="mb-4 text-slate-300 dark:text-slate-600" />
                                <p className="text-base md:text-lg font-medium text-slate-900 dark:text-white">No students found</p>
                                <p className="text-xs md:text-sm">Try adjusting your search or filters</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Pagination (Visual Only) */}
                {filteredStudents.length > 0 && (
                    <div className="flex justify-center my-6 md:mt-8">
                        <nav className="flex items-center gap-2">
                            <button className="h-8 w-8 md:h-10 md:w-10 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50" disabled>
                                &lt;
                            </button>
                            <button className="h-8 w-8 md:h-10 md:w-10 flex items-center justify-center rounded-lg bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/20 text-sm">
                                1
                            </button>
                            <button className="h-8 w-8 md:h-10 md:w-10 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50" disabled>
                                &gt;
                            </button>
                        </nav>
                    </div>
                )}
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon: Icon, color, subtitle, trend }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden"
    >
        <div className={`absolute top-0 right-0 p-4 opacity-10 bg-gradient-to-br ${color} rounded-bl-3xl`}>
            <Icon size={40} />
        </div>
        <div className="relative z-10">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-lg mb-4`}>
                <Icon size={24} />
            </div>
            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</h3>
            <div className="flex items-baseline gap-2 mt-1">
                <h4 className="text-2xl font-bold text-slate-900 dark:text-white">{value}</h4>
                {trend && <span className="text-xs text-emerald-500 font-bold bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded">{trend}</span>}
            </div>
            {subtitle && <p className="text-xs text-slate-400 mt-2">{subtitle}</p>}
        </div>
    </motion.div>
);

export default TeacherClasses;
