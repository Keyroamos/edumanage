import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen, Users, Save, Search, Filter,
    CheckCircle, AlertCircle, ChevronDown,
    Award, BarChart2, Edit2, TrendingUp, X
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import axios from 'axios';

const Academics = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('record');
    const [loading, setLoading] = useState(false);
    const [grades, setGrades] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [students, setStudents] = useState([]);

    // Selection State
    const [filters, setFilters] = useState({
        grade_id: '',
        term: '1', // Default term
        type: 'mid-term',
        date: new Date().toISOString().split('T')[0]
    });

    // Student-Centric Entry State
    const [selectedStudent, setSelectedStudent] = useState(null); // The student being graded
    const [studentMarks, setStudentMarks] = useState({}); // { subject_id: marks } for selected student
    const [message, setMessage] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [studentSearch, setStudentSearch] = useState('');

    const [analytics, setAnalytics] = useState(null);

    // Initial Data Fetch
    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const [gradeRes, subjectRes] = await Promise.all([
                    axios.get('/api/grades/'),
                    axios.get('/api/subjects/')
                ]);
                setGrades(gradeRes.data.grades || []);
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
        const editMode = params.get('edit');

        if (gradeId) {
            setFilters(prev => ({
                ...prev,
                grade_id: gradeId,
                term: term || prev.term,
                type: type || prev.type
            }));
        }

        // Store edit mode flag for later use
        if (editMode === 'true' && studentId) {
            sessionStorage.setItem('editMode', 'true');
            sessionStorage.setItem('editStudentId', studentId);
            // If already on record tab and students loaded, this will trigger selection via students effect
            // If not, the students effect will run when grade_id is set
            setActiveTab('record');
        }
    }, [location.search]);

    // Fetch Analytics when Tab or Filters Change
    useEffect(() => {
        if (activeTab === 'reports' && filters.grade_id && filters.term) {
            const fetchAnalytics = async () => {
                setLoading(true);
                try {
                    const res = await axios.get(`/api/assessments/analytics/`, {
                        params: {
                            grade_id: filters.grade_id,
                            term: filters.term,
                            type: filters.type
                        }
                    });
                    setAnalytics(res.data.analytics || null);
                } catch (err) {
                    console.error("Failed to load analytics", err);
                } finally {
                    setLoading(false);
                }
            };
            fetchAnalytics();
        }
    }, [activeTab, filters.grade_id, filters.term, filters.type]);

    // Fetch Students when Class Changes (Only for Record Tab)
    useEffect(() => {
        if (activeTab !== 'record' || !filters.grade_id) return;
        setStudents([]); // Clear previous

        const fetchStudents = async () => {
            setLoading(true);
            try {
                // Fetch all students for the grade (limit 1000)
                const res = await axios.get(`/api/students/?grade=${filters.grade_id}&per_page=1000`);
                const studentsList = res.data.students || res.data.results || [];
                setStudents(studentsList);

                // Auto-select student from URL if present
                const params = new URLSearchParams(location.search);
                const studentId = params.get('student');
                if (studentId) {
                    const student = studentsList.find(s => s.id === parseInt(studentId));
                    if (student) {
                        handleStudentSelect(student, studentsList); // Pass list to avoid dependency issues if needed
                    }
                }
            } catch (err) {
                console.error("Failed to load students", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, [filters.grade_id, activeTab]);

    const handleMarksChange = (subjectId, value) => {
        // Enforce 0-100 limit
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
        if (isNaN(m)) return '-';
        if (m >= 80) return { label: 'EE', class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' };
        if (m >= 60) return { label: 'ME', class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' };
        if (m >= 40) return { label: 'AE', class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' };
        return { label: 'BE', class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
    };

    const handleStudentSelect = async (student, currentStudentsList) => {
        setSelectedStudent(student);
        setStudentMarks({}); // Reset first
        setMessage(null);
        setIsEditMode(false);

        // Check if we're in edit mode
        const isEditMode = sessionStorage.getItem('editMode') === 'true';
        const editStudentId = sessionStorage.getItem('editStudentId');

        // Clear session storage after reading
        if (isEditMode) {
            sessionStorage.removeItem('editMode');
            sessionStorage.removeItem('editStudentId');
        }

        // Only fetch existing marks if explicitly in edit mode
        if (isEditMode && editStudentId === student.id.toString()) {
            console.log('Fetching existing marks for editing...');

            // Ensure subjects are loaded - fetch if not available
            let availableSubjects = subjects;
            if (availableSubjects.length === 0) {
                console.log('Subjects not loaded yet, fetching...');
                try {
                    const subjectRes = await axios.get('/api/subjects/');
                    availableSubjects = subjectRes.data.subjects || [];
                    setSubjects(availableSubjects);
                } catch (err) {
                    console.error('Failed to fetch subjects:', err);
                    setMessage({ type: 'error', text: 'Failed to load subjects. Please refresh the page.' });
                    return;
                }
            }

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
                            const subjectObj = availableSubjects.find(s =>
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

        // Transform studentMarks to API format
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

    // Calculate current student stats
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

    const filteredStudents = React.useMemo(() => {
        if (!studentSearch) return students;
        return students.filter(s =>
            s.full_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
            s.admission_number.toLowerCase().includes(studentSearch.toLowerCase())
        );
    }, [students, studentSearch]);

    const stats = calculateStudentStats();

    return (
        <div className="p-4 max-w-7xl mx-auto space-y-4">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 md:gap-4 pb-3 md:pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="text-center md:text-left">
                    <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase tracking-widest">Academics</h1>
                    <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 mt-1 md:mt-1.5 font-medium tracking-wide">Manage assessments, record marks, and view analytics.</p>
                </div>

                {/* Custom Tab Switcher */}
                <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl flex items-center w-full md:w-auto">
                    <button
                        onClick={() => { setActiveTab('record'); setSelectedStudent(null); }}
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-3 md:px-5 py-2 rounded-xl text-[11px] md:text-xs font-black transition-all duration-200 uppercase tracking-widest ${activeTab === 'record'
                            ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-white shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                    >
                        <BookOpen size={14} className="md:w-[16px] md:h-[16px]" />
                        Record Marks
                    </button>
                    <button
                        onClick={() => { setActiveTab('reports'); setSelectedStudent(null); }}
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-3 md:px-5 py-2 rounded-xl text-[11px] md:text-xs font-black transition-all duration-200 uppercase tracking-widest ${activeTab === 'reports'
                            ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-white shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                    >
                        <BarChart2 size={14} className="md:w-[16px] md:h-[16px]" />
                        Analytics
                    </button>
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white dark:bg-slate-900 p-4 md:p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 grid grid-cols-2 lg:flex lg:flex-wrap gap-3 md:gap-4 items-center">
                <div className="col-span-2 lg:flex lg:items-center lg:gap-2 text-slate-500 dark:text-slate-400 md:mr-2">
                    <div className="flex items-center gap-2">
                        <Filter size={18} className="md:w-5 md:h-5 text-primary-500" />
                        <span className="font-bold text-xs uppercase tracking-wider">Filters:</span>
                    </div>
                </div>

                <div className="relative col-span-2 sm:col-span-1 lg:min-w-[220px]">
                    <select
                        className="w-full pl-4 pr-10 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary-500 rounded-xl text-sm font-bold focus:ring-0 appearance-none text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
                        value={filters.grade_id}
                        onChange={(e) => setFilters(prev => ({ ...prev, grade_id: e.target.value }))}
                    >
                        <option value="">Select Class / Grade</option>
                        {grades.map(g => (
                            <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

                <div className="relative col-span-1 lg:min-w-[180px]">
                    <select
                        className="w-full pl-4 pr-10 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary-500 rounded-xl text-sm font-bold focus:ring-0 appearance-none text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
                        value={filters.type}
                        onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                    >
                        <option value="opener">Opener</option>
                        <option value="mid-term">Mid Term</option>
                        <option value="end-term">End Term</option>
                        <option value="weekly">Weekly</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

                <div className="relative col-span-1 lg:min-w-[140px]">
                    <select
                        className="w-full pl-4 pr-10 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary-500 rounded-xl text-sm font-bold focus:ring-0 appearance-none text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
                        value={filters.term}
                        onChange={(e) => setFilters(prev => ({ ...prev, term: e.target.value }))}
                    >
                        <option value="1">Term 1</option>
                        <option value="2">Term 2</option>
                        <option value="3">Term 3</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

                <div className="col-span-2 lg:ml-auto">
                    <input
                        type="date"
                        value={filters.date}
                        onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
                        className="w-full lg:w-auto px-4 py-3 md:py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary-500 rounded-xl text-sm font-bold focus:ring-0 text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
                    />
                </div>
            </div>

            {/* Main Content Area */}
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
                        <button onClick={() => setMessage(null)} className="opacity-50 hover:opacity-100">
                            <X size={16} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* TAB CONTENT: RECORD MARKS */}
            {activeTab === 'record' && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {!selectedStudent && filters.grade_id && (
                        <div className="mb-6">
                            <div className="relative max-w-md mx-auto md:mx-0">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search student by name or admission..."
                                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 focus:border-primary-500 rounded-2xl text-sm font-bold focus:ring-0 text-slate-700 dark:text-slate-200 shadow-sm transition-all"
                                    value={studentSearch}
                                    onChange={(e) => setStudentSearch(e.target.value)}
                                />
                            </div>
                        </div>
                    )}
                    {!selectedStudent ? (
                        /* Student Selection Grid */
                        filters.grade_id ? (
                            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                                {filteredStudents.map((student, index) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                        key={student.id}
                                        onClick={() => handleStudentSelect(student)}
                                        className="bg-white dark:bg-slate-900 p-3 md:p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:border-primary-500 dark:hover:border-primary-500 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 p-2 md:p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="bg-primary-50 text-primary-600 rounded-full p-1">
                                                <Edit2 size={12} className="md:w-[14px] md:h-[14px]" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col md:flex-row items-center md:items-start gap-3 md:gap-4 text-center md:text-left">
                                            <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-sm md:text-lg font-bold text-slate-500 uppercase shrink-0">
                                                {student.photo ? (
                                                    <img src={student.photo} alt="Student" className="w-full h-full object-cover rounded-xl" />
                                                ) : (
                                                    student.full_name?.[0] || 'S'
                                                )}
                                            </div>
                                            <div className="min-w-0 w-full">
                                                <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors text-xs md:text-base truncate">
                                                    {student.full_name}
                                                </h3>
                                                <p className="text-[10px] md:text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                                                    Adm: <span className="text-slate-700 dark:text-slate-300">{student.admission_number}</span>
                                                </p>
                                                <div className="mt-2 text-[10px] text-slate-400 hidden md:flex items-center gap-1">
                                                    Click to record marks
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                                {students.length === 0 && (
                                    <div className="col-span-full py-12 md:py-20 text-center text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                                        No students found in this class.
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                                <div className="h-16 w-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm mb-4">
                                    <Users size={32} className="text-primary-500" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Select a Class</h3>
                                <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-sm text-center">
                                    Please select a Grade from the filters above to view the student list and start recording marks.
                                </p>
                            </div>
                        )
                    ) : (
                        /* Marks Entry Sheet */
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            {/* Main Entry Area */}
                            <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                                <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 gap-4">
                                    <div className="flex items-center gap-3 md:gap-4 w-full sm:w-auto">
                                        <button
                                            onClick={() => setSelectedStudent(null)}
                                            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-500"
                                        >
                                            <ChevronDown className="rotate-90 w-5 h-5 md:w-6 md:h-6" />
                                        </button>
                                        <div className="min-w-0">
                                            <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white flex flex-wrap items-center gap-2 truncate">
                                                {selectedStudent.full_name}
                                                {isEditMode && (
                                                    <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded-md uppercase tracking-wide">
                                                        Edit
                                                    </span>
                                                )}
                                            </h2>
                                            <p className="text-[10px] md:text-sm text-slate-500 mt-0.5 font-medium">Recording <span className="text-primary-600 font-bold uppercase">{filters.type}</span> • T{filters.term}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 w-full sm:w-auto">
                                        <Button variant="secondary" className="flex-1 sm:flex-none py-2 text-xs" onClick={() => setSelectedStudent(null)}>Cancel</Button>
                                        <Button className="flex-[2] sm:flex-none py-2 text-xs shadow-lg shadow-primary-500/20" onClick={handleSaveStudentMarks} isLoading={loading}>
                                            <Save className="mr-1.5 w-3.5 h-3.5 md:w-[18px] md:h-[18px]" />
                                            Save Grades
                                        </Button>
                                    </div>
                                </div>
                                <div className="p-6 md:p-8">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6">
                                        {subjects.map(subject => {
                                            const perf = getPerformanceLevel(studentMarks[subject.id]);
                                            return (
                                                <div key={subject.id} className="relative group">
                                                    <div className="flex justify-between mb-2">
                                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                                            {subject.name}
                                                        </label>
                                                        {studentMarks[subject.id] && (
                                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${perf.class}`}>
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
                            <div className="space-y-4 md:space-y-6">
                                <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 md:p-6 shadow-xl border border-slate-100 dark:border-slate-800 sticky top-6">
                                    <h3 className="font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2 text-sm md:text-base">
                                        <Award className="text-amber-500 w-[18px] h-[18px] md:w-5 md:h-5" />
                                        Performance Stats
                                    </h3>

                                    <div className="space-y-4">
                                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Subjects Graded</p>
                                            <p className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
                                                {stats.count} <span className="text-xs font-bold text-slate-400">/ {subjects.length}</span>
                                            </p>
                                            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                                                <div className="bg-primary-500 h-full rounded-full transition-all duration-300" style={{ width: `${(stats.count / subjects.length) * 100}%` }}></div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl text-center">
                                                <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Total</p>
                                                <p className="text-lg md:text-xl font-black text-slate-900 dark:text-white">{stats.total}</p>
                                            </div>
                                            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl text-center">
                                                <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Average</p>
                                                <p className={`text-lg md:text-xl font-black ${parseFloat(stats.average) >= 60 ? 'text-green-600' :
                                                    parseFloat(stats.average) >= 40 ? 'text-amber-600' : 'text-slate-900 dark:text-white'
                                                    }`}>
                                                    {stats.average}%
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800">
                                        <p className="text-[10px] font-medium text-slate-400 text-center leading-relaxed">
                                            Auto-calculates grade levels and totals upon saving.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            )}

            {/* TAB CONTENT: ANALYTICS REPORTS */}
            {activeTab === 'reports' && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {analytics ? (
                        <div className="space-y-8">
                            {/* Performance Overview Cards */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                                {Object.entries(analytics.distribution).map(([key, value]) => {
                                    const colors = {
                                        exceeding: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400',
                                        meeting: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400',
                                        approaching: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400',
                                        below: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400'
                                    };
                                    const labels = {
                                        exceeding: { title: 'Exceeding', desc: '80% - 100%' },
                                        meeting: { title: 'Meeting', desc: '60% - 79%' },
                                        approaching: { title: 'Approaching', desc: '40% - 59%' },
                                        below: { title: 'Below', desc: '0% - 39%' }
                                    };

                                    return (
                                        <div key={key} className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                                            <div className="flex justify-between items-start mb-2 md:mb-4">
                                                <div>
                                                    <h3 className="font-bold text-slate-900 dark:text-white text-xs md:text-base">{labels[key].title}</h3>
                                                    <p className="text-[10px] text-slate-500 mt-0.5 hidden md:block">{labels[key].desc}</p>
                                                </div>
                                                <div className={`px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-lg text-[10px] md:text-xs font-black uppercase ${colors[key]}`}>
                                                    {((value / (analytics.merit_list.length || 1)) * 100).toFixed(0)}%
                                                </div>
                                            </div>
                                            <div className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white my-1 md:my-2">{value}</div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Students</p>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                                {/* Subject Performance Chart */}
                                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 md:p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">Subject Performance</h3>
                                    <div className="h-64 md:h-80 w-full">
                                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                            <BarChart data={analytics.subject_performance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis
                                                    dataKey="subject__code"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: '#64748b', fontSize: 10 }}
                                                    dy={10}
                                                />
                                                <YAxis
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: '#64748b', fontSize: 10 }}
                                                />
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                    cursor={{ fill: '#f8fafc' }}
                                                />
                                                <Bar dataKey="avg_score" radius={[4, 4, 0, 0]} maxBarSize={40}>
                                                    {analytics.subject_performance.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.avg_score >= 60 ? '#3b82f6' : entry.avg_score >= 40 ? '#f59e0b' : '#ef4444'} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Top Performers List */}
                                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Top Performers</h3>
                                    <div className="space-y-4">
                                        {analytics.merit_list.slice(0, 5).map((student, index) => (
                                            <div key={student.id} className="flex items-center gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
                                                <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm border-2 shrink-0 ${index === 0 ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                                                    index === 1 ? 'bg-slate-50 border-slate-200 text-slate-700' :
                                                        index === 2 ? 'bg-orange-50 border-orange-200 text-orange-700' :
                                                            'bg-transparent border-transparent text-slate-500'
                                                    }`}>
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-slate-900 dark:text-white truncate">{student.full_name}</p>
                                                    <p className="text-xs text-slate-500">{student.average}% Average</p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="font-mono font-bold text-primary-600">{student.total_marks}</span>
                                                    <p className="text-[10px] text-slate-400 uppercase">Total</p>
                                                </div>
                                            </div>
                                        ))}
                                        {analytics.merit_list.length === 0 && (
                                            <p className="text-center text-slate-400 py-8">No data available.</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Merit List */}
                            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                                <div className="p-5 md:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                                    <div className="text-center md:text-left">
                                        <h3 className="text-lg font-black text-slate-900 dark:text-white">Merit List</h3>
                                        <p className="text-xs md:text-sm text-slate-500 font-medium">Complete class ranking based on assessment results</p>
                                    </div>
                                    <Button variant="outline" size="sm" className="w-full md:w-auto rounded-xl">
                                        <TrendingUp size={16} className="mr-2 text-primary-500" />
                                        Download Report
                                    </Button>
                                </div>

                                {/* Mobile View: Card-based Ranking */}
                                <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                                    {analytics.merit_list.map((student) => (
                                        <div key={student.id} className="p-4 flex items-center gap-4">
                                            <div className="flex flex-col items-center justify-center h-10 w-8 font-mono text-sm font-black text-slate-400 dark:text-slate-600">
                                                #{student.rank}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <p className="font-bold text-slate-900 dark:text-white truncate text-sm">{student.full_name}</p>
                                                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter ${student.grade === 'Exceeding' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                        student.grade === 'Meeting' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                                            student.grade === 'Approaching' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                                                'bg-rose-50 text-rose-600 border border-rose-100'
                                                        }`}>
                                                        {student.grade}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-slate-500 font-medium">
                                                    {student.admission_number} • {student.subjects_sat} Subjects
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-black text-slate-900 dark:text-white">{student.average}%</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{student.total_marks} Pts</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Desktop View: Table */}
                                <div className="hidden md:block overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Rank</th>
                                                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Student</th>
                                                <th className="px-6 py-4 text-center text-xs font-black text-slate-500 uppercase tracking-widest">Subjects</th>
                                                <th className="px-6 py-4 text-right text-xs font-black text-slate-500 uppercase tracking-widest">Total</th>
                                                <th className="px-6 py-4 text-right text-xs font-black text-slate-500 uppercase tracking-widest">Average</th>
                                                <th className="px-6 py-4 text-center text-xs font-black text-slate-500 uppercase tracking-widest">Level</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {analytics.merit_list.map((student) => (
                                                <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                                    <td className="px-6 py-4 font-mono font-bold text-slate-500">#{student.rank}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500 uppercase">
                                                                {student.full_name?.[0]}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-slate-900 dark:text-white text-sm">{student.full_name}</p>
                                                                <p className="text-xs text-slate-400 font-medium">{student.admission_number}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center text-slate-600 dark:text-slate-400 font-medium">
                                                        {student.subjects_sat}
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-mono font-black text-primary-600">
                                                        {student.total_marks}
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-black text-slate-900 dark:text-white">
                                                        {student.average}%
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border ${student.grade === 'Exceeding' ? 'bg-green-50 text-green-700 border-green-100' :
                                                            student.grade === 'Meeting' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                                student.grade === 'Approaching' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                                                    'bg-red-50 text-red-700 border-red-100'
                                                            }`}>
                                                            {student.grade}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
                            <div className="h-20 w-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm mb-6">
                                <BarChart2 size={40} className="text-slate-300 dark:text-slate-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Analytics Data</h3>
                            <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-md">
                                {filters.grade_id
                                    ? "No assessment records found for the selected criteria. Try changing the filters or recording some marks first."
                                    : "Please select a Class and Term using the filters above to view the analysis report."}
                            </p>
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
};

export default Academics;
