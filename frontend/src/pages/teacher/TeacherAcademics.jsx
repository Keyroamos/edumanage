import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen, Users, Save, Search, Filter,
    TrendingUp, Award, Calendar, ChevronDown,
    X, Plus, Trash2, AlertCircle, CheckCircle, Edit2
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import axios from 'axios';

const TeacherAcademics = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { id: teacherId } = useParams();
    const [activeTab, setActiveTab] = useState('record');
    const [loading, setLoading] = useState(false);
    const [teacher, setTeacher] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [students, setStudents] = useState([]);

    // Selection State
    const [filters, setFilters] = useState({
        grade_id: '',
        term: '1',
        type: 'mid-term',
        date: new Date().toISOString().split('T')[0]
    });

    // Student-Centric Entry State
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentMarks, setStudentMarks] = useState({});
    const [message, setMessage] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);

    // Fetch teacher data and set grade automatically
    useEffect(() => {
        const fetchTeacherData = async () => {
            try {
                const response = await axios.get(`/api/teachers/${teacherId}/`);
                setTeacher(response.data.teacher);

                // Auto-set grade if teacher is a class teacher
                if (response.data.teacher.professional.is_class_teacher && response.data.teacher.professional.grade_id) {
                    setFilters(prev => ({ ...prev, grade_id: response.data.teacher.professional.grade_id }));
                }
            } catch (err) {
                console.error("Failed to load teacher data", err);
            }
        };
        fetchTeacherData();
    }, [teacherId]);

    // Fetch subjects
    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const subjectRes = await axios.get('/api/subjects/');
                setSubjects(subjectRes.data.subjects || []);
            } catch (err) {
                console.error("Failed to load metadata", err);
            }
        };
        fetchMetadata();
    }, []);

    // Check for pre-selected student from URL
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const studentId = params.get('student');
        const gradeId = params.get('grade');
        const term = params.get('term');
        const type = params.get('type');

        if (gradeId) {
            setFilters(prev => ({
                ...prev,
                grade_id: gradeId,
                term: term || prev.term,
                type: type || prev.type
            }));
        }
    }, [location.search]);

    // Fetch Students when Class Changes
    useEffect(() => {
        if (!filters.grade_id) return;
        setStudents([]);

        const fetchStudents = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`/api/students/?grade=${filters.grade_id}&per_page=1000`);
                const studentsList = res.data.students || res.data.results || [];
                setStudents(studentsList);

                // Auto-select student from URL if present
                const params = new URLSearchParams(location.search);
                const studentId = params.get('student');
                if (studentId) {
                    const student = studentsList.find(s => s.id === parseInt(studentId));
                    if (student) {
                        handleStudentSelect(student, studentsList);
                    }
                }
            } catch (err) {
                console.error("Failed to load students", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, [filters.grade_id]);

    const handleMarksChange = (subjectId, value) => {
        let numVal = parseFloat(value);
        if (value === '') {
            setStudentMarks(prev => ({ ...prev, [subjectId]: '' }));
            return;
        }
        if (numVal < 0) numVal = 0;
        else if (numVal > 100) numVal = 100;

        setStudentMarks(prev => ({
            ...prev,
            [subjectId]: value
        }));
    };

    const getPerformanceLevel = (marks) => {
        const m = parseFloat(marks);
        if (isNaN(m)) return { label: '-', class: '' };
        if (m >= 80) return { label: 'EE', class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' };
        if (m >= 60) return { label: 'ME', class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' };
        if (m >= 40) return { label: 'AE', class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' };
        return { label: 'BE', class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
    };

    const handleStudentSelect = async (student) => {
        setSelectedStudent(student);
        setStudentMarks({});
        setMessage(null);
        setIsEditMode(false);

        // Check if we're in edit mode from URL
        const params = new URLSearchParams(location.search);
        const editMode = params.get('edit');

        if (editMode === 'true') {
            console.log('Loading existing marks for editing...');

            try {
                const response = await axios.get(`/api/students/${student.id}/academics/`);

                if (response.data.success && response.data.records) {
                    const termKey = `Term ${filters.term}`;
                    const termData = response.data.records[termKey];

                    if (termData && termData[filters.type]) {
                        const assessmentData = termData[filters.type];
                        const existingMarks = {};

                        assessmentData.subjects.forEach(subject => {
                            // Try to find the subject by name or code
                            const subjectObj = subjects.find(s =>
                                s.name === subject.subject_name ||
                                s.code === subject.subject_code ||
                                s.name.toLowerCase() === subject.subject_name.toLowerCase()
                            );

                            if (subjectObj) {
                                existingMarks[subjectObj.id] = subject.marks;
                            }
                        });

                        if (Object.keys(existingMarks).length > 0) {
                            setStudentMarks(existingMarks);
                            setIsEditMode(true);
                            setMessage({ type: 'info', text: `Editing existing assessment. Loaded ${Object.keys(existingMarks).length} subject marks.` });
                        } else {
                            setMessage({ type: 'error', text: 'Could not load existing marks. Subject mismatch detected.' });
                        }
                    } else {
                        setMessage({ type: 'error', text: `No existing ${filters.type} assessment found for Term ${filters.term}.` });
                    }
                }
            } catch (err) {
                console.error('Error fetching existing marks:', err);
                setMessage({ type: 'error', text: 'Failed to load existing marks. Please try again.' });
            }
        }
    };

    const handleSaveStudentMarks = async () => {
        if (!selectedStudent || !filters.grade_id) return;

        setLoading(true);
        setMessage(null);

        const resultsArray = Object.entries(studentMarks).map(([subjectId, marks]) => ({
            subject_id: subjectId,
            marks: marks
        })).filter(item => item.marks !== '');

        if (resultsArray.length === 0) {
            setMessage({ type: 'error', text: 'Please enter at least one mark.' });
            setLoading(false);
            return;
        }

        const payload = {
            student_id: selectedStudent.id,
            grade_id: filters.grade_id,
            term: filters.term,
            assessment_type: filters.type,
            date: filters.date,
            results: resultsArray
        };

        try {
            const response = await axios.post('/api/assessments/batch-save/', payload);
            if (response.data.success) {
                setMessage({ type: 'success', text: `Saved ${response.data.saved_count} scores for ${selectedStudent.full_name}!` });
                setTimeout(() => setSelectedStudent(null), 1500);
            }
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: 'Failed to save results. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const calculateStudentStats = () => {
        const marks = Object.values(studentMarks).map(m => parseFloat(m)).filter(m => !isNaN(m));
        if (marks.length === 0) return { total: 0, average: 0, count: 0 };
        const total = marks.reduce((a, b) => a + b, 0);
        return {
            total: total,
            average: (total / marks.length).toFixed(1),
            count: marks.length
        };
    };

    const stats = calculateStudentStats();

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Record Assessment</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 md:mt-2 text-sm md:text-base">Record marks for your students</p>
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row flex-wrap gap-4 items-stretch md:items-center">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 md:mr-2 mb-2 md:mb-0">
                    <Filter size={20} />
                    <span className="font-medium text-sm">Filters:</span>
                </div>

                <div className="grid grid-cols-2 md:flex gap-3 w-full md:w-auto">
                    <div className="relative w-full md:min-w-[180px]">
                        <select
                            className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm font-semibold focus:ring-2 focus:ring-primary-500 appearance-none text-slate-700 dark:text-slate-200"
                            value={filters.type}
                            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                        >
                            <option value="opener">Opener Exam</option>
                            <option value="mid-term">Mid Term</option>
                            <option value="end-term">End Term</option>
                            <option value="weekly">Weekly Test</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
                    </div>

                    <div className="relative w-full md:min-w-[140px]">
                        <select
                            className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm font-semibold focus:ring-2 focus:ring-primary-500 appearance-none text-slate-700 dark:text-slate-200"
                            value={filters.term}
                            onChange={(e) => setFilters(prev => ({ ...prev, term: e.target.value }))}
                        >
                            <option value="1">Term 1</option>
                            <option value="2">Term 2</option>
                            <option value="3">Term 3</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
                    </div>
                </div>

                <div className="w-full md:w-auto md:ml-auto">
                    <Input
                        type="date"
                        value={filters.date}
                        onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
                        className="py-2.5 w-full md:w-auto"
                    />
                </div>
            </div>

            {/* Message Display */}
            <AnimatePresence mode="wait">
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`px-4 py-3 rounded-lg flex items-center justify-between gap-4 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:border-green-800' :
                            message.type === 'info' ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' :
                                'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:border-red-800'
                            }`}
                    >
                        <div className="flex items-center gap-2 text-sm font-medium">
                            {message.type === 'success' ? <CheckCircle size={18} /> :
                                message.type === 'info' ? <Edit2 size={18} /> :
                                    <AlertCircle size={18} />}
                            {message.text}
                        </div>
                        <button onClick={() => setMessage(null)} className="opacity-50 hover:opacity-100 shrink-0">
                            <X size={16} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
            >
                {!selectedStudent ? (
                    /* Student Selection Grid */
                    filters.grade_id ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {students.map((student, index) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    key={student.id}
                                    onClick={() => handleStudentSelect(student)}
                                    className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden flex sm:block items-center sm:items-start gap-4 sm:gap-0"
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
                                        <div className="bg-primary-50 text-primary-600 rounded-full p-1">
                                            <Edit2 size={14} />
                                        </div>
                                    </div>
                                    <div className="h-12 w-12 sm:mb-4 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-lg font-bold text-slate-500 uppercase shrink-0">
                                        {student.photo ? (
                                            <img src={student.photo} alt="Student" className="w-full h-full object-cover rounded-xl" />
                                        ) : (
                                            student.full_name?.[0] || 'S'
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors line-clamp-1 text-sm sm:text-base">
                                            {student.full_name}
                                        </h3>
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">
                                            Adm: <span className="text-slate-700 dark:text-slate-300">{student.admission_number}</span>
                                        </p>
                                        <div className="mt-2 text-xs text-slate-400 hidden sm:flex items-center gap-1">
                                            Click to record marks
                                        </div>
                                    </div>
                                    <div className="ml-auto sm:hidden text-primary-500">
                                        <Edit2 size={16} />
                                    </div>
                                </motion.div>
                            ))}
                            {students.length === 0 && (
                                <div className="col-span-full py-20 text-center text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                                    No students found in this class.
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                            <div className="h-16 w-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm mb-4">
                                <Users size={32} className="text-primary-500" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Loading Your Class</h3>
                            <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-sm text-center">
                                Please wait while we load your students...
                            </p>
                        </div>
                    )
                ) : (
                    /* Marks Entry Sheet */
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Main Entry Area */}
                        <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                            <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-50/50 dark:bg-slate-800/50 gap-4">
                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    <button
                                        onClick={() => setSelectedStudent(null)}
                                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-500 shrink-0"
                                    >
                                        <ChevronDown className="rotate-90" size={24} />
                                    </button>
                                    <div className="min-w-0">
                                        <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 truncate">
                                            <span className="truncate">{selectedStudent.full_name}</span>
                                            {isEditMode && (
                                                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] md:text-xs font-bold rounded-full uppercase tracking-wide shrink-0">
                                                    Edit Mode
                                                </span>
                                            )}
                                        </h2>
                                        <p className="text-xs md:text-sm text-slate-500 mt-0.5 truncate">Recording <span className="font-semibold text-primary-600">{filters.type}</span> for Term {filters.term}</p>
                                    </div>
                                </div>
                                <div className="flex gap-3 w-full md:w-auto pl-11 md:pl-0">
                                    <Button variant="secondary" onClick={() => setSelectedStudent(null)} className="flex-1 md:flex-none justify-center">Cancel</Button>
                                    <Button onClick={handleSaveStudentMarks} isLoading={loading} className="flex-1 md:flex-none justify-center">
                                        <Save size={18} className="mr-2" />
                                        <span className="hidden sm:inline">Save Grades</span>
                                        <span className="sm:hidden">Save</span>
                                    </Button>
                                </div>
                            </div>
                            <div className="p-4 md:p-6 lg:p-8">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 md:gap-y-6">
                                    {subjects.map(subject => {
                                        const perf = getPerformanceLevel(studentMarks[subject.id]);
                                        return (
                                            <div key={subject.id} className="relative group">
                                                <div className="flex justify-between mb-2">
                                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate pr-2">
                                                        {subject.name}
                                                    </label>
                                                    {studentMarks[subject.id] && (
                                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${perf.class} shrink-0`}>
                                                            {perf.label}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        placeholder="—"
                                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all font-mono text-lg font-semibold text-center"
                                                        value={studentMarks[subject.id] || ''}
                                                        onChange={(e) => handleMarksChange(subject.id, e.target.value)}
                                                    />
                                                    <div className="absolute inset-y-0 right-3 flex items-center text-slate-400 text-xs font-bold pointer-events-none">
                                                        /100
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Stats Sidebar */}
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 sticky top-6">
                                <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Award className="text-amber-500" size={20} />
                                    Current Stats
                                </h3>

                                <div className="space-y-4">
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Subjects Graded</p>
                                        <p className="text-2xl font-black text-slate-900 dark:text-white">
                                            {stats.count} <span className="text-sm font-medium text-slate-400">/ {subjects.length}</span>
                                        </p>
                                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                                            <div className="bg-primary-500 h-full rounded-full transition-all duration-300" style={{ width: `${(stats.count / subjects.length) * 100}%` }}></div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl text-center">
                                            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Total</p>
                                            <p className="text-xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl text-center">
                                            <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Average</p>
                                            <p className={`text-xl font-bold ${parseFloat(stats.average) >= 60 ? 'text-green-600' :
                                                parseFloat(stats.average) >= 40 ? 'text-amber-600' : 'text-slate-900 dark:text-white'
                                                }`}>
                                                {stats.average}%
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                                    <p className="text-xs text-slate-400 text-center">
                                        System auto-calculates grade levels and totals upon saving.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default TeacherAcademics;
