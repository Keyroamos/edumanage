import React, { useState } from 'react';
import axios from 'axios';
import { Users, ArrowRight, Calendar, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import Button from '../components/ui/Button';
import { motion } from 'framer-motion';

const AcademicManagement = () => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [selectedTerm, setSelectedTerm] = useState('2');

    const handlePromoteStudents = async () => {
        if (!window.confirm('Are you sure you want to promote ALL students to the next class? This action cannot be undone.')) {
            return;
        }

        setLoading(true);
        setMessage(null);
        try {
            const response = await axios.post('/api/students/promote/');
            setMessage({ type: 'success', text: response.data.message });
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to promote students' });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateTerm = async () => {
        if (!window.confirm(`Are you sure you want to move ALL students to Term ${selectedTerm}?`)) {
            return;
        }

        setLoading(true);
        setMessage(null);
        try {
            const response = await axios.post('/api/students/update-term/', {
                term: selectedTerm
            });
            setMessage({ type: 'success', text: response.data.message });
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to update term' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 md:space-y-10">
            {/* Header Area */}
            <div className="text-center md:text-left space-y-2">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Academic Management</h1>
                <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 font-medium">
                    Orchestrate class promotions and seasonal term transitions
                </p>
            </div>

            {/* Message Display */}
            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 md:p-6 rounded-2xl flex items-center gap-4 ${message.type === 'success'
                        ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/30'
                        : 'bg-rose-50 text-rose-700 border-2 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800/30'
                        }`}
                >
                    <div className={`p-2 rounded-full ${message.type === 'success' ? 'bg-emerald-100 dark:bg-emerald-800' : 'bg-rose-100 dark:bg-rose-800'}`}>
                        {message.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                    </div>
                    <span className="font-bold text-sm md:text-base">{message.text}</span>
                </motion.div>
            )}

            <div className="grid grid-cols-1 gap-6 md:gap-10">
                {/* Class Promotion Card */}
                <div className="bg-white dark:bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-10 shadow-lg shadow-indigo-500/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 opacity-5 -mr-12 -mt-12 group-hover:scale-110 transition-transform">
                        <Users size={160} className="text-indigo-600" />
                    </div>

                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 mb-8">
                            <div className="h-16 w-16 md:h-20 md:w-20 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0">
                                <Users className="text-white" size={32} />
                            </div>
                            <div className="text-center md:text-left">
                                <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                    Annual Promotion
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm md:text-base max-w-2xl">
                                    Move all students to their next grade level. Grade 12 students will be graduated while others advance their academic standing.
                                </p>
                            </div>
                        </div>

                        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-5 md:p-8 border border-amber-200/50 dark:border-amber-800/30 mb-8">
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 bg-amber-500 rounded-xl flex items-center justify-center shrink-0">
                                    <AlertTriangle className="text-white" size={20} />
                                </div>
                                <div className="space-y-3">
                                    <p className="font-bold text-amber-900 dark:text-amber-200 uppercase tracking-widest text-xs">Security Checkpointing</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm font-semibold text-amber-800/80 dark:text-amber-400">
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-amber-500"></div>
                                            Advancement of all students
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-amber-500"></div>
                                            Automatic transition to Term 1
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-amber-500"></div>
                                            Graduation of final year students
                                        </div>
                                        <div className="flex items-center gap-2 underline decoration-amber-500/30">
                                            <div className="h-1.5 w-1.5 rounded-full bg-amber-500"></div>
                                            Irreversible database action
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={handlePromoteStudents}
                            disabled={loading}
                            className="w-full md:w-auto h-12 px-10 rounded-xl bg-indigo-600 hover:bg-slate-900 dark:hover:bg-primary-600 text-white shadow-lg shadow-indigo-500/10 transition-all font-bold"
                        >
                            {loading ? (
                                <>
                                    <RefreshCw size={20} className="mr-3 animate-spin" />
                                    Synchronizing...
                                </>
                            ) : (
                                <>
                                    Advance Academic Year
                                    <ArrowRight size={20} className="ml-3 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Term Update Card */}
                <div className="bg-white dark:bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-10 shadow-lg shadow-emerald-500/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 opacity-5 -mr-12 -mt-12 group-hover:scale-110 transition-transform">
                        <Calendar size={160} className="text-emerald-600" />
                    </div>

                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 mb-8">
                            <div className="h-16 w-16 md:h-20 md:w-20 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 shrink-0">
                                <Calendar className="text-white" size={32} />
                            </div>
                            <div className="text-center md:text-left">
                                <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                    Term Transition
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm md:text-base max-w-2xl">
                                    Set the current active term for the entire institution. This will recalculate all financial obligations and term-specific analytics.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 mb-8">
                            <div>
                                <label className="block text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 text-center md:text-left">
                                    Institution Objective Term
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {[1, 2, 3].map((term) => (
                                        <button
                                            key={term}
                                            onClick={() => setSelectedTerm(term.toString())}
                                            className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${selectedTerm === term.toString()
                                                ? 'border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-[1.02]'
                                                : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400'
                                                }`}
                                        >
                                            <span className={`text-3xl font-bold ${selectedTerm === term.toString() ? 'text-white' : 'text-slate-900 dark:text-white opacity-40'}`}>
                                                0{term}
                                            </span>
                                            <span className={`text-[10px] font-bold uppercase tracking-widest ${selectedTerm === term.toString() ? 'text-emerald-100' : 'text-slate-400'}`}>
                                                Term {term}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-5 md:p-6 border border-blue-200/50 dark:border-blue-800/30 mb-8">
                            <div className="flex items-center gap-4">
                                <div className="h-9 w-9 bg-blue-500 rounded-xl flex items-center justify-center shrink-0">
                                    <AlertTriangle className="text-white" size={18} />
                                </div>
                                <p className="text-xs font-semibold text-blue-800/80 dark:text-blue-400">
                                    Fee structures and academic snapshot datasets will be recalibrated to the selected term immediately.
                                </p>
                            </div>
                        </div>

                        <Button
                            onClick={handleUpdateTerm}
                            disabled={loading}
                            className="w-full md:w-auto h-12 px-10 rounded-xl bg-emerald-600 hover:bg-slate-900 dark:hover:bg-primary-600 text-white shadow-lg shadow-emerald-500/10 transition-all font-bold"
                        >
                            {loading ? (
                                <>
                                    <RefreshCw size={20} className="mr-3 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    Initiate Term {selectedTerm}
                                    <ArrowRight size={20} className="ml-3 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AcademicManagement;
