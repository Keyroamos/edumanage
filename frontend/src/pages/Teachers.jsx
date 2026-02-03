import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus, Search, Filter, MoreVertical, Edit, Trash2,
    ChevronLeft, ChevronRight, UserPlus, Download, Mail, Phone,
    GraduationCap, BookOpen, Clock, AlertCircle, X, Check, Eye
} from 'lucide-react';
import Button from '../components/ui/Button';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const TeacherCard = ({ teacher, onClick, onDelete }) => (
    <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={{ y: -5 }}
        className="bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-6 shadow-sm border border-slate-100 dark:border-slate-800 cursor-pointer group hover:shadow-xl transition-all relative overflow-hidden"
        onClick={onClick}
    >
        {/* Delete button */}
        <div className="absolute top-4 left-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    if (onDelete) onDelete(e, teacher.id, teacher.full_name);
                }}
                className="p-1.5 bg-white/90 dark:bg-slate-800/90 rounded-lg text-slate-400 hover:text-red-500 shadow-sm border border-slate-100 dark:border-slate-800"
            >
                <Trash2 size={14} />
            </button>
        </div>

        {/* Status indicator pill */}
        <div className="absolute top-4 right-4 z-10">
            <span className={`flex h-2.5 w-2.5 rounded-full ring-4 ring-white dark:ring-slate-900 ${teacher.status === 'ACTIVE' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' :
                teacher.status === 'ON_LEAVE' ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'
                }`}></span>
        </div>

        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-4">
            <div className="relative">
                <div className="h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden shadow-inner group-hover:scale-105 transition-transform duration-300">
                    {teacher.avatar ? (
                        <img src={teacher.avatar} alt={teacher.full_name} className="h-full w-full object-cover" />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-indigo-500 via-indigo-600 to-primary-600 text-white font-bold text-2xl">
                            {teacher.full_name.charAt(0)}
                        </div>
                    )}
                </div>
            </div>

            <div className="min-w-0 w-full">
                <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white truncate group-hover:text-primary-600 transition-colors">
                    {teacher.full_name}
                </h3>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-1">
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-slate-200 dark:border-slate-700/50">
                        {teacher.tsc_number || 'N/A'}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-tighter">
                        {teacher.role || 'Teacher'}
                    </span>
                </div>
            </div>
        </div>

        <div className="mt-6 space-y-4">
            <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/30">
                <BookOpen size={16} className="text-primary-500 shrink-0" />
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 truncate">
                    {teacher.subjects && teacher.subjects.length > 0 ? teacher.subjects[0] : 'No Subjects'}
                    {teacher.subjects && teacher.subjects.length > 1 && (
                        <span className="text-primary-500 ml-1">+{teacher.subjects.length - 1}</span>
                    )}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <a
                    href={`mailto:${teacher.email}`}
                    onClick={e => e.stopPropagation()}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 shadow-sm border border-slate-200 dark:border-slate-700/50 transition-all text-[11px] font-bold uppercase tracking-wider"
                >
                    <Mail size={14} /> Email
                </a>
                <a
                    href={`tel:${teacher.phone}`}
                    onClick={e => e.stopPropagation()}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 shadow-sm border border-slate-200 dark:border-slate-700/50 transition-all text-[11px] font-bold uppercase tracking-wider"
                >
                    <Phone size={14} /> Call
                </a>
            </div>
        </div>
    </motion.div>
);

const ViewModeToggle = ({ mode, setMode }) => (
    <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-xl flex items-center">
        <button
            onClick={() => setMode('grid')}
            className={`p-2 rounded-lg transition-all ${mode === 'grid' ? 'bg-white dark:bg-slate-800 text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
            <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
                <div className="bg-current rounded-[1px]"></div>
                <div className="bg-current rounded-[1px]"></div>
                <div className="bg-current rounded-[1px]"></div>
                <div className="bg-current rounded-[1px]"></div>
            </div>
        </button>
        <button
            onClick={() => setMode('list')}
            className={`p-2 rounded-lg transition-all ${mode === 'list' ? 'bg-white dark:bg-slate-800 text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
            <div className="flex flex-col gap-0.5 w-4 h-4">
                <div className="bg-current h-[2px] w-full rounded-[1px]"></div>
                <div className="bg-current h-[2px] w-full rounded-[1px]"></div>
                <div className="bg-current h-[2px] w-full rounded-[1px]"></div>
            </div>
        </button>
    </div>
);

const TeacherList = () => {
    const navigate = useNavigate();
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [filters, setFilters] = useState({
        search: '',
        status: ''
    });
    const [pagination, setPagination] = useState({
        page: 1,
        total: 0,
        pages: 1
    });

    const fetchTeachers = async () => {
        if (teachers.length === 0) setLoading(true);
        try {
            const response = await axios.get('/api/teachers/', {
                params: {
                    search: filters.search,
                    status: filters.status,
                    page: pagination.page,
                    per_page: viewMode === 'grid' ? 12 : 10
                }
            });
            setTeachers(response.data.teachers || []);
            setPagination(prev => ({
                ...prev,
                total: response.data.total || 0,
                pages: response.data.pages || 1,
                page: response.data.current_page || 1
            }));
        } catch (error) {
            console.error('Error fetching teachers:', error);
            // Set default values on error
            setTeachers([]);
            setPagination(prev => ({
                ...prev,
                total: 0,
                pages: 1,
                page: 1
            }));
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTeacher = async (e, id, name) => {
        if (e) e.stopPropagation();
        if (window.confirm(`Are you sure you want to delete Teacher ${name}? This will also remove their user account and cannot be undone.`)) {
            try {
                await axios.delete(`/api/teachers/${id}/`);
                setTeachers(prev => prev.filter(t => t.id !== id));
                setPagination(prev => ({ ...prev, total: prev.total - 1 }));
            } catch (error) {
                alert(error.response?.data?.error || "Failed to delete teacher");
            }
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchTeachers();
        }, 300);
        return () => clearTimeout(timer);
    }, [filters, pagination.page, viewMode]);

    // Stats calculation (Client side for demo)
    const stats = {
        total: pagination.total,
        active: Array.isArray(teachers) ? teachers.filter(t => t.status === 'ACTIVE').length : 0,
        onLeave: Array.isArray(teachers) ? teachers.filter(t => t.status === 'ON_LEAVE').length : 0
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-10">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 md:pb-0 border-b md:border-none border-slate-100 dark:border-slate-800 text-center md:text-left">
                <div className="space-y-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Staff & Faculty</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Coordinate and manage institutional educators and leadership.</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <Button variant="outline" size="md" className="flex-1 md:flex-none h-11 rounded-xl bg-white dark:bg-slate-900 shadow-sm" onClick={() => { }}>
                        <Download size={18} className="mr-2" /> <span className="sr-only sm:not-sr-only">Export</span>
                    </Button>
                    <Button size="md" onClick={() => navigate('/teachers/create')} className="flex-[2] md:flex-none h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/10 font-bold">
                        <Plus size={20} className="mr-2" /> Add Teacher
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
                <div className="bg-white dark:bg-slate-900/50 backdrop-blur-md p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-4">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                        <UserPlus size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total</p>
                        <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white leading-none">{stats.total}</h3>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900/50 backdrop-blur-md p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-4">
                    <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                        <Check size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Active</p>
                        <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white leading-none">{stats.active}</h3>
                    </div>
                </div>
                <div className="col-span-2 md:col-span-1 bg-white dark:bg-slate-900/50 backdrop-blur-md p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-4">
                    <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                        <Clock size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">On Leave</p>
                        <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white leading-none">{stats.onLeave}</h3>
                    </div>
                </div>
            </div>

            {/* Filters & Controls */}
            <div className="bg-white dark:bg-slate-900/80 backdrop-blur-xl p-3 md:p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg flex flex-col md:flex-row gap-3 md:gap-4 justify-between items-center sticky top-4 z-20">
                <div className="flex flex-col sm:flex-row flex-1 gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Find staff members..."
                            className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-500/30 focus:bg-white dark:focus:bg-slate-900 transition-all text-sm font-semibold placeholder:text-slate-400 dark:text-white"
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        />
                    </div>
                    <select
                        className="px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-500/30 text-sm font-bold text-slate-700 dark:text-slate-200 cursor-pointer appearance-none uppercase tracking-widest"
                        value={filters.status}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="on_leave">On Leave</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        {teachers.length} Professionals
                    </span>
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700/50 hidden md:block"></div>
                        <ViewModeToggle mode={viewMode} setMode={setViewMode} />
                    </div>
                </div>
            </div>

            {/* Content Area */}
            {teachers.length > 0 ? (
                <>
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
                            <AnimatePresence mode="popLayout">
                                {teachers.map((teacher, index) => (
                                    <TeacherCard
                                        key={teacher.id}
                                        teacher={teacher}
                                        onClick={() => navigate(`/teachers/${teacher.id}`)}
                                        onDelete={handleDeleteTeacher}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-slate-50/50 dark:bg-slate-800/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Teacher</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Role & Subjects</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Contact</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {teachers.map((teacher) => (
                                        <tr
                                            key={teacher.id}
                                            onClick={() => navigate(`/teachers/${teacher.id}`)}
                                            className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                                        {teacher.avatar ? (
                                                            <img src={teacher.avatar} alt="" className="h-full w-full object-cover" />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center bg-indigo-100 text-indigo-600 font-bold text-sm">
                                                                {teacher.full_name.charAt(0)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 dark:text-white text-sm">{teacher.full_name}</p>
                                                        <p className="text-xs text-slate-500">TSC: {teacher.tsc_number}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 hidden sm:table-cell">
                                                <p className="text-sm text-slate-900 dark:text-white font-medium">{teacher.role || 'Teacher'}</p>
                                                <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[200px]">
                                                    {teacher.subjects?.join(', ')}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 hidden md:table-cell">
                                                <div className="text-sm text-slate-600 dark:text-slate-400 space-y-0.5">
                                                    <div className="flex items-center gap-2"><Mail size={12} /> {teacher.email}</div>
                                                    <div className="flex items-center gap-2"><Phone size={12} /> {teacher.phone}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${teacher.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                                                    teacher.status === 'ON_LEAVE' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {teacher.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                                                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-primary-600">
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleDeleteTeacher(e, teacher.id, teacher.full_name)}
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
                    )}

                    {/* Pagination */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-slate-200 dark:border-slate-800">
                        <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Page {pagination.page} <span className="text-slate-200 dark:text-slate-700 mx-2">/</span> {pagination.pages}
                        </p>
                        <div className="flex gap-3 w-full sm:w-auto">
                            <Button
                                variant="secondary"
                                size="sm"
                                disabled={pagination.page <= 1}
                                onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                                className="flex-1 sm:flex-none h-10 px-6 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-bold uppercase tracking-widest"
                            >
                                <ChevronLeft size={16} className="mr-1" /> Prev
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                disabled={pagination.page >= pagination.pages}
                                onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                                className="flex-1 sm:flex-none h-10 px-6 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-bold uppercase tracking-widest"
                            >
                                Next <ChevronRight size={16} className="ml-1" />
                            </Button>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center py-24 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
                    <div className="h-20 w-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm mb-6">
                        <Search size={40} className="text-slate-300 dark:text-slate-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Teachers Found</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-md">
                        We couldn't find any teachers matching your search. Try adjusting filters or add a new teacher.
                    </p>
                    <Button onClick={() => setFilters({ search: '', status: '' })} className="mt-6" variant="secondary">
                        Clear Filters
                    </Button>
                </div>
            )}
        </div>
    );
};

export default TeacherList;
