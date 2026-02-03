import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus, Search, Filter, MoreVertical, Edit, Trash2,
    ChevronLeft, ChevronRight, UserPlus, Download, Upload,
    LayoutGrid, List, GraduationCap, Users, Wallet
} from 'lucide-react';
import Button from '../components/ui/Button';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import BulkStudentImportModal from '../components/modals/BulkStudentImportModal';

const Badge = ({ children, variant = 'gray', className = '' }) => {
    const variants = {
        gray: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
        green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        purple: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
    };

    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};

const StudentCard = ({ student, onClick }) => (
    <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        whileHover={{ y: -5 }}
        onClick={onClick}
        className="group relative bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-6 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:border-primary-200 dark:hover:border-primary-800 transition-all duration-300 cursor-pointer overflow-hidden"
    >
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-primary-50 dark:bg-primary-900/10 rounded-full blur-3xl -mr-12 -mt-12 md:-mr-16 md:-mt-16 transition-opacity group-hover:opacity-75"></div>

        <div className="relative z-10 flex flex-col items-center">
            {/* Avatar & Status */}
            <div className="relative mb-3 md:mb-4">
                <div className="h-16 w-16 md:h-24 md:w-24 rounded-xl md:rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/40 dark:to-slate-800 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xl md:text-3xl font-bold shadow-inner overflow-hidden">
                    {student.photo ? (
                        <img src={student.photo} alt={student.full_name} className="w-full h-full object-cover" />
                    ) : (
                        student.full_name.charAt(0)
                    )}
                </div>
                <div className={`absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 p-1 md:p-1.5 rounded-full bg-white dark:bg-slate-900 border-2 border-white dark:border-slate-900 shadow-sm ${student.balance > 0 ? 'text-red-500' : 'text-green-500'
                    }`}>
                    {student.balance > 0 ? <Wallet size={12} className="md:w-[14px] md:h-[14px]" fill="currentColor" /> : <GraduationCap size={12} className="md:w-[14px] md:h-[14px]" fill="currentColor" />}
                </div>
            </div>

            {/* Info */}
            <h3 className="text-sm md:text-lg font-bold text-slate-900 dark:text-white text-center mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1">
                {student.full_name}
            </h3>
            <p className="text-[10px] md:text-xs font-mono text-slate-500 dark:text-slate-400 mb-3 md:mb-4 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 md:px-2 md:py-1 rounded">
                #{student.admission_number}
            </p>

            {/* Stats Grid - Hidden on smallest mobile tiles for better fit, show on md */}
            <div className="hidden md:grid grid-cols-2 gap-3 w-full mb-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Grade</p>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">{student.grade}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Gender</p>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">{student.gender === 'M' ? 'M' : 'F'}</p>
                </div>
            </div>

            {/* Simple Stats for Mobile */}
            <div className="flex md:hidden items-center justify-center gap-2 mb-3 text-[10px] font-bold text-slate-500">
                <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">G: {student.grade}</span>
                <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{student.gender === 'M' ? 'Male' : 'Female'}</span>
            </div>

            {/* Balance Badge */}
            <div className={`w-full py-1.5 md:py-2 px-2 md:px-3 rounded-lg md:rounded-xl flex items-center justify-between text-[10px] md:text-xs font-medium ${student.balance > 0
                ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'
                : 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                }`}>
                <span className="hidden xs:inline">Balance</span>
                <span className="font-bold">
                    {student.balance > 0 ? `-$${student.balance.toLocaleString()}` : 'Paid'}
                </span>
            </div>
            <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        // Assume Students component passes a delete handler or we call it directly if available
                        // Since StudentCard is defined in the same file as Students, we can pass it down.
                        // Wait, StudentCard doesn't have access to handleDelete unless passed as prop.
                        if (onDelete) onDelete(e, student.id);
                    }}
                    className="p-1.5 bg-white/90 dark:bg-slate-800/90 rounded-lg text-slate-400 hover:text-red-600 shadow-sm border border-slate-100 dark:border-slate-700"
                >
                    <Trash2 size={14} />
                </button>
            </div>
        </div>
    </motion.div>
);

const Students = () => {
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState('grid'); // 'list' or 'grid'
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        grade: '',
        status: ''
    });
    const [pagination, setPagination] = useState({
        page: 1,
        total: 0,
        pages: 1
    });

    const [stats, setStats] = useState({ fully_paid: '-', male_count: 0, female_count: 0 });
    const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);

    const fetchStudents = async () => {
        if (students.length === 0) setLoading(true);
        try {
            const response = await axios.get('/api/students/', {
                params: {
                    ...filters,
                    page: pagination.page
                }
            });
            setStudents(response.data.students);
            if (response.data.stats) {
                setStats(response.data.stats);
            }
            setPagination(prev => ({
                ...prev,
                total: response.data.total,
                pages: response.data.pages,
                page: response.data.current_page
            }));
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e, id) => {
        if (e) e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
            try {
                await axios.delete(`/api/students/${id}/`);
                setStudents(prev => prev.filter(student => student.id !== id));
                setPagination(prev => ({ ...prev, total: prev.total - 1 }));
            } catch (error) {
                console.error('Error deleting student:', error);
                alert('Failed to delete student. Please try again.');
            }
        }
    };



    /*
    const handleDeleteAll = async () => {
        const confirm1 = window.confirm('CRITICAL WARNING: You are about to delete ALL students in the system. This will also delete their associated user accounts and cannot be undone. Are you absolutely sure?');
        if (confirm1) {
            const confirm2 = window.confirm('Final Confirmation: Type "DELETE" to confirm the removal of all student records.');
            if (confirm2) {
                try {
                    setLoading(true);
                    await axios.delete('/api/students/bulk-delete/');
                    fetchStudents();
                } catch (error) {
                    alert(error.response?.data?.error || 'Failed to delete all students');
                } finally {
                    setLoading(false);
                }
            }
        }
    };
    */

    const [grades, setGrades] = useState([]);

    useEffect(() => {
        const fetchGrades = async () => {
            try {
                const response = await axios.get('/api/grades/');
                setGrades(response.data.grades);
            } catch (error) {
                console.error('Error fetching grades:', error);
            }
        };
        fetchGrades();
    }, []);

    // ... (keep existing useEffect for fetching students)

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchStudents();
        }, 300);
        return () => clearTimeout(timer);
    }, [filters, pagination.page]);


    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-center md:justify-end gap-3">

                {/* Hidden as per request
                <Button variant="outline" onClick={handleDeleteAll} className="w-full md:w-auto text-red-600 border-red-200 hover:bg-red-50">
                    <Trash2 size={18} className="mr-2" />
                    Delete All Students
                </Button> 
                */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Button variant="outline" onClick={() => setIsBulkImportOpen(true)} className="w-full md:w-auto">
                        <Upload size={18} className="mr-2" />
                        Bulk Admission
                    </Button>
                    <Button onClick={() => navigate('/students/create')} className="w-full md:w-auto shadow-lg shadow-primary-500/20">
                        <UserPlus size={18} className="mr-2" />
                        New Admission
                    </Button>
                </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Total Students Card */}
                <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl p-5 text-white shadow-lg shadow-blue-500/20 group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
                        <Users size={80} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-white/20 backdrop-blur-md rounded-lg shadow-inner">
                                <Users size={18} className="text-white" />
                            </div>
                            <p className="font-medium text-blue-100 text-sm">Total Students</p>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <h2 className="text-3xl font-black tracking-tight">{pagination.total}</h2>
                            <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full text-blue-50 backdrop-blur-sm">Active</span>
                        </div>
                    </div>
                </div>

                {/* Fully Paid Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm relative group overflow-hidden">
                    <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                        <Wallet size={80} className="text-emerald-500" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600 dark:text-emerald-400">
                                <Wallet size={18} />
                            </div>
                            <p className="font-medium text-slate-500 dark:text-slate-400 text-sm">Fully Paid</p>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{stats.fully_paid}</h2>
                            <span className="text-xs font-semibold text-slate-400">students</span>
                        </div>
                    </div>
                </div>

                {/* Gender Distribution Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400">
                                <Users size={18} />
                            </div>
                            <p className="font-medium text-slate-500 dark:text-slate-400 text-sm">Gender Distribution</p>
                        </div>
                        <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-700">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                {((stats.male_count / (stats.male_count + stats.female_count || 1)) * 100).toFixed(0)}%
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">Male</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(stats.male_count / (stats.male_count + stats.female_count || 1)) * 100}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-blue-500"
                            />
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(stats.female_count / (stats.male_count + stats.female_count || 1)) * 100}%` }}
                                transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
                                className="h-full bg-rose-400"
                            />
                        </div>

                        <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
                                <span className="font-bold text-slate-600 dark:text-slate-300">{stats.male_count} Boys</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-600 dark:text-slate-300">{stats.female_count} Girls</span>
                                <div className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.6)]"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls Bar */}
            <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between sticky top-4 z-20">
                {/* Search & Filters */}
                <div className="flex flex-1 gap-2 w-full md:w-auto p-2">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search students..."
                            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary-500 transition-all text-sm text-slate-900 dark:text-white placeholder-slate-400"
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        />
                    </div>
                    <select
                        className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary-500 text-sm text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        onChange={(e) => setFilters(prev => ({ ...prev, grade: e.target.value }))}
                    >
                        <option value="">All Grades</option>
                        {(grades || []).map(grade => (
                            <option key={grade.id} value={grade.id}>{grade.name}</option>
                        ))}
                    </select>
                </div>

                {/* View Toggle & Export */}
                <div className="flex items-center gap-2 p-2 border-l border-slate-100 dark:border-slate-800">
                    <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg flex items-center">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'list'
                                ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm'
                                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                        >
                            <List size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'grid'
                                ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm'
                                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                        >
                            <LayoutGrid size={18} />
                        </button>
                    </div>
                    <Button variant="ghost" size="sm" className="hidden md:flex">
                        <Download size={18} className="mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Content Area */}
            <div className="min-h-[400px]">
                {(students || []).length > 0 ? (
                    <AnimatePresence mode="wait">
                        {viewMode === 'grid' || window.innerWidth < 768 ? (
                            <motion.div
                                key="grid"
                                variants={containerVariants}
                                initial="hidden"
                                animate="show"
                                className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
                            >
                                {students.map((student) => (
                                    <StudentCard
                                        key={student.id}
                                        student={student}
                                        onClick={() => navigate(`/students/${student.id}`)}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="list"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden"
                            >
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-slate-50/50 dark:bg-slate-800/50">
                                            <tr>
                                                <th className="px-6 py-5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Student</th>
                                                <th className="px-6 py-5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Grade</th>
                                                <th className="px-6 py-5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Branch</th>
                                                <th className="px-6 py-5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Gender</th>
                                                <th className="px-6 py-5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Financial Status</th>
                                                <th className="px-6 py-5 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-5 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {students.map((student) => (
                                                <tr
                                                    key={student.id}
                                                    className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                                                    onClick={() => navigate(`/students/${student.id}`)}
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/30 dark:to-slate-800 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-lg shadow-sm overflow-hidden">
                                                                {student.photo ? (
                                                                    <img src={student.photo} alt={student.full_name} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    student.full_name.charAt(0)
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-slate-900 dark:text-white">{student.full_name}</p>
                                                                <p className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 p-0.5 px-1.5 rounded inline-block mt-1">
                                                                    #{student.admission_number}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                                                        Grade {student.grade}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                                                        {student.branch}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                                                        {student.gender === 'M' ? 'Male' : 'Female'}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {student.balance > 0 ? (
                                                            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                                                <span className="font-bold">-${student.balance.toLocaleString()}</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                                                <span className="font-bold">Paid</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Badge variant="green">Active</Badge>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-primary-600 transition-colors">
                                                                <Edit size={16} />
                                                            </button>
                                                            <button
                                                                onClick={(e) => handleDelete(e, student.id)}
                                                                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                ) : (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 border-dashed">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="text-slate-300 dark:text-slate-600" size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No students found</h3>
                        <p className="text-slate-500 dark:text-slate-400">Try adjusting your filters or add a new student.</p>
                        <Button
                            variant="primary"
                            className="mt-6"
                            onClick={() => navigate('/students/create')}
                        >
                            <UserPlus size={18} className="mr-2" />
                            New Admission
                        </Button>
                    </div>
                )}
            </div>

            {/* Pagination Floating Bar */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-slate-900/90 backdrop-blur shadow-xl border border-slate-100 dark:border-slate-800 rounded-full py-2 px-6 flex items-center gap-4 z-30 transform hover:scale-105 transition-transform">
                <button
                    disabled={pagination.page <= 1}
                    onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 disabled:opacity-50 transition-colors"
                >
                    <ChevronLeft size={20} />
                </button>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 min-w-[100px] text-center">
                    Page {pagination.page} of {pagination.pages}
                </span>
                <button
                    disabled={pagination.page >= pagination.pages}
                    onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 disabled:opacity-50 transition-colors"
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            <BulkStudentImportModal
                isOpen={isBulkImportOpen}
                onClose={() => setIsBulkImportOpen(false)}
                onRefresh={fetchStudents}
            />
        </div>
    );
};

export default Students;
