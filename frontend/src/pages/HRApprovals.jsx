import React, { useState, useEffect } from 'react';
import {
    ClipboardCheck, Calendar, DollarSign, Check, X, Clock, User, MessageSquare, Filter, Search
} from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const ApprovalCard = ({ request, type, onApprove, onReject, userRole }) => {
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [comments, setComments] = useState('');
    const [action, setAction] = useState(null);

    const getStatusColor = (status) => {
        switch (status) {
            case 'APPROVED': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'REJECTED': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case 'PENDING': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
        }
    };

    const handleAction = (actionType) => {
        setAction(actionType);
        setShowCommentModal(true);
    };

    const submitAction = () => {
        if (action === 'approve') {
            onApprove(request.id, comments);
        } else {
            onReject(request.id, comments);
        }
        setShowCommentModal(false);
        setComments('');
    };

    const canApprove = () => {
        // ADMIN/SUPERUSER can approve anything that is still pending overall
        if (userRole === 'ADMIN') {
            return request.status === 'PENDING' || request.hr_status === 'PENDING';
        }

        // Supervisor can only approve their specific stage
        if (userRole === 'SUPERVISOR') {
            return request.supervisor_status === 'PENDING';
        }

        // HR can only approve if supervisor has already cleared it
        if (userRole === 'HR') {
            return request.supervisor_status === 'APPROVED' && request.hr_status === 'PENDING';
        }

        return false;
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 md:p-6 hover:shadow-lg transition-all relative group"
            >
                <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className={`h-14 w-14 md:h-16 md:w-16 rounded-2xl flex items-center justify-center border ${type === 'leave'
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800/50'
                            : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/50'
                            }`}>
                            {type === 'leave' ? (
                                <Calendar size={24} />
                            ) : (
                                <DollarSign size={24} />
                            )}
                        </div>
                        <div>
                            <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                                {request.employee_name}
                            </h3>
                            <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                                {type === 'leave' ? request.leave_type_display : 'Salary Advance'}
                            </p>
                        </div>
                    </div>
                </div>

                {type === 'leave' ? (
                    <div className="space-y-4 mb-6">
                        <div className="flex items-center gap-3 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50">
                            <Calendar size={14} className="text-indigo-500" />
                            <span>{request.start_date} → {request.end_date}</span>
                            <span className="ml-auto bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded text-[10px] text-indigo-600">{request.duration} days</span>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800/50">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Reason for leave</p>
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">"{request.reason}"</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 mb-6">
                        <div className="flex items-center gap-3 text-xs font-bold text-slate-500 dark:text-slate-400 bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-xl border border-emerald-100 dark:border-emerald-800/20">
                            <DollarSign size={14} className="text-emerald-500" />
                            <span className="text-emerald-600 dark:text-emerald-400">Advance Amount:</span>
                            <span className="ml-auto text-sm">KES {parseFloat(request.amount).toLocaleString()}</span>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800/50">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Justification</p>
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">"{request.reason}"</p>
                        </div>
                    </div>
                )}

                {/* Approval Workflow Status */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-5 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verification Status</h4>
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${getStatusColor(request.status)}`}>
                            {request.status}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex flex-col items-center gap-1.5 flex-1">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-sm border ${request.supervisor_status === 'APPROVED' ? 'bg-emerald-500 border-emerald-400 text-white' :
                                request.supervisor_status === 'REJECTED' ? 'bg-rose-500 border-rose-400 text-white' :
                                    'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                                }`}>
                                {request.supervisor_status === 'APPROVED' ? <Check size={16} /> :
                                    request.supervisor_status === 'REJECTED' ? <X size={16} /> :
                                        <Clock size={16} />}
                            </div>
                            <span className="text-[9px] font-bold uppercase tracking-tighter text-slate-500">Supervisor</span>
                        </div>
                        <div className="w-8 h-px bg-slate-100 dark:bg-slate-800 mt-[-14px]"></div>
                        <div className="flex flex-col items-center gap-1.5 flex-1">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-sm border ${request.hr_status === 'APPROVED' ? 'bg-emerald-500 border-emerald-400 text-white' :
                                request.hr_status === 'REJECTED' ? 'bg-rose-500 border-rose-400 text-white' :
                                    'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                                }`}>
                                {request.hr_status === 'APPROVED' ? <Check size={16} /> :
                                    request.hr_status === 'REJECTED' ? <X size={16} /> :
                                        <Clock size={16} />}
                            </div>
                            <span className="text-[9px] font-bold uppercase tracking-tighter text-slate-500">HR/Finance</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">
                    <span>Date Requested</span>
                    <span>{new Date(request.date_requested).toLocaleDateString()}</span>
                </div>

                {canApprove() && (
                    <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <Button
                            variant="outline"
                            className="flex-1 h-11 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs uppercase"
                            onClick={() => handleAction('reject')}
                        >
                            <X size={16} className="mr-2" /> Reject
                        </Button>
                        <Button
                            className="flex-1 h-11 rounded-xl bg-emerald-600 shadow-lg shadow-emerald-500/10 font-bold text-xs uppercase"
                            onClick={() => handleAction('approve')}
                        >
                            <Check size={16} className="mr-2" /> Approve
                        </Button>
                    </div>
                )}
            </motion.div>

            {/* Comment Modal */}
            <AnimatePresence>
                {showCommentModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800"
                        >
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    {action === 'approve' ? 'Approve Request' : 'Reject Request'}
                                </h3>
                            </div>
                            <div className="p-6">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Comments (Optional)
                                </label>
                                <textarea
                                    value={comments}
                                    onChange={(e) => setComments(e.target.value)}
                                    className="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-primary-500 p-3"
                                    rows="4"
                                    placeholder="Add any comments or notes..."
                                ></textarea>
                            </div>
                            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex gap-3 justify-end">
                                <Button variant="secondary" onClick={() => setShowCommentModal(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={submitAction}>
                                    {action === 'approve' ? 'Approve' : 'Reject'}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

const HRApprovals = () => {
    const [activeTab, setActiveTab] = useState('leave');
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [advanceRequests, setAdvanceRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('PENDING');
    const [searchTerm, setSearchTerm] = useState('');
    const [userRole, setUserRole] = useState('ADMIN'); // Default to ADMIN for superuser access

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const [leaveRes, advanceRes] = await Promise.all([
                axios.get('/api/hr/leave-requests/'),
                axios.get('/api/hr/advance-requests/')
            ]);
            setLeaveRequests(leaveRes.data.requests || []);
            setAdvanceRequests(advanceRes.data.requests || []);
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveLeave = async (id, comments) => {
        try {
            await axios.post(`/api/hr/leave-requests/${id}/approve/`, { comments });
            fetchRequests();
        } catch (error) {
            alert('Error approving request');
        }
    };

    const handleRejectLeave = async (id, comments) => {
        try {
            await axios.post(`/api/hr/leave-requests/${id}/reject/`, { comments });
            fetchRequests();
        } catch (error) {
            alert('Error rejecting request');
        }
    };

    const handleApproveAdvance = async (id, comments) => {
        try {
            await axios.post(`/api/hr/advance-requests/${id}/approve/`, { comments });
            fetchRequests();
        } catch (error) {
            alert('Error approving request');
        }
    };

    const handleRejectAdvance = async (id, comments) => {
        try {
            await axios.post(`/api/hr/advance-requests/${id}/reject/`, { comments });
            fetchRequests();
        } catch (error) {
            alert('Error rejecting request');
        }
    };

    const filteredLeaveRequests = (leaveRequests || []).filter(req => {
        const matchesSearch = (req.employee_name || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'ALL' || req.status === filterStatus;
        // Showing all for HR to handle, but prioritizing supervisor approved ones
        return matchesSearch && matchesStatus;
    });

    const filteredAdvanceRequests = (advanceRequests || []).filter(req => {
        const matchesSearch = (req.employee_name || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'ALL' || req.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 bg-slate-50 dark:bg-slate-950 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 md:h-16 md:w-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                <ClipboardCheck size={28} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Staff Approvals</h1>
                                <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Review and action staff requests</p>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 border-b border-slate-100 dark:border-slate-800 overflow-x-auto no-scrollbar scroll-smooth">
                        <button
                            onClick={() => setActiveTab('leave')}
                            className={`px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all relative shrink-0 ${activeTab === 'leave'
                                ? 'text-indigo-600 dark:text-indigo-400'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            <Calendar size={18} className="inline mr-2" />
                            Leave Requests
                            {activeTab === 'leave' && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400"
                                />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('advance')}
                            className={`px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all relative shrink-0 ${activeTab === 'advance'
                                ? 'text-indigo-600 dark:text-indigo-400'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            <DollarSign size={18} className="inline mr-2" />
                            Salary Advances
                            {activeTab === 'advance' && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400"
                                />
                            )}
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 md:p-6 mb-8 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <Input
                            placeholder="Search by employee name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            icon={Search}
                            className="h-11 md:h-12 rounded-xl font-bold"
                        />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full h-11 md:h-12 rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-800 focus:ring-indigo-500 font-bold text-xs px-4"
                        >
                            <option value="ALL">All Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                    </div>
                </div>

                {/* Requests Grid */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        {activeTab === 'leave' ? (
                            filteredLeaveRequests.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredLeaveRequests.map(request => (
                                        <ApprovalCard
                                            key={request.id}
                                            request={request}
                                            type="leave"
                                            onApprove={handleApproveLeave}
                                            onReject={handleRejectLeave}
                                            userRole={userRole}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
                                    <Calendar size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No leave requests found</h3>
                                    <p className="text-slate-500 dark:text-slate-400">All caught up!</p>
                                </div>
                            )
                        ) : (
                            filteredAdvanceRequests.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredAdvanceRequests.map(request => (
                                        <ApprovalCard
                                            key={request.id}
                                            request={request}
                                            type="advance"
                                            onApprove={handleApproveAdvance}
                                            onReject={handleRejectAdvance}
                                            userRole={userRole}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
                                    <DollarSign size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No advance requests found</h3>
                                    <p className="text-slate-500 dark:text-slate-400">All caught up!</p>
                                </div>
                            )
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default HRApprovals;
