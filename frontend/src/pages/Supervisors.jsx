import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, UserCheck, Search, Plus, Eye, Edit, Shield, ChevronRight, Calendar, DollarSign, AlertCircle, X, Check
} from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

// Request Card Components
const LeaveRequestCard = ({ leave, onApprove, onReject }) => {
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [comments, setComments] = useState('');
    const [action, setAction] = useState(null);

    const handleAction = (actionType) => {
        setAction(actionType);
        setShowCommentModal(true);
    };

    const submitAction = () => {
        if (action === 'approve') {
            onApprove(leave.id, comments);
        } else {
            onReject(leave.id, comments);
        }
        setShowCommentModal(false);
        setComments('');
    };

    return (
        <>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/50">
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white">{leave.employee_name}</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{leave.leave_type_display}</p>
                    </div>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded text-xs font-bold">
                        PENDING
                    </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    📅 {leave.start_date} to {leave.end_date} ({leave.duration} days)
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    <strong>Reason:</strong> {leave.reason}
                </p>
                <div className="flex gap-2">
                    <button
                        onClick={() => handleAction('approve')}
                        className="flex-1 py-2 px-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <Check size={16} /> Approve
                    </button>
                    <button
                        onClick={() => handleAction('reject')}
                        className="flex-1 py-2 px-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <X size={16} /> Reject
                    </button>
                </div>
            </div>

            {/* Comment Modal */}
            <AnimatePresence>
                {showCommentModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800"
                        >
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    {action === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request'}
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

const AdvanceRequestCard = ({ advance, onApprove, onReject }) => {
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [comments, setComments] = useState('');
    const [action, setAction] = useState(null);

    const handleAction = (actionType) => {
        setAction(actionType);
        setShowCommentModal(true);
    };

    const submitAction = () => {
        if (action === 'approve') {
            onApprove(advance.id, comments);
        } else {
            onReject(advance.id, comments);
        }
        setShowCommentModal(false);
        setComments('');
    };

    return (
        <>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-900/50">
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white">{advance.employee_name}</h4>
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">KES {parseFloat(advance.amount).toLocaleString()}</p>
                    </div>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded text-xs font-bold">
                        PENDING
                    </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    <strong>Reason:</strong> {advance.reason}
                </p>
                <div className="flex gap-2">
                    <button
                        onClick={() => handleAction('approve')}
                        className="flex-1 py-2 px-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <Check size={16} /> Approve
                    </button>
                    <button
                        onClick={() => handleAction('reject')}
                        className="flex-1 py-2 px-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <X size={16} /> Reject
                    </button>
                </div>
            </div>

            {/* Comment Modal */}
            <AnimatePresence>
                {showCommentModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800"
                        >
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    {action === 'approve' ? 'Approve Salary Advance' : 'Reject Salary Advance'}
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

const SupervisorCard = ({ supervisor, onView }) => {
    const pendingLeaves = supervisor.pending_leaves || 0;
    const pendingAdvances = supervisor.pending_advances || 0;
    const totalSupervised = supervisor.supervised_count || 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 hover:shadow-lg transition-all cursor-pointer"
            onClick={() => onView(supervisor)}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                        {supervisor.first_name[0]}{supervisor.last_name[0]}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            {supervisor.first_name} {supervisor.last_name}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{supervisor.position}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <Shield size={14} className="text-primary-500" />
                            <span className="text-xs font-medium text-primary-600 dark:text-primary-400">Supervisor</span>
                        </div>
                    </div>
                </div>
                <ChevronRight size={20} className="text-slate-400" />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-center">
                    <Users size={20} className="mx-auto text-slate-400 mb-1" />
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalSupervised}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Staff</div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 text-center">
                    <Calendar size={20} className="mx-auto text-yellow-500 mb-1" />
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{pendingLeaves}</div>
                    <div className="text-xs text-yellow-600 dark:text-yellow-400">Leave</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                    <DollarSign size={20} className="mx-auto text-green-500 mb-1" />
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{pendingAdvances}</div>
                    <div className="text-xs text-green-600 dark:text-green-400">Advance</div>
                </div>
            </div>

            {/* Contact */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                    <div>📧 {supervisor.email}</div>
                    <div>📱 {supervisor.phone}</div>
                </div>
            </div>
        </motion.div>
    );
};

const SupervisorDetailModal = ({ supervisor, isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('team');
    const [teamMembers, setTeamMembers] = useState([]);
    const [pendingRequests, setPendingRequests] = useState({ leaves: [], advances: [] });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && supervisor) {
            fetchSupervisorDetails();
        }
    }, [isOpen, supervisor]);

    const fetchSupervisorDetails = async () => {
        setLoading(true);
        try {
            const [teamRes, requestsRes] = await Promise.all([
                axios.get(`/api/hr/supervisors/${supervisor.id}/team/`),
                axios.get(`/api/hr/supervisors/${supervisor.id}/pending-requests/`)
            ]);
            setTeamMembers(teamRes.data.team);
            setPendingRequests(requestsRes.data);
        } catch (error) {
            console.error('Error fetching supervisor details:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !supervisor) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                                {supervisor.first_name[0]}{supervisor.last_name[0]}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {supervisor.first_name} {supervisor.last_name}
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400">{supervisor.position}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-lg transition-colors"
                        >
                            <X size={24} className="text-slate-500" />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 px-6 border-b border-slate-200 dark:border-slate-800">
                    <button
                        onClick={() => setActiveTab('team')}
                        className={`px-4 py-3 font-medium transition-colors relative ${activeTab === 'team'
                            ? 'text-primary-600 dark:text-primary-400'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                    >
                        <Users size={18} className="inline mr-2" />
                        Team Members ({teamMembers.length})
                        {activeTab === 'team' && (
                            <motion.div
                                layoutId="activeDetailTab"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400"
                            />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`px-4 py-3 font-medium transition-colors relative ${activeTab === 'requests'
                            ? 'text-primary-600 dark:text-primary-400'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                    >
                        <AlertCircle size={18} className="inline mr-2" />
                        Pending Requests ({(pendingRequests.leaves?.length || 0) + (pendingRequests.advances?.length || 0)})
                        {activeTab === 'requests' && (
                            <motion.div
                                layoutId="activeDetailTab"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400"
                            />
                        )}
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'team' && (
                                <div className="space-y-3">
                                    {teamMembers.length > 0 ? (
                                        teamMembers.map(member => (
                                            <div
                                                key={member.id}
                                                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold">
                                                        {member.first_name[0]}{member.last_name[0]}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-slate-900 dark:text-white">
                                                            {member.first_name} {member.last_name}
                                                        </h4>
                                                        <p className="text-sm text-slate-500 dark:text-slate-400">{member.staff_type_display || member.position}</p>
                                                    </div>
                                                </div>
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${member.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                    member.status === 'ON_LEAVE' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}>
                                                    {member.status}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12">
                                            <Users size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                                            <p className="text-slate-500 dark:text-slate-400">No team members assigned yet</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'requests' && (
                                <div className="space-y-6">
                                    {/* Leave Requests */}
                                    <div>
                                        <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                            <Calendar size={18} className="text-blue-500" />
                                            Leave Requests
                                        </h3>
                                        {pendingRequests.leaves?.length > 0 ? (
                                            <div className="space-y-3">
                                                {pendingRequests.leaves.map(leave => (
                                                    <LeaveRequestCard
                                                        key={leave.id}
                                                        leave={leave}
                                                        onApprove={async (id, comments) => {
                                                            try {
                                                                await axios.post(`/api/hr/supervisors/leave-requests/${id}/approve/`, { comments });
                                                                fetchSupervisorDetails();
                                                            } catch (error) {
                                                                alert('Error approving request');
                                                            }
                                                        }}
                                                        onReject={async (id, comments) => {
                                                            try {
                                                                await axios.post(`/api/hr/supervisors/leave-requests/${id}/reject/`, { comments });
                                                                fetchSupervisorDetails();
                                                            } catch (error) {
                                                                alert('Error rejecting request');
                                                            }
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-slate-400 italic">No pending leave requests</p>
                                        )}
                                    </div>

                                    {/* Advance Requests */}
                                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                            <DollarSign size={18} className="text-green-500" />
                                            Salary Advance Requests
                                        </h3>
                                        {pendingRequests.advances?.length > 0 ? (
                                            <div className="space-y-3">
                                                {pendingRequests.advances.map(advance => (
                                                    <AdvanceRequestCard
                                                        key={advance.id}
                                                        advance={advance}
                                                        onApprove={async (id, comments) => {
                                                            try {
                                                                await axios.post(`/api/hr/supervisors/advance-requests/${id}/approve/`, { comments });
                                                                fetchSupervisorDetails();
                                                            } catch (error) {
                                                                alert('Error approving request');
                                                            }
                                                        }}
                                                        onReject={async (id, comments) => {
                                                            try {
                                                                await axios.post(`/api/hr/supervisors/advance-requests/${id}/reject/`, { comments });
                                                                fetchSupervisorDetails();
                                                            } catch (error) {
                                                                alert('Error rejecting request');
                                                            }
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-slate-400 italic">No pending advance requests</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex justify-end gap-3">
                        <Button variant="secondary" onClick={onClose}>Close</Button>
                        <Button onClick={() => window.location.href = `/hr/approvals`}>
                            View All Approvals
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const Supervisors = () => {
    const navigate = useNavigate();
    const [supervisors, setSupervisors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSupervisor, setSelectedSupervisor] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    useEffect(() => {
        fetchSupervisors();
    }, []);

    const fetchSupervisors = async () => {
        try {
            const response = await axios.get('/api/hr/supervisors/');
            setSupervisors(response.data.supervisors);
        } catch (error) {
            console.error('Error fetching supervisors:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewSupervisor = (supervisor) => {
        setSelectedSupervisor(supervisor);
        setShowDetailModal(true);
    };

    const filteredSupervisors = supervisors.filter(s =>
        `${s.first_name} ${s.last_name} ${s.email}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPendingLeaves = supervisors.reduce((sum, s) => sum + (s.pending_leaves || 0), 0);
    const totalPendingAdvances = supervisors.reduce((sum, s) => sum + (s.pending_advances || 0), 0);
    const totalSupervised = supervisors.reduce((sum, s) => sum + (s.supervised_count || 0), 0);

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
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
                                <Shield size={28} className="text-primary-600 dark:text-primary-400" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Supervisors</h1>
                                <p className="text-slate-500 dark:text-slate-400">Manage supervisor assignments and team oversight</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Total Supervisors</p>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{supervisors.length}</h3>
                                </div>
                                <Shield size={24} className="text-primary-500" />
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Staff Supervised</p>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{totalSupervised}</h3>
                                </div>
                                <Users size={24} className="text-blue-500" />
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Pending Leaves</p>
                                    <h3 className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{totalPendingLeaves}</h3>
                                </div>
                                <Calendar size={24} className="text-yellow-500" />
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Pending Advances</p>
                                    <h3 className="text-2xl font-bold text-green-600 dark:text-green-400">{totalPendingAdvances}</h3>
                                </div>
                                <DollarSign size={24} className="text-green-500" />
                            </div>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                        <Input
                            placeholder="Search supervisors by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            icon={Search}
                        />
                    </div>
                </div>

                {/* Supervisors Grid */}
                {filteredSupervisors.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredSupervisors.map(supervisor => (
                            <SupervisorCard
                                key={supervisor.id}
                                supervisor={supervisor}
                                onView={handleViewSupervisor}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
                        <Shield size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No supervisors found</h3>
                        <p className="text-slate-500 dark:text-slate-400">Assign supervisors to staff members in the Staff Management section</p>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            <SupervisorDetailModal
                supervisor={selectedSupervisor}
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
            />
        </div>
    );
};

export default Supervisors;
