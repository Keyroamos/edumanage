import React, { useState, useEffect } from 'react';
import { DollarSign, CheckCircle, XCircle, FileText, Calendar, Wallet, Truck, AlertCircle, TrendingUp } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const TransportFinance = () => {
    const [activeTab, setActiveTab] = useState('income');
    const [expenses, setExpenses] = useState([]);
    const [advances, setAdvances] = useState([]);
    const [income, setIncome] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'expenses') {
                const res = await axios.get('/api/transport/finance/expenses/');
                setExpenses(res.data.expenses || []);
            } else if (activeTab === 'advances') {
                const res = await axios.get('/api/transport/finance/advances/');
                setAdvances(res.data.advances || []);
            } else {
                // Fetch Income from unified ledger
                const res = await axios.get('/api/finance/transactions/all/?source=TRANSPORT');
                setIncome(res.data.transactions || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, action) => {
        const url = activeTab === 'expenses' ? '/api/transport/finance/expenses/' : '/api/transport/finance/advances/';
        try {
            await axios.post(url, { id, action });
            fetchData();
        } catch (err) {
            console.error('Action failed');
        }
    };

    const StatusBadge = ({ status }) => (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${status === 'APPROVED' || status === 'INCOME' || status === 'COMPLETED' ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400' :
            status === 'REJECTED' ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400' :
                'bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-500/10 dark:border-amber-200 text-amber-500'
            }`}>
            {status}
        </span>
    );

    const getItems = () => {
        if (activeTab === 'income') return income;
        if (activeTab === 'expenses') return expenses;
        return advances;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                        <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-xl text-indigo-600 dark:text-indigo-400">
                            <Truck size={24} />
                        </div>
                        Transport Finance
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium ml-14 mt-1">Income and Expenditure tracking for the fleet</p>
                </div>

                <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-xl p-1 flex border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => setActiveTab('income')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === 'income' ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                    >
                        <TrendingUp size={14} /> Revenue
                    </button>
                    <button
                        onClick={() => setActiveTab('expenses')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === 'expenses' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                    >
                        <DollarSign size={14} /> Expenses
                    </button>
                    <button
                        onClick={() => setActiveTab('advances')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === 'advances' ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                    >
                        <Wallet size={14} /> Advances
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20"><div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin"></div></div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                <tr className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                    <th className="px-6 py-4">Participant/Source</th>
                                    <th className="px-6 py-4">Details</th>
                                    <th className="px-6 py-4 text-right">Amount</th>
                                    <th className="px-6 py-4">Method/Ref</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {getItems().map((item, index) => (
                                    <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500">
                                                    {(item.driver || item.title || 'U')[0]}
                                                </div>
                                                <span className="text-sm font-bold">{item.driver || item.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-xs text-slate-500 font-medium truncate max-w-[200px]" title={item.description || item.reason || item.title}>
                                                {item.description || item.reason || item.title}
                                            </p>
                                        </td>
                                        <td className={`px-6 py-4 text-right font-black text-sm ${activeTab === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            KES {item.amount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-[10px] font-bold text-slate-500 uppercase">{item.method || 'CASH'}</p>
                                            <p className="text-[10px] font-mono whitespace-nowrap">{item.reference || '-'}</p>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-medium text-slate-500">{item.date}</td>
                                        <td className="px-6 py-4 text-center">
                                            <StatusBadge status={item.status || (activeTab === 'income' ? 'PAID' : 'PENDING')} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {getItems().length === 0 && (
                            <div className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest text-xs">No records found</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
export default TransportFinance;
