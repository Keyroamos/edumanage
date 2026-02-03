import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Calendar, Clock, User, BookOpen, Plus, X, Check, AlertCircle, Trash2, ChevronLeft, LayoutGrid
} from 'lucide-react';
import Button from '../components/ui/Button';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
const TIME_SLOTS = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00'
];

const TeacherScheduleManage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [teacher, setTeacher] = useState(null);
    const [scheduleData, setScheduleData] = useState([]);
    const [grades, setGrades] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeDay, setActiveDay] = useState('MONDAY');

    const [formData, setFormData] = useState({
        grade: '',
        subject: '',
        day: 'MONDAY',
        start_time: '08:00',
        end_time: '09:00'
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [teacherRes, scheduleRes, gradesRes, subjectsRes] = await Promise.all([
                axios.get(`/api/teachers/${id}/`),
                axios.get(`/api/schedule/?teacher=${id}`),
                axios.get('/api/grades/'),
                axios.get('/api/subjects/')
            ]);
            setTeacher(teacherRes.data.teacher);
            setScheduleData(scheduleRes.data.schedule || []);
            setGrades(gradesRes.data.grades || []);
            setSubjects(subjectsRes.data.subjects || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    useEffect(() => {
        if (teacher && grades.length > 0) {
            // Find grade ID that matches teacher's assigned grade
            const assignedGrade = grades.find(g =>
                g.id === teacher.professional?.grade_id ||
                g.name === teacher.professional?.grade_assigned
            );

            if (assignedGrade && !formData.grade) {
                setFormData(prev => ({ ...prev, grade: assignedGrade.id }));
            }
        }

        if (teacher && subjects.length > 0 && !formData.subject) {
            // If teacher only has one subject assigned, pre-fill it
            if (teacher.professional?.subjects?.length === 1) {
                const subjectName = teacher.professional.subjects[0];
                const matchedSubject = subjects.find(s =>
                    s.name === subjectName || s.code === subjectName
                );
                if (matchedSubject) {
                    setFormData(prev => ({ ...prev, subject: matchedSubject.id }));
                }
            }
        }
    }, [teacher, grades, subjects]);

    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        setError(null);
        try {
            await axios.post('/api/schedule/', { ...formData, teacher: id });
            setShowModal(false);
            fetchData();
            setFormData(prev => ({ ...prev, start_time: '08:00', end_time: '09:00' }));
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create session');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDelete = async (pk) => {
        if (!window.confirm('Are you sure you want to remove this session?')) return;
        try {
            await axios.delete(`/api/schedule/delete/${pk}/`);
            fetchData();
        } catch (err) {
            alert('Failed to delete session');
        }
    };

    // Group schedule by day
    const scheduleByDay = DAYS.reduce((acc, day) => {
        acc[day] = scheduleData.filter(s => s.day === day);
        return acc;
    }, {});

    const getSessionsForTimeSlot = (day, timeSlot) => {
        return scheduleByDay[day]?.filter(session => {
            return session.start_time.startsWith(timeSlot.split(':')[0]);
        }) || [];
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[600px]">
                <div className="relative">
                    <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-indigo-600 animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Calendar className="text-indigo-600 animate-pulse" size={32} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-10 max-w-full mx-auto space-y-10">
            {/* Navigation & Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <button
                        onClick={() => navigate(`/teachers/${id}`)}
                        className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors font-bold text-[10px] uppercase tracking-widest"
                    >
                        <ChevronLeft size={16} /> Back to Teacher Profile
                    </button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                            Manage Schedule
                        </h1>
                        <div className="flex items-center gap-2.5 mt-1.5">
                            <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Timetable Configurator for {teacher?.personal?.full_name}</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowModal(true)}
                        className="h-12 px-8 bg-indigo-600 hover:bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg flex items-center gap-3 transition-all active:scale-95"
                    >
                        <Plus size={18} /> Add Session
                    </button>
                </div>
            </div>

            {/* Mobile Day Selector */}
            <div className="md:hidden flex overflow-x-auto gap-2 pb-2 scrollbar-none">
                {DAYS.map(day => (
                    <button
                        key={day}
                        onClick={() => setActiveDay(day)}
                        className={`px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all border ${activeDay === day
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                            : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800'
                            }`}
                    >
                        {day}
                    </button>
                ))}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto md:overflow-visible">
                    <div className="min-w-[320px] md:min-w-full">
                        {/* Header Row */}
                        <div className="grid grid-cols-2 md:grid-cols-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
                            <div className="p-5 md:p-8 font-bold text-slate-400 text-[10px] uppercase tracking-widest border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                                Timeline
                            </div>
                            {/* Desktop Headers */}
                            {DAYS.map(day => (
                                <div key={day} className={`${activeDay === day ? 'flex' : 'hidden md:flex'} p-5 md:p-8 text-center items-center justify-center font-bold text-slate-900 dark:text-white text-xs uppercase tracking-widest border-r border-slate-200 dark:border-slate-700 last:border-r-0`}>
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Time Slots */}
                        {TIME_SLOTS.map((timeSlot, idx) => (
                            <div key={timeSlot} className={`grid grid-cols-2 md:grid-cols-6 border-b border-slate-100 dark:border-slate-800 ${idx % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/20 dark:bg-slate-800/10'}`}>
                                <div className="p-6 md:p-8 border-r border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-1 md:gap-2">
                                    <span className="text-base md:text-lg font-bold text-slate-900 dark:text-white">{timeSlot}</span>
                                    <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Start</span>
                                </div>
                                {DAYS.map(day => {
                                    const sessions = getSessionsForTimeSlot(day, timeSlot);
                                    return (
                                        <div key={`${day}-${timeSlot}`} className={`${activeDay === day ? 'block' : 'hidden md:block'} p-3 md:p-4 border-r border-slate-200 dark:border-slate-700 last:border-r-0 min-h-[140px] md:min-h-[160px] relative group`}>
                                            {sessions.map(session => (
                                                <motion.div
                                                    key={session.id}
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="bg-white dark:bg-slate-800 border-2 border-indigo-500/10 shadow-md rounded-xl p-4 md:p-5 h-full flex flex-col justify-between hover:shadow-lg hover:border-indigo-500/30 transition-all group/card relative overflow-hidden"
                                                >
                                                    <div className="absolute top-0 right-0 p-8 bg-indigo-500/5 rounded-full blur-2xl -mr-4 -mt-4"></div>
                                                    <div>
                                                        <div className="flex justify-between items-start mb-3 md:mb-4">
                                                            <div className="text-[9px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-1 rounded-lg uppercase tracking-widest">
                                                                {session.start_time}-{session.end_time}
                                                            </div>
                                                            <button
                                                                onClick={() => handleDelete(session.id)}
                                                                className="opacity-0 group-hover/card:opacity-100 p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                        <p className="font-bold text-sm text-slate-900 dark:text-white leading-tight mb-2">
                                                            {session.subject}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2 pt-3 md:pt-4 border-t border-slate-50 dark:border-slate-700/50">
                                                        <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[8px] font-bold text-slate-500">
                                                            {session.grade?.charAt(0)}
                                                        </div>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                            {session.grade}
                                                        </span>
                                                    </div>
                                                </motion.div>
                                            ))}
                                            {sessions.length === 0 && (
                                                <button
                                                    onClick={() => {
                                                        setFormData({ ...formData, day, start_time: timeSlot, end_time: `${parseInt(timeSlot) + 1}:00` });
                                                        setShowModal(true);
                                                    }}
                                                    className="w-full h-full opacity-0 hover:opacity-100 transition-all flex items-center justify-center bg-indigo-50/30 dark:bg-indigo-900/10 rounded-2xl border-2 border-dashed border-indigo-200 dark:border-indigo-800"
                                                >
                                                    <Plus className="text-indigo-400" size={24} />
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-xl shadow-2xl border border-white/20 dark:border-slate-800 overflow-hidden relative z-10"
                        >
                            <div className="p-6 md:p-10 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Plan New Session</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Configure academic delivery parameters</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="h-10 w-10 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                                    <X size={18} />
                                </button>
                            </div>

                            <form onSubmit={handleCreate} className="p-6 md:p-10 space-y-6 md:space-y-8">
                                {error && (
                                    <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 p-5 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-3 border-2 border-rose-500/10">
                                        <AlertCircle size={18} />
                                        {error}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                    <div className="space-y-2.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-3">Target Grade / Class</label>
                                        <select
                                            className="w-full h-12 px-5 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500/50 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all font-semibold text-slate-900 dark:text-white text-sm"
                                            required
                                            value={formData.grade}
                                            onChange={e => setFormData({ ...formData, grade: e.target.value })}
                                        >
                                            <option value="">Select Class</option>
                                            {grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-3">Academic Subject</label>
                                        <select
                                            className="w-full h-12 px-5 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500/50 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all font-semibold text-slate-900 dark:text-white text-sm"
                                            required
                                            value={formData.subject}
                                            onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                        >
                                            <option value="">Select Subject</option>
                                            {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    <div className="space-y-2.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-3">Delivery Day</label>
                                        <select
                                            className="w-full h-12 px-5 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500/50 outline-none font-semibold text-slate-900 dark:text-white text-sm"
                                            value={formData.day}
                                            onChange={e => setFormData({ ...formData, day: e.target.value })}
                                        >
                                            {DAYS.map(day => <option key={day} value={day}>{day}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-3">Start</label>
                                        <input
                                            type="time"
                                            className="w-full h-12 px-5 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500/50 outline-none font-semibold text-slate-900 dark:text-white text-sm"
                                            required
                                            value={formData.start_time}
                                            onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-3">End</label>
                                        <input
                                            type="time"
                                            className="w-full h-12 px-5 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500/50 outline-none font-semibold text-slate-900 dark:text-white text-sm"
                                            required
                                            value={formData.end_time}
                                            onChange={e => setFormData({ ...formData, end_time: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="pt-6 flex justify-end gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="h-12 px-8 rounded-xl font-bold text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitLoading}
                                        className="h-12 px-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-xl transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        {submitLoading ? 'Processing...' : 'Authorize Session'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TeacherScheduleManage;
