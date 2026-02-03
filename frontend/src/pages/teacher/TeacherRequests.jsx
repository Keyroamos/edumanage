import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, DollarSign, Clock, CheckCircle, XCircle, AlertCircle, Plus, FileText, ChevronRight } from 'lucide-react';
import { useParams } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import axios from 'axios';

const TeacherRequests = ({ teacher: propTeacher, onRefresh }) => {
    const { id } = useParams();
    const [teacher, setTeacher] = useState(propTeacher || null);
    const [view, setView] = useState('list'); // list, leave, advance
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(!propTeacher);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Fetch teacher data if not provided via props
    useEffect(() => {
        if (!propTeacher && id) {
            const fetchTeacherData = async () => {
                try {
                    setFetching(true);
                    const response = await axios.get(`/api/teachers/${id}/`);
                    setTeacher(response.data.teacher);
                } catch (error) {
                    console.error("Error fetching teacher:", error);
                    setError("Failed to load profile.");
                } finally {
                    setFetching(false);
                }
            };
            fetchTeacherData();
        } else if (propTeacher) {
            setTeacher(propTeacher);
        }
    }, [propTeacher, id]);

    // Handle refresh for standalone page
    const refreshData = () => {
        if (onRefresh) {
            onRefresh();
        } else if (id) {
            // Re-fetch
            const fetchTeacherData = async () => {
                try {
                    const response = await axios.get(`/api/teachers/${id}/`);
                    setTeacher(response.data.teacher);
                } catch (error) {
                    console.error("Error fetching teacher:", error);
                }
            };
            fetchTeacherData();
        }
    };

    // Determine wrapper classes based on usage
    const wrapperClasses = !propTeacher ? "p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 pb-20" : "";

    // Leave Form State
    const [leaveData, setLeaveData] = useState({
        leave_type: 'CASUAL',
        start_date: '',
        end_date: '',
        reason: ''
    });

    // Advance Form State
    const [advanceData, setAdvanceData] = useState({
        amount: '',
        reason: ''
    });

    const handleLeaveSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await axios.post(`/api/teachers/${teacher.personal.id}/request-leave/`, leaveData);
            setSuccess('Leave request submitted successfully!');
            setTimeout(() => {
                setSuccess(null);
                setView('list');
                refreshData();
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to submit leave request');
        } finally {
            setLoading(false);
        }
    };

    const handleAdvanceSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await axios.post(`/api/teachers/${teacher.personal.id}/request-advance/`, advanceData);
            setSuccess('Salary advance request submitted successfully!');
            setTimeout(() => {
                setSuccess(null);
                setView('list');
                refreshData();
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to submit advance request');
        } finally {
            setLoading(false);
        }
    };

    const StatusBadge = ({ status }) => {
        const styles = {
            PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            APPROVED: 'bg-green-100 text-green-800 border-green-200',
            REJECTED: 'bg-red-100 text-red-800 border-red-200',
        };
        const icons = {
            PENDING: Clock,
            APPROVED: CheckCircle,
            REJECTED: XCircle,
        };
        const Icon = icons[status] || Clock;

        return (
            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[status] || styles.PENDING}`}>
                <Icon size={12} />
                {status}
            </span>
        );
    };

    const LEAVE_TYPES = [
        { value: 'SICK', label: 'Sick Leave' },
        { value: 'CASUAL', label: 'Casual Leave' },
        { value: 'ANNUAL', label: 'Annual Leave' },
        { value: 'MATERNITY', label: 'Maternity Leave' },
        { value: 'PATERNITY', label: 'Paternity Leave' },
        { value: 'STUDY', label: 'Study Leave' },
        { value: 'COMPASSIONATE', label: 'Compassionate Leave' },
    ];

    if (fetching) {
        return (
            <div className={`flex justify-center items-center min-h-[400px] ${wrapperClasses}`}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!teacher && !fetching) {
        return <div className={`p-10 text-center ${wrapperClasses}`}>Teacher profile not found.</div>;
    }

    if (view === 'leave') {
        return (
            <div className={wrapperClasses}>
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                            <Calendar className="text-indigo-500" /> Request Leave
                        </h3>
                        <button onClick={() => setView('list')} className="text-sm text-slate-500 hover:text-indigo-600">
                            Cancel
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 flex items-center gap-2 text-sm">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4 flex items-center gap-2 text-sm">
                            <CheckCircle size={16} /> {success}
                        </div>
                    )}

                    <form onSubmit={handleLeaveSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Leave Type</label>
                            <select
                                className="w-full rounded-xl border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 focus:ring-2 focus:ring-indigo-500 transition-all p-2.5"
                                value={leaveData.leave_type}
                                onChange={(e) => setLeaveData({ ...leaveData, leave_type: e.target.value })}
                                required
                            >
                                {LEAVE_TYPES.map(type => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Start Date"
                                type="date"
                                value={leaveData.start_date}
                                onChange={(e) => setLeaveData({ ...leaveData, start_date: e.target.value })}
                                required
                            />
                            <Input
                                label="End Date"
                                type="date"
                                value={leaveData.end_date}
                                onChange={(e) => setLeaveData({ ...leaveData, end_date: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Reason</label>
                            <textarea
                                className="w-full rounded-xl border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 focus:ring-2 focus:ring-indigo-500 transition-all p-3"
                                rows="4"
                                value={leaveData.reason}
                                onChange={(e) => setLeaveData({ ...leaveData, reason: e.target.value })}
                                required
                                placeholder="Please provide a detailed reason for your leave request..."
                            ></textarea>
                        </div>

                        <div className="pt-2">
                            <Button type="submit" isLoading={loading} className="w-full">
                                Submit Request
                            </Button>
                        </div>
                    </form>
                </div>
            </div >
        );
    }

    if (view === 'advance') {
        return (
            <div className={wrapperClasses}>
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                            <DollarSign className="text-green-500" /> Request Salary Advance
                        </h3>
                        <button onClick={() => setView('list')} className="text-sm text-slate-500 hover:text-indigo-600">
                            Cancel
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 flex items-center gap-2 text-sm">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4 flex items-center gap-2 text-sm">
                            <CheckCircle size={16} /> {success}
                        </div>
                    )}

                    <form onSubmit={handleAdvanceSubmit} className="space-y-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-4">
                            <p className="text-sm text-blue-800 dark:text-blue-300">
                                <strong>Note:</strong> Salary advances are subject to approval and will be deducted from your next payslip.
                                Your current basic salary is <strong>KES {teacher.financial?.basic_salary?.toLocaleString()}</strong>.
                            </p>
                        </div>

                        <Input
                            label="Amount (KES)"
                            type="number"
                            min="1"
                            max={teacher.financial?.basic_salary || 50000}
                            value={advanceData.amount}
                            onChange={(e) => setAdvanceData({ ...advanceData, amount: e.target.value })}
                            required
                            placeholder="e.g. 5000"
                        />

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Reason</label>
                            <textarea
                                className="w-full rounded-xl border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 focus:ring-2 focus:ring-indigo-500 transition-all p-3"
                                rows="4"
                                value={advanceData.reason}
                                onChange={(e) => setAdvanceData({ ...advanceData, reason: e.target.value })}
                                required
                                placeholder="Why do you need this advance?"
                            ></textarea>
                        </div>

                        <div className="pt-2">
                            <Button type="submit" isLoading={loading} className="w-full bg-green-600 hover:bg-green-700 text-white">
                                Submit Request
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className={wrapperClasses}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Recent Leave Requests */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Calendar size={18} className="text-indigo-500" /> Leave History
                            </h3>
                            <Button size="sm" variant="outline" onClick={() => setView('leave')}>
                                <Plus size={16} className="mr-1" /> New Request
                            </Button>
                        </div>
                        <div className="p-0">
                            {teacher.leaves && teacher.leaves.length > 0 ? (
                                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {teacher.leaves.map((leave, idx) => (
                                        <div key={idx} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-medium text-slate-900 dark:text-white">{leave.type}</h4>
                                                <StatusBadge status={leave.status} />
                                            </div>
                                            <div className="text-sm text-slate-500 dark:text-slate-400 flex flex-wrap gap-4 mb-2">
                                                <span>{leave.start_date} - {leave.end_date}</span>
                                            </div>
                                            {leave.reason && (
                                                <p className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg italic">
                                                    "{leave.reason}"
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-slate-500">
                                    <p>No leave history found.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Advance Requests */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <DollarSign size={18} className="text-green-500" /> Advance History
                            </h3>
                            <Button size="sm" variant="outline" onClick={() => setView('advance')}>
                                <Plus size={16} className="mr-1" /> New Advance
                            </Button>
                        </div>
                        <div className="p-0">
                            {teacher.advances && teacher.advances.length > 0 ? (
                                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {teacher.advances.map((advance, idx) => (
                                        <div key={idx} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-bold text-slate-900 dark:text-white">KES {advance.amount.toLocaleString()}</h4>
                                                <StatusBadge status={advance.status} />
                                            </div>
                                            <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                                                Requested on {advance.date}
                                            </div>
                                            {advance.reason && (
                                                <p className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg italic">
                                                    "{advance.reason}"
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-slate-500">
                                    <p>No salary advance history found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Stats / Info Widget */}
                <div className="space-y-6">
                    <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg">
                        <h3 className="font-bold text-lg mb-2">HR Guidelines</h3>
                        <ul className="space-y-3 text-indigo-100 text-sm">
                            <li className="flex gap-2">
                                <CheckCircle size={16} className="shrink-0 mt-0.5" />
                                <span>Leave requests should be submitted at least 3 days in advance unless it's an emergency.</span>
                            </li>
                            <li className="flex gap-2">
                                <CheckCircle size={16} className="shrink-0 mt-0.5" />
                                <span>Salary advances cannot exceed 50% of your basic salary.</span>
                            </li>
                            <li className="flex gap-2">
                                <CheckCircle size={16} className="shrink-0 mt-0.5" />
                                <span>Approvals are processed by your supervisor and the HR department.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherRequests;
