import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Wallet, CheckCircle, AlertCircle, XCircle, Clock, Plus, X } from 'lucide-react';

const DriverProfile = () => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    const [leaves, setLeaves] = useState([]);
    const [advances, setAdvances] = useState([]);
    const [activeTab, setActiveTab] = useState('leave');
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [showAdvanceModal, setShowAdvanceModal] = useState(false);

    // Forms
    const [leaveData, setLeaveData] = useState({ start_date: '', end_date: '', reason: '' });
    const [advanceData, setAdvanceData] = useState({ amount: '', reason: '' });

    useEffect(() => {
        fetchLeaves();
        fetchAdvances();
    }, []);

    const fetchLeaves = async () => {
        try { const res = await axios.get('/api/driver/leaves/'); setLeaves(res.data.leaves || []); } catch (e) { }
    };
    const fetchAdvances = async () => {
        try { const res = await axios.get('/api/driver/advances/'); setAdvances(res.data.advances || []); } catch (e) { }
    };

    const submitLeave = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/driver/leaves/', leaveData);
            setShowLeaveModal(false);
            setLeaveData({ start_date: '', end_date: '', reason: '' });
            fetchLeaves();
            alert('Leave request submitted');
        } catch (e) { alert('Failed to submit'); }
    };

    const submitAdvance = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/driver/advances/', advanceData);
            setShowAdvanceModal(false);
            setAdvanceData({ amount: '', reason: '' });
            fetchAdvances();
            alert('Advance request submitted');
        } catch (e) { alert('Failed to submit'); }
    };

    const StatusBadge = ({ status }) => (
        <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wide border ${status === 'APPROVED' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400' :
            status === 'REJECTED' ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-400' :
                'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400'
            }`}>
            {status}
        </span>
    );

    return (
        <div className="space-y-6 pb-20 animate-fade-in-up">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-3xl p-6 shadow-xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                <div className="relative z-10 flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-2xl font-bold backdrop-blur-sm border border-white/30">
                        {user.first_name[0]}{user.last_name[0]}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">{user.first_name} {user.last_name}</h2>
                        <p className="text-indigo-100">Driver Account</p>
                    </div>
                </div>
            </div>

            {/* Quick Actions / Tabs */}
            <div className="flex p-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                <button
                    onClick={() => setActiveTab('leave')}
                    className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'leave' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <Calendar size={18} /> Leaves
                </button>
                <div className="w-px bg-slate-100 dark:bg-slate-700 my-2"></div>
                <button
                    onClick={() => setActiveTab('advance')}
                    className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'advance' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <Wallet size={18} /> Advances
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'leave' ? (
                <div className="space-y-4 animate-fade-in">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-slate-800 dark:text-white">Leave History</h3>
                        <button onClick={() => setShowLeaveModal(true)} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1">
                            <Plus size={14} /> Request Leave
                        </button>
                    </div>
                    {(leaves || []).length === 0 ? <p className="text-slate-500 text-sm text-center py-6">No leave requests.</p> : (
                        (leaves || []).map(l => (
                            <div key={l.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded text-xs font-bold">
                                        {l.start_date} → {l.end_date}
                                    </div>
                                    <StatusBadge status={l.status} />
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-300">{l.reason}</p>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <div className="space-y-4 animate-fade-in">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-slate-800 dark:text-white">Salary Advances</h3>
                        <button onClick={() => setShowAdvanceModal(true)} className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1">
                            <Plus size={14} /> Request Advance
                        </button>
                    </div>
                    {(advances || []).length === 0 ? <p className="text-slate-500 text-sm text-center py-6">No advance requests.</p> : (
                        (advances || []).map(a => (
                            <div key={a.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white text-lg">KES {parseFloat(a.amount).toLocaleString()}</p>
                                    <p className="text-xs text-slate-500">{a.reason}</p>
                                </div>
                                <StatusBadge status={a.status} />
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Modals */}
            {showLeaveModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-scale-in">
                        <div className="flex justify-between mb-4"><h3 className="font-bold dark:text-white">Request Leave</h3><X className="cursor-pointer" onClick={() => setShowLeaveModal(false)} /></div>
                        <form onSubmit={submitLeave} className="space-y-3">
                            <input type="date" required className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white" value={leaveData.start_date} onChange={e => setLeaveData({ ...leaveData, start_date: e.target.value })} placeholder="Start" />
                            <input type="date" required className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white" value={leaveData.end_date} onChange={e => setLeaveData({ ...leaveData, end_date: e.target.value })} placeholder="End" />
                            <textarea required rows="2" className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white" placeholder="Reason" value={leaveData.reason} onChange={e => setLeaveData({ ...leaveData, reason: e.target.value })}></textarea>
                            <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700">Submit Request</button>
                        </form>
                    </div>
                </div>
            )}
            {showAdvanceModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-scale-in">
                        <div className="flex justify-between mb-4"><h3 className="font-bold dark:text-white">Request Advance</h3><X className="cursor-pointer" onClick={() => setShowAdvanceModal(false)} /></div>
                        <form onSubmit={submitAdvance} className="space-y-3">
                            <input type="number" required className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-lg font-bold font-mono" placeholder="Amount (KES)" value={advanceData.amount} onChange={e => setAdvanceData({ ...advanceData, amount: e.target.value })} />
                            <textarea required rows="2" className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white" placeholder="Reason" value={advanceData.reason} onChange={e => setAdvanceData({ ...advanceData, reason: e.target.value })}></textarea>
                            <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700">Submit Request</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
export default DriverProfile;
