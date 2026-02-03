import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
    Users, Search, Filter, Download, MoreVertical,
    CheckCircle, XCircle, Clock, Calendar, Save,
    UserCheck, UserX, TrendingUp, Award, AlertCircle,
    ChevronRight, Zap, BarChart3, Eye, EyeOff, Grid, List
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TeacherAttendance = () => {
    const { id } = useParams();
    const [teacher, setTeacher] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [saving, setSaving] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [showStats, setShowStats] = useState(true);

    // Attendance State: { studentId: { status: 'PRESENT' | 'ABSENT' | 'LATE', remarks: '' } }
    const [attendanceData, setAttendanceData] = useState({});

    useEffect(() => {
        fetchTeacherData();
    }, [id]);

    useEffect(() => {
        if (teacher?.professional?.grade_id && students.length > 0) {
            fetchAttendanceForDate(teacher.professional.grade_id, selectedDate, students);
        }
    }, [selectedDate]);

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

    const fetchStudents = async (gradeId) => {
        try {
            setLoadingStudents(true);
            const response = await axios.get(`/api/students/?grade=${gradeId}`);
            setStudents(response.data.students);

            // Fetch initial attendance
            await fetchAttendanceForDate(gradeId, selectedDate, response.data.students);

        } catch (error) {
            console.error("Error fetching students:", error);
        } finally {
            setLoadingStudents(false);
        }
    };

    const fetchAttendanceForDate = async (gradeId, date, studentList) => {
        try {
            const response = await axios.get(`/api/grades/${gradeId}/attendance/?date=${date}`);
            const savedData = response.data.attendance || {};

            const newAttendance = {};
            studentList.forEach(student => {
                const saved = savedData[student.id];
                newAttendance[student.id] = {
                    status: saved ? saved.status : 'PRESENT',
                    remarks: saved?.remarks || ''
                };
            });
            setAttendanceData(newAttendance);
        } catch (error) {
            console.error("Error fetching attendance:", error);
            // Default to present if error or no data
            const newAttendance = {};
            studentList.forEach(student => {
                newAttendance[student.id] = { status: 'PRESENT', remarks: '' };
            });
            setAttendanceData(newAttendance);
        }
    };

    const handleAttendanceChange = (studentId, status) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], status }
        }));
    };

    const handleRemarksChange = (studentId, remarks) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], remarks }
        }));
    };

    const handleSubmit = async () => {
        if (!teacher?.professional?.grade_id) return;

        try {
            setSaving(true);

            const attendanceList = Object.entries(attendanceData).map(([studentId, data]) => ({
                student_id: parseInt(studentId),
                status: data.status,
                remarks: data.remarks,
                date: selectedDate,
                grade_id: teacher.professional.grade_id
            }));

            await axios.post('/api/attendance/mark/batch/', {
                attendance: attendanceList,
                date: selectedDate,
                recorded_by: teacher.id
            });

            // Show success message
            const successDiv = document.createElement('div');
            successDiv.className = 'fixed top-4 right-4 bg-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2';
            successDiv.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg><span class="font-semibold">Attendance saved successfully!</span>';
            document.body.appendChild(successDiv);
            setTimeout(() => successDiv.remove(), 3000);

        } catch (error) {
            console.error("Error saving attendance:", error);
            alert('Failed to save attendance. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    // Quick mark all
    const markAll = (status) => {
        const newData = {};
        students.forEach(student => {
            newData[student.id] = { status, remarks: attendanceData[student.id]?.remarks || '' };
        });
        setAttendanceData(newData);
    };

    // Filter students
    const filteredStudents = students.filter(student =>
        student.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.admission_number?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Calculate stats
    const stats = {
        total: students.length,
        present: Object.values(attendanceData).filter(d => d.status === 'PRESENT').length,
        absent: Object.values(attendanceData).filter(d => d.status === 'ABSENT').length,
        late: Object.values(attendanceData).filter(d => d.status === 'LATE').length,
    };
    stats.attendanceRate = stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(1) : 0;

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600"></div>
                <p className="text-slate-500 font-medium">Loading...</p>
            </div>
        </div>
    );

    if (!teacher || !teacher.professional.is_class_teacher) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-8">
                <div className="bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/20 dark:to-pink-900/20 p-12 rounded-3xl mb-6">
                    <UserX size={80} className="text-rose-500" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3">Access Restricted</h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-lg">
                    You must be assigned as a Class Teacher to mark attendance.
                </p>
            </div>
        );
    }

    return (

        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-32 font-sans">
            {/* Dark Header Section */}
            <div className="bg-slate-900 border-b border-slate-800 pb-12 pt-6 px-4 md:px-6 relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        {/* Title & Date */}
                        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-5">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 md:h-14 md:w-14 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20 ring-4 ring-slate-800 shrink-0">
                                    <UserCheck size={24} md:size={28} className="text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2 tracking-tight">
                                        Attendance
                                        {teacher?.professional?.grade_assigned && (
                                            <span className="px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-primary-400 text-xs font-bold">
                                                {teacher.professional.grade_assigned}
                                            </span>
                                        )}
                                    </h1>
                                    <p className="text-slate-400 font-medium text-sm md:text-base mt-1">
                                        {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Date Picker - Full width on mobile */}
                        <div className="flex items-center gap-3 bg-slate-800/50 backdrop-blur-md p-2.5 rounded-xl border border-slate-700/50 w-full md:w-auto">
                            <Calendar size={18} className="text-primary-400 shrink-0" />
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="bg-transparent border-none text-slate-200 focus:ring-0 font-semibold cursor-pointer text-sm w-full"
                            />
                        </div>
                    </div>

                    {/* Stats Cards - Grid 2x2 on Mobile */}
                    <AnimatePresence>
                        {showStats && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4"
                            >
                                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 relative overflow-hidden group">
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="p-1.5 bg-blue-500/20 rounded-lg text-blue-400">
                                                <Users size={16} />
                                            </div>
                                            <p className="text-[10px] font-bold text-blue-300 uppercase tracking-wider">Students</p>
                                        </div>
                                        <p className="text-2xl font-black text-white">{stats.total}</p>
                                    </div>
                                </div>

                                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 relative overflow-hidden group">
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="p-1.5 bg-emerald-500/20 rounded-lg text-emerald-400">
                                                <CheckCircle size={16} />
                                            </div>
                                            <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">Present</p>
                                        </div>
                                        <p className="text-2xl font-black text-white">{stats.present}</p>
                                    </div>
                                </div>

                                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 relative overflow-hidden group">
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="p-1.5 bg-rose-500/20 rounded-lg text-rose-400">
                                                <XCircle size={16} />
                                            </div>
                                            <p className="text-[10px] font-bold text-rose-300 uppercase tracking-wider">Absent</p>
                                        </div>
                                        <p className="text-2xl font-black text-white">{stats.absent}</p>
                                    </div>
                                </div>

                                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 relative overflow-hidden group">
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="p-1.5 bg-amber-500/20 rounded-lg text-amber-400">
                                                <BarChart3 size={16} />
                                            </div>
                                            <p className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">Rate</p>
                                        </div>
                                        <p className="text-2xl font-black text-white">{stats.attendanceRate}%</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 -mt-6 relative z-20">
                {/* Toolbar */}
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-200 dark:border-slate-800 p-3 mb-4 md:mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="relative flex-1">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search students..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800/50 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white placeholder-slate-500"
                            />
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-2">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                >
                                    <Grid size={18} />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                >
                                    <List size={18} />
                                </button>
                            </div>

                            <button
                                onClick={() => markAll('PRESENT')}
                                className="px-3 py-2 bg-emerald-500 text-white text-xs md:text-sm font-bold rounded-lg hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
                            >
                                <Zap size={16} />
                                Mark All Present
                            </button>
                        </div>
                    </div>
                </div>

                {/* Grid View */}
                {loadingStudents ? (
                    <div className="py-20 flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-primary-600 mb-4"></div>
                        <p className="text-slate-500 font-medium">Loading class list...</p>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                        {filteredStudents.map((student, index) => (
                            <motion.div
                                key={student.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.02 }}
                                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm hover:shadow-md transition-all group"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-10 w-10 shrink-0 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold text-lg group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                        {student.first_name ? student.first_name[0] : (student.full_name || '?')[0]}
                                        {student.last_name ? student.last_name[0] : (student.full_name?.split(' ')[1] || '')[0]}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">{student.full_name}</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">{student.admission_number}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2 mb-3">
                                    <button
                                        onClick={() => handleAttendanceChange(student.id, 'PRESENT')}
                                        className={`py-2 rounded-lg flex flex-col items-center justify-center gap-1 transition-all touch-manipulation ${attendanceData[student.id]?.status === 'PRESENT'
                                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25 ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-slate-900'
                                            : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                                            }`}
                                    >
                                        <CheckCircle size={18} />
                                        <span className="text-[10px] font-bold uppercase">Present</span>
                                    </button>
                                    <button
                                        onClick={() => handleAttendanceChange(student.id, 'LATE')}
                                        className={`py-2 rounded-lg flex flex-col items-center justify-center gap-1 transition-all touch-manipulation ${attendanceData[student.id]?.status === 'LATE'
                                            ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25 ring-2 ring-amber-500 ring-offset-2 dark:ring-offset-slate-900'
                                            : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                                            }`}
                                    >
                                        <Clock size={18} />
                                        <span className="text-[10px] font-bold uppercase">Late</span>
                                    </button>
                                    <button
                                        onClick={() => handleAttendanceChange(student.id, 'ABSENT')}
                                        className={`py-2 rounded-lg flex flex-col items-center justify-center gap-1 transition-all touch-manipulation ${attendanceData[student.id]?.status === 'ABSENT'
                                            ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25 ring-2 ring-rose-500 ring-offset-2 dark:ring-offset-slate-900'
                                            : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                                            }`}
                                    >
                                        <XCircle size={18} />
                                        <span className="text-[10px] font-bold uppercase">Absent</span>
                                    </button>
                                </div>

                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Add remark..."
                                        value={attendanceData[student.id]?.remarks || ''}
                                        onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-xs focus:ring-1 focus:ring-primary-500 text-slate-700 dark:text-slate-300 placeholder-slate-400 transition-all"
                                    />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    /* Mobile-First List View */
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredStudents.map((student) => (
                                <div key={student.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 shrink-0 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 text-xs font-bold">
                                                {student.first_name?.[0]}{student.last_name?.[0]}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm text-slate-900 dark:text-white">{student.full_name}</p>
                                                <p className="text-xs text-slate-500 font-mono">{student.admission_number}</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 self-start sm:self-auto w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
                                            {['PRESENT', 'LATE', 'ABSENT'].map(status => (
                                                <button
                                                    key={status}
                                                    onClick={() => handleAttendanceChange(student.id, status)}
                                                    className={`flex-1 sm:flex-none px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all w-24 sm:w-auto shrink-0 ${attendanceData[student.id]?.status === status
                                                        ? status === 'PRESENT' ? 'bg-emerald-500 text-white' : status === 'LATE' ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white'
                                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                                        }`}
                                                >
                                                    {status === 'PRESENT' ? <CheckCircle size={14} /> : status === 'LATE' ? <Clock size={14} /> : <XCircle size={14} />}
                                                    {status === 'PRESENT' ? 'Present' : status === 'LATE' ? 'Late' : 'Absent'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <input
                                        type="text"
                                        placeholder="Add remark..."
                                        value={attendanceData[student.id]?.remarks || ''}
                                        onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                                        className="mt-3 w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border-none rounded-lg text-xs text-slate-700 dark:text-slate-300"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Responsive Floating Footer */}
            <div className="fixed bottom-0 left-0 right-0 z-40 p-4 pointer-events-none">
                <div className="max-w-xl mx-auto bg-slate-900/90 backdrop-blur-xl border border-slate-700 text-white p-3 rounded-2xl shadow-2xl flex flex-col xs:flex-row items-center justify-between gap-3 pointer-events-auto">
                    <div className="flex w-full xs:w-auto items-center justify-around xs:justify-start gap-4 xs:gap-6 text-xs pl-2">
                        <div className="flex flex-col xs:flex-row items-center gap-1 xs:gap-2">
                            <span className="text-slate-400 hidden xs:inline">Present</span>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 block"></span>
                                <span className="font-bold text-white text-base">{stats.present}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 xs:hidden">Present</span>
                        </div>
                        <div className="h-4 w-px bg-slate-700 hidden xs:block"></div>
                        <div className="flex flex-col xs:flex-row items-center gap-1 xs:gap-2">
                            <span className="text-slate-400 hidden xs:inline">Absent</span>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-rose-500 block"></span>
                                <span className="font-bold text-white text-base">{stats.absent}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 xs:hidden">Absent</span>
                        </div>
                        <div className="h-4 w-px bg-slate-700 hidden xs:block"></div>
                        <div className="flex flex-col xs:flex-row items-center gap-1 xs:gap-2">
                            <span className="text-slate-400 hidden xs:inline">Late</span>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-amber-500 block"></span>
                                <span className="font-bold text-white text-base">{stats.late}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 xs:hidden">Late</span>
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="w-full xs:w-auto bg-primary-600 hover:bg-primary-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary-900/50 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {saving ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <Save size={18} />
                        )}
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TeacherAttendance;
