import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ChevronLeft, Download, Calendar, BookOpen, Award,
    TrendingUp, TrendingDown, Minus, Printer, Share2,
    BarChart3, PieChart, Activity, Target, CheckCircle, Edit2
} from 'lucide-react';
import Button from '../components/ui/Button';
import axios from 'axios';
import { useSchool } from '../context/SchoolContext';

const StudentAcademicReport = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { config } = useSchool();
    const [academicData, setAcademicData] = useState(null);
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedTerm, setSelectedTerm] = useState('all');

    // Helper to detect if we're in teacher portal
    const isTeacherPortal = () => {
        return window.location.pathname.startsWith('/teacher/');
    };

    const getTeacherId = () => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user?.teacher?.pk || user?.id || '';
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [academicRes, studentRes] = await Promise.all([
                    axios.get(`/api/students/${id}/academics/`),
                    axios.get(`/api/students/${id}/`)
                ]);
                setAcademicData(academicRes.data);
                setStudent(studentRes.data.student);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-primary-600"></div>
                    <p className="text-slate-500 text-sm font-medium">Loading Report...</p>
                </div>
            </div>
        );
    }

    if (!academicData || !student) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 gap-4">
                <Award size={48} className="text-slate-300" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Report Not Found</h2>
                <Button onClick={() => {
                    if (isTeacherPortal()) {
                        const teacherId = getTeacherId();
                        navigate(`/teacher/${teacherId}/student/${id}`);
                    } else {
                        navigate(`/students/${id}`);
                    }
                }}>Back to Profile</Button>
            </div>
        );
    }

    const getPerformanceColor = (level) => {
        const colors = {
            '4': 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
            '3': 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800',
            '2': 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800',
            '1': 'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400 border-rose-200 dark:border-rose-800'
        };
        return colors[level] || 'bg-slate-50 text-slate-700 border-slate-200';
    };

    const getGradeColor = (level) => {
        const colors = {
            '4': 'bg-emerald-500',
            '3': 'bg-blue-500',
            '2': 'bg-amber-500',
            '1': 'bg-rose-500'
        };
        return colors[level] || 'bg-slate-400';
    };

    const filteredRecords = selectedTerm === 'all'
        ? academicData.records
        : { [selectedTerm]: academicData.records[selectedTerm] };

    // Calculate subject averages across all terms
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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="max-w-[1600px] mx-auto px-6 py-3">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => {
                                const user = JSON.parse(localStorage.getItem('user') || '{}');
                                if (isTeacherPortal()) {
                                    const teacherId = getTeacherId();
                                    navigate(`/teacher/${teacherId}/student/${id}`);
                                } else if (user.role === 'student') {
                                    navigate(`/student/${id}`);
                                } else {
                                    navigate(`/students/${id}`);
                                }
                            }}
                            className="group flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                        >
                            <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                            <span className="text-sm font-medium">Back to Profile</span>
                        </button>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="text-xs">
                                <Share2 size={14} className="mr-1.5" />
                                Share
                            </Button>
                            <Button variant="ghost" size="sm" className="text-xs">
                                <Printer size={14} className="mr-1.5" />
                                Print
                            </Button>
                            <Button variant="primary" size="sm" className="text-xs">
                                <Download size={14} className="mr-1.5" />
                                Export PDF
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto px-6 py-6 space-y-6">
                {/* Report Header - Compact */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-10 w-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                                    <Award size={20} className="text-primary-600 dark:text-primary-400" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{config.school_name} Academic Report</h1>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Comprehensive Assessment Analysis</p>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Generated</p>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{new Date().toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Student Name</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{student.personal.full_name}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Admission No.</p>
                            <p className="text-sm font-mono font-semibold text-slate-900 dark:text-white">{student.personal.admission_number}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Grade/Class</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{student.personal.grade}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Overall Average</p>
                            <p className="text-sm font-bold text-primary-600 dark:text-primary-400">{academicData.stats.average_score}%</p>
                        </div>
                    </div>
                </div>

                {/* Analytics Dashboard */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Performance Distribution Chart */}
                    <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Performance Distribution</h3>
                            <PieChart size={16} className="text-slate-400" />
                        </div>

                        <div className="space-y-3">
                            {[
                                { level: '4', label: 'Exceeding', count: academicData.performance_distribution.exceeding, color: 'emerald' },
                                { level: '3', label: 'Meeting', count: academicData.performance_distribution.meeting, color: 'blue' },
                                { level: '2', label: 'Approaching', count: academicData.performance_distribution.approaching, color: 'amber' },
                                { level: '1', label: 'Below', count: academicData.performance_distribution.below, color: 'rose' }
                            ].map((item) => {
                                const percentage = ((item.count / (academicData.stats.total_assessments || 1)) * 100).toFixed(0);
                                return (
                                    <div key={item.level} className="space-y-1.5">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-medium text-slate-700 dark:text-slate-300">{item.label} ({item.level})</span>
                                            <span className="font-bold text-slate-900 dark:text-white">{item.count} <span className="text-slate-400">({percentage}%)</span></span>
                                        </div>
                                        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
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
                    <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Subject Performance Overview</h3>
                            <BarChart3 size={16} className="text-slate-400" />
                        </div>

                        <div className="space-y-2.5">
                            {subjectPerformance.map((subject, idx) => (
                                <div key={idx} className="group">
                                    <div className="flex items-center justify-between text-xs mb-1">
                                        <span className="font-medium text-slate-700 dark:text-slate-300">{subject.name}</span>
                                        <span className="font-bold text-slate-900 dark:text-white">{subject.average}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
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

                {/* Term Filter */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    <button
                        onClick={() => setSelectedTerm('all')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${selectedTerm === 'all'
                            ? 'bg-slate-900 dark:bg-primary-600 text-white shadow-sm'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                            }`}
                    >
                        All Terms
                    </button>
                    {Object.keys(academicData.records).map((term) => (
                        <button
                            key={term}
                            onClick={() => setSelectedTerm(term)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${selectedTerm === term
                                ? 'bg-slate-900 dark:bg-primary-600 text-white shadow-sm'
                                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                                }`}
                        >
                            {term}
                        </button>
                    ))}
                </div>

                {/* Assessment Details */}
                {Object.entries(filteredRecords).map(([term, assessments]) => (
                    <div key={term} className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="h-0.5 w-8 bg-primary-500 rounded-full"></div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{term}</h2>
                        </div>

                        {Object.entries(assessments).map(([type, data]) => {
                            const avgScore = (data.subjects.reduce((sum, s) => sum + s.marks, 0) / data.subjects.length).toFixed(1);

                            return (
                                <motion.div
                                    key={type}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
                                >
                                    <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                                                    <BookOpen size={14} className="text-primary-600 dark:text-primary-400" />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white capitalize">{type.replace('-', ' ')} Assessment</h3>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{data.date}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">Subjects</p>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{data.subjects.length}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">Average</p>
                                                    <p className="text-sm font-bold text-primary-600 dark:text-primary-400">{avgScore}%</p>
                                                </div>
                                                {JSON.parse(localStorage.getItem('user') || '{}').role !== 'student' && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-xs"
                                                        onClick={() => {
                                                            const gradeId = student?.academic?.grade_id || student?.grade_id || '';
                                                            const termNumber = term.replace('Term ', '');
                                                            if (isTeacherPortal()) {
                                                                const teacherId = getTeacherId();
                                                                navigate(`/teacher/${teacherId}/academics?student=${id}&grade=${gradeId}&term=${termNumber}&type=${type}&edit=true`);
                                                            } else {
                                                                navigate(`/academics?student=${id}&grade=${gradeId}&term=${termNumber}&type=${type}&edit=true`);
                                                            }
                                                        }}
                                                    >
                                                        <Edit2 size={14} className="mr-1.5" />
                                                        Edit
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-5">
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b border-slate-100 dark:border-slate-800">
                                                        <th className="px-4 py-2 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Subject</th>
                                                        <th className="px-4 py-2 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Code</th>
                                                        <th className="px-4 py-2 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Score</th>
                                                        <th className="px-4 py-2 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Performance</th>
                                                        <th className="px-4 py-2 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Grade</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                    {data.subjects.map((subject, idx) => (
                                                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                                            <td className="px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white">{subject.subject_name}</td>
                                                            <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 font-mono">{subject.subject_code}</td>
                                                            <td className="px-4 py-3 text-right">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <div className="h-1.5 w-16 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                                        <div
                                                                            className={`h-full ${getGradeColor(subject.performance_level)}`}
                                                                            style={{ width: `${subject.marks}%` }}
                                                                        ></div>
                                                                    </div>
                                                                    <span className="text-sm font-bold text-slate-900 dark:text-white w-12 text-right">{subject.marks}%</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-semibold border ${getPerformanceColor(subject.performance_level)}`}>
                                                                    {subject.performance_label}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                <div className={`inline-flex h-7 w-7 rounded-lg ${getGradeColor(subject.performance_level)} items-center justify-center text-white text-xs font-bold shadow-sm`}>
                                                                    {subject.performance_level}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StudentAcademicReport;
