import React, { useState, useEffect } from 'react';
import {
    Calendar, Clock, User, BookOpen, Filter, Download, Plus, X, Check, AlertCircle
} from 'lucide-react';
import Button from '../components/ui/Button';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import SearchableSelect from '../components/ui/SearchableSelect';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
const TIME_SLOTS = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00'
];

const Schedule = () => {
    const [scheduleData, setScheduleData] = useState([]);
    const [grades, setGrades] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState(null);

    const [filters, setFilters] = useState({
        grade: '',
        teacher: ''
    });

    const [formData, setFormData] = useState({
        grade: '',
        teacher: '',
        subject: '',
        day: 'MONDAY',
        start_time: '08:00',
        end_time: '09:00'
    });

    const fetchSchedule = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/schedule/', { params: filters });
            setScheduleData(response.data.schedule || []);
        } catch (error) {
            console.error('Error fetching schedule:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOptions = async () => {
        try {
            const [gradesRes, subjectsRes, teachersRes] = await Promise.all([
                axios.get('/api/grades/'),
                axios.get('/api/subjects/'),
                axios.get('/api/teachers/?per_page=100') // Get all teachers
            ]);
            setGrades(gradesRes.data.grades || []);
            setSubjects(subjectsRes.data.subjects || []);
            setTeachers(teachersRes.data.teachers || []);
        } catch (error) {
            console.error("Error fetching options:", error);
        }
    };

    useEffect(() => {
        fetchOptions();
    }, []);

    useEffect(() => {
        fetchSchedule();
    }, [filters]);

    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        setError(null);
        try {
            await axios.post('/api/schedule/', formData);
            setShowModal(false);
            fetchSchedule();
            // Reset essential form data
            setFormData(prev => ({ ...prev, start_time: '08:00', end_time: '09:00' }));
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create session');
        } finally {
            setSubmitLoading(false);
        }
    };

    // Group schedule by day
    const scheduleByDay = DAYS.reduce((acc, day) => {
        acc[day] = scheduleData.filter(s => s.day === day);
        return acc;
    }, {});

    const getSessionsForTimeSlot = (day, timeSlot) => {
        return scheduleByDay[day]?.filter(session => {
            // Simple check: session starts at this slot OR overlaps significantly
            // For simplicity in this grid, we primarily show ones starting here
            // But ideally we'd calculate span. We'll stick to start time match for the visual grid.
            return session.start_time.startsWith(timeSlot.split(':')[0]);
        }) || [];
    };

    if (loading && !grades.length) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-full mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Class Schedule</h1>
                    <p className="text-slate-500 dark:text-slate-400">Weekly timetable and lesson planning</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="secondary" className="hidden md:flex">
                        <Download size={18} className="mr-2" />
                        Export PDF
                    </Button>
                    <Button onClick={() => setShowModal(true)}>
                        <Plus size={18} className="mr-2" />
                        Add Session
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <Filter size={20} className="text-slate-400 hidden md:block" />
                    <div className="w-full md:w-64">
                        <SearchableSelect
                            options={grades.map(g => ({ value: g.id, label: g.name }))}
                            value={filters.grade}
                            onChange={(val) => setFilters(prev => ({ ...prev, grade: val }))}
                            placeholder="All Grades/Classes"
                        />
                    </div>

                    <div className="w-full md:w-64">
                        <SearchableSelect
                            options={teachers.map(t => ({ value: t.id, label: t.full_name }))}
                            value={filters.teacher}
                            onChange={(val) => setFilters(prev => ({ ...prev, teacher: val }))}
                            placeholder="All Teachers"
                        />
                    </div>

                    <Button
                        variant="ghost"
                        onClick={() => setFilters({ grade: '', teacher: '' })}
                        className="ml-auto text-slate-500"
                    >
                        Clear Filters
                    </Button>
                </div>
            </div>

            {/* Timetable Grid */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <div className="min-w-[1000px]">
                        {/* Header Row */}
                        <div className="grid grid-cols-6 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
                            <div className="p-4 font-semibold text-slate-600 dark:text-slate-400 text-sm border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                                Time
                            </div>
                            {DAYS.map(day => (
                                <div key={day} className="p-4 text-center font-bold text-slate-800 dark:text-slate-200 text-sm border-r border-slate-200 dark:border-slate-700 last:border-r-0">
                                    {day.charAt(0) + day.slice(1).toLowerCase()}
                                </div>
                            ))}
                        </div>

                        {/* Time Slots */}
                        {TIME_SLOTS.map((timeSlot, idx) => (
                            <div key={timeSlot} className={`grid grid-cols-6 border-b border-slate-100 dark:border-slate-800 ${idx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/30 dark:bg-slate-800/20'}`}>
                                <div className="p-4 border-r border-slate-200 dark:border-slate-700 flex items-start justify-center pt-6">
                                    <div className="flex flex-col items-center gap-1 text-slate-500 dark:text-slate-400">
                                        <span className="text-sm font-bold">{timeSlot}</span>
                                        <span className="text-[10px] uppercase text-slate-400">00</span>
                                    </div>
                                </div>
                                {DAYS.map(day => {
                                    const sessions = getSessionsForTimeSlot(day, timeSlot);
                                    return (
                                        <div key={`${day}-${timeSlot}`} className="p-1 border-r border-slate-200 dark:border-slate-700 last:border-r-0 min-h-[100px] relative">
                                            {sessions.map(session => (
                                                <motion.div
                                                    key={session.id}
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="bg-white dark:bg-slate-800/50 border-l-4 border-l-secondary-500 shadow-sm rounded-r-lg p-2 mb-2 hover:shadow-md transition-all cursor-pointer group border border-slate-100 dark:border-slate-700"
                                                >
                                                    <p className="font-bold text-xs text-slate-800 dark:text-white truncate">
                                                        {session.subject}
                                                    </p>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <span className="text-[10px] font-medium bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
                                                            {session.grade}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400">
                                                            {session.start_time}-{session.end_time}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-50 dark:border-slate-700/50">
                                                        {session.avatar ? (
                                                            <img src={session.avatar} className="w-4 h-4 rounded-full object-cover" alt="" />
                                                        ) : (
                                                            <div className="w-4 h-4 rounded-full bg-secondary-100 text-secondary-600 flex items-center justify-center text-[8px] font-bold">
                                                                {session.teacher.charAt(0)}
                                                            </div>
                                                        )}
                                                        <span className="text-[10px] text-slate-500 truncate max-w-[80px]">
                                                            {session.teacher}
                                                        </span>
                                                    </div>
                                                </motion.div>
                                            ))}
                                            {sessions.length === 0 && (
                                                <div className="w-full h-full min-h-[80px] hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors flex items-center justify-center opacity-0 hover:opacity-100 group">
                                                    <Plus className="text-slate-300" size={20} />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Create Schedule Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Planning Session</h3>
                                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleCreate} className="p-6 space-y-4">
                                {error && (
                                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
                                        <AlertCircle size={16} />
                                        {error}
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Target Class *</label>
                                        <SearchableSelect
                                            options={grades.map(g => ({ value: g.id, label: g.name }))}
                                            value={formData.grade}
                                            onChange={val => {
                                                const selectedGrade = grades.find(g => g.id.toString() === val.toString());
                                                setFormData(prev => ({
                                                    ...prev,
                                                    grade: val,
                                                    teacher: selectedGrade?.class_teacher_id || prev.teacher
                                                }));
                                            }}
                                            placeholder="Select Class"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Subject *</label>
                                        <SearchableSelect
                                            options={subjects.map(s => ({ value: s.id, label: `${s.name} (${s.code})` }))}
                                            value={formData.subject}
                                            onChange={val => setFormData({ ...formData, subject: val })}
                                            placeholder="Select Subject"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Assigned Teacher *</label>
                                    <SearchableSelect
                                        options={teachers.map(t => ({ value: t.id, label: t.full_name }))}
                                        value={formData.teacher}
                                        onChange={val => setFormData({ ...formData, teacher: val })}
                                        placeholder="Select Teacher"
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Day</label>
                                        <select
                                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white outline-none"
                                            value={formData.day}
                                            onChange={e => setFormData({ ...formData, day: e.target.value })}
                                        >
                                            {DAYS.map(day => (
                                                <option key={day} value={day}>{day.charAt(0) + day.slice(1).toLowerCase()}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Start Time</label>
                                        <input
                                            type="time"
                                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white outline-none"
                                            required
                                            value={formData.start_time}
                                            onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">End Time</label>
                                        <input
                                            type="time"
                                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white outline-none"
                                            required
                                            value={formData.end_time}
                                            onChange={e => setFormData({ ...formData, end_time: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end gap-3">
                                    <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                                    <Button type="submit" isLoading={submitLoading}>
                                        <Check size={18} className="mr-2" /> Save Session
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Schedule;
