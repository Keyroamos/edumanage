import React, { useState, useEffect } from 'react';
import {
    DollarSign, TrendingUp, TrendingDown, Wallet,
    Calendar, BarChart3,
    Activity, Users, LayoutDashboard, FileText,
    Search, Plus, CheckCircle, Clock, Eye, Download, Filter,
    CreditCard, Settings, Truck, Utensils, X, Edit2, Save, XCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

import Salaries from './Salaries';
import TransportFinanceSummary from './TransportFinanceSummary';
import FoodFinanceSummary from './FoodFinanceSummary';
import StudentFeeSummary from './StudentFeeSummary';
import ArrearsManager from './ArrearsManager';
import Button from '../../components/ui/Button';
import { useSchool } from '../../context/SchoolContext';

const COLORS = ['#4f46e5', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6', '#ec4899'];

const StatCard = ({ title, value, subtext, icon: Icon, color, trend, delay, net }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.4 }}
        className="p-6 rounded-3xl transition-all duration-300 group hover:bg-slate-100 dark:hover:bg-white/5"
    >
        <div className="flex items-start justify-between gap-4">
            <div className="space-y-4 flex-1">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shadow-lg shadow-${color.split('-')[1]}-500/20 group-hover:scale-110 transition-transform`}>
                        <Icon size={20} className="text-white" />
                    </div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{title}</p>
                </div>
                <div>
                    <h3 className={`text-2xl font-black tracking-tight ${net ? (value.includes('-') ? 'text-rose-600' : 'text-emerald-500') : 'text-slate-900 dark:text-white'}`}>
                        {value}
                    </h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase mt-1">{subtext}</p>
                </div>
            </div>
            {trend !== undefined && (
                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black ${trend >= 0 ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'}`}>
                    {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    <span>{Math.abs(trend)}%</span>
                </div>
            )}
        </div>
    </motion.div>
);

const FinanceDashboard = () => {
    const navigate = useNavigate();
    const { config, hasFeature } = useSchool();
    const [data, setData] = useState(null);
    const [feeData, setFeeData] = useState([]);
    const [editingFees, setEditingFees] = useState({});
    const [editMode, setEditMode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [allTransactions, setAllTransactions] = useState([]);
    const [txLoading, setTxLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    const showTransport = hasFeature('TRANSPORT_MANAGEMENT');
    const showFood = hasFeature('FOOD_MANAGEMENT');


    useEffect(() => {
        fetchFinanceData();
    }, []);

    useEffect(() => {
        if (activeTab === 'transactions') fetchAllTransactions('ALL');
        if (activeTab === 'expenses') fetchAllTransactions('EXPENSE');
    }, [activeTab]);

    const fetchFinanceData = async () => {
        if (!data) setLoading(true);
        try {
            const response = await axios.get('/api/finance/');
            setData(response.data);
        } catch (error) {
            console.error('Error fetching finance:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchFeeStructures = async () => {
        try {
            const response = await axios.get('/api/finance/fee-structures/');
            setFeeData(response.data.fee_structures || []);
        } catch (error) {
            console.error('Error fetching fees:', error);
        }
    };

    const handleFeeChange = (id, amount) => {
        setEditingFees(prev => ({ ...prev, [id]: parseFloat(amount) || 0 }));
    };

    const saveFeeUpdates = async () => {
        setIsSaving(true);
        try {
            const updates = Object.entries(editingFees).map(([id, amount]) => ({
                id: parseInt(id),
                amount
            }));
            if (updates.length > 0) {
                await axios.post('/api/finance/fee-structures/update/', { updates });
                await fetchFeeStructures();
                await fetchFinanceData();
                alert('Fee structure updated successfully.');
            }
            setEditingFees({});
            setEditMode(false);
        } catch (error) {
            console.error('Error saving fees:', error);
            alert('Failed to update fees.');
        } finally {
            setIsSaving(false);
        }
    };

    const fetchAllTransactions = async (source = 'ALL') => {
        setTxLoading(true);
        try {
            const response = await axios.get(`/api/finance/transactions/all/?source=${source}`);
            setAllTransactions(response.data.transactions || []);
        } catch (error) {
            console.error('Error fetching all transactions:', error);
        } finally {
            setTxLoading(false);
        }
    };

    const TabButton = ({ id, label, icon: Icon }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 text-[11px] font-black uppercase tracking-widest transition-all rounded-xl whitespace-nowrap min-w-fit ${activeTab === id
                ? 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 shadow-lg shadow-indigo-500/5'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
                }`}
        >
            <Icon size={14} className={activeTab === id ? 'text-indigo-400' : 'text-slate-500'} />
            {label}
        </button>
    );

    if (loading && !data) return (
        <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-950">
            <div className="w-12 h-12 rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-indigo-600 animate-spin"></div>
        </div>
    );

    if (!data) return null;

    const summary = data.summary || {};
    const chartData = data.chart_data || [];
    const totalExpenses = summary.total_expenses || 0;
    const breakdown = summary.expense_breakdown || {};

    const feeGroups = feeData.reduce((acc, fee) => {
        if (!acc[fee.grade]) acc[fee.grade] = {};
        if (!acc[fee.grade][fee.term]) acc[fee.grade][fee.term] = [];
        acc[fee.grade][fee.term].push(fee);
        return acc;
    }, {});

    return (
        <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-6 min-h-screen bg-slate-50/50 dark:bg-slate-950/20 text-slate-900 dark:text-white">
            {(loading || isSaving) && (
                <div className="fixed top-0 left-0 right-0 h-1 z-[60] overflow-hidden">
                    <div className="h-full bg-indigo-600 animate-progress w-full shadow-[0_0_10px_#4f46e5]" />
                </div>
            )}

            <div className="space-y-6 pb-2">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                            <div className="w-2 h-10 bg-indigo-600 rounded-full"></div>
                            Finance Hub
                        </h1>
                    </div>
                </div>

                <div className="flex flex-wrap items-center bg-slate-900/50 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800 shadow-xl gap-1 overflow-x-auto no-scrollbar">
                    <TabButton id="overview" label="Overview" icon={LayoutDashboard} />
                    <TabButton id="transactions" label="Collections" icon={Activity} />
                    <TabButton id="payroll" label="Payroll" icon={Users} />
                    <TabButton id="expenses" label="Expenses" icon={TrendingDown} />
                    <TabButton id="students" label="Student Fees" icon={CreditCard} />
                    <TabButton id="arrears" label="Fee Balances" icon={FileText} />
                    {showTransport && <TabButton id="transport" label="Transport" icon={Truck} />}
                    {showFood && <TabButton id="food" label="Catering" icon={Utensils} />}
                </div>
            </div>

            <div className="relative">
                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatCard title="Net Balance" value={`KES ${((summary.net_profit || 0) / 1000).toFixed(1)}k`} subtext="Income - Expenses" icon={DollarSign} color="bg-indigo-600" net={true} delay={0} />
                                <StatCard title="Total Income" value={`KES ${((summary.total_revenue || 0) / 1000).toFixed(1)}k`} subtext="Fees & others" icon={TrendingUp} color="bg-emerald-600" trend={12} delay={0.1} />
                                <StatCard title="Total Expenses" value={`KES ${(totalExpenses / 1000).toFixed(1)}k`} subtext="Salaries & Ops" icon={TrendingDown} color="bg-rose-600" delay={0.2} />
                                <StatCard title="Runway" value={`${summary.runway || 0} Mo`} subtext="Burn rate based" icon={Activity} color="bg-amber-600" delay={0.3} />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                <div className="lg:col-span-8 bg-white dark:bg-slate-900/40 backdrop-blur-md p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                                    <h3 className="text-xl font-black mb-6">Cash Flow</h3>
                                    <div className="h-[400px] w-full min-h-[400px]">
                                        <ResponsiveContainer width="100%" height={400} minHeight={400}>
                                            <AreaChart data={chartData.length > 0 ? chartData : [{ month: 'N/A', revenue: 0, expenses: 0 }]} margin={{ left: -20, top: 10 }}>
                                                <defs>
                                                    <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient>
                                                    <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} /><stop offset="95%" stopColor="#f43f5e" stopOpacity={0} /></linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.05} />
                                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }} dy={15} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }} tickFormatter={(v) => `${v / 1000}k`} />
                                                <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(10px)', padding: '15px', color: '#fff' }} />
                                                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={6} fill="url(#gIncome)" animationDuration={1000} dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} />
                                                <Area type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={6} fill="url(#gExpense)" animationDuration={1000} dot={{ r: 4, fill: '#f43f5e', strokeWidth: 2, stroke: '#fff' }} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                                <div className="lg:col-span-4 bg-white dark:bg-slate-900/40 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                                    <h3 className="text-xl font-black mb-6">Breakdown</h3>
                                    <div className="flex-1 space-y-8">
                                        {[
                                            { name: 'Salaries', value: breakdown.salaries || 0, color: '#6366f1' },
                                            showTransport && { name: 'Transport', value: breakdown.transport || 0, color: '#3b82f6' },
                                            showFood && { name: 'Food', value: breakdown.food || 0, color: '#f59e0b' },
                                            { name: 'Other', value: breakdown.other || 0, color: '#94a3b8' }
                                        ].filter(Boolean).map((item, idx) => (
                                            <div key={idx}>
                                                <div className="flex justify-between items-end mb-2">
                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.name}</p>
                                                    <p className="text-sm font-black">KES {(item.value / 1000).toFixed(1)}k</p>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div className="h-full rounded-full" style={{ width: totalExpenses > 0 ? `${(item.value / totalExpenses) * 100}%` : 0, backgroundColor: item.color }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'transactions' && (
                        <motion.div key="transactions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                                <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                    <h3 className="text-xl font-black">Ledger</h3>
                                    <select onChange={(e) => fetchAllTransactions(e.target.value)} className="bg-slate-100 dark:bg-slate-800 p-2 rounded-xl text-xs font-bold focus:outline-none text-slate-900 dark:text-white">
                                        <option value="ALL">All Sources</option>
                                        <option value="FEES">Fees</option>
                                        <option value="TRANSPORT">Transport</option>
                                        <option value="FOOD">Food</option>
                                        <option value="EXPENSE">Expenses</option>
                                    </select>
                                </div>
                                <div className="overflow-x-auto min-h-[400px]">
                                    {txLoading ? (
                                        <div className="flex items-center justify-center h-64"><div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin"></div></div>
                                    ) : (
                                        <table className="w-full text-left">
                                            <thead className="bg-slate-50 dark:bg-slate-800/50">
                                                <tr className="text-[10px] font-black uppercase text-slate-500"><th className="px-8 py-4">Title</th><th className="px-8 py-4">Ref</th><th className="px-8 py-4 text-right">Amount</th><th className="px-8 py-4">Date</th></tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                {allTransactions.map((tx, idx) => (
                                                    <tr key={idx} className="hover:bg-slate-50/50">
                                                        <td className="px-8 py-4 font-bold text-xs">{tx.title}</td>
                                                        <td className="px-8 py-4 text-xs font-mono">{tx.reference}</td>
                                                        <td className={`px-8 py-4 text-right text-xs font-black ${tx.type === 'OUTFLOW' ? 'text-rose-600' : 'text-emerald-600'}`}>KES {tx.amount.toLocaleString()}</td>
                                                        <td className="px-8 py-4 text-xs">{tx.date}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'expenses' && (
                        <motion.div key="expenses" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                                <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                    <h3 className="text-xl font-black">Expense Journal</h3>
                                    <Button variant="primary" className="h-9 text-xs font-semibold bg-rose-600 border-none px-4"><Plus size={14} className="mr-2" /> Record Expense</Button>
                                </div>
                                <div className="overflow-x-auto min-h-[400px]">
                                    {txLoading ? (
                                        <div className="flex items-center justify-center h-64"><div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-rose-600 animate-spin"></div></div>
                                    ) : (
                                        <table className="w-full text-left">
                                            <thead className="bg-slate-50 dark:bg-slate-800/50">
                                                <tr className="text-[10px] font-black uppercase text-slate-500"><th className="px-8 py-4">Title</th><th className="px-8 py-4">Ref</th><th className="px-8 py-4 text-right">Amount</th><th className="px-8 py-4">Date</th></tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                {allTransactions.filter(tx => tx.type === 'OUTFLOW' || tx.source === 'EXPENSE').map((tx, idx) => (
                                                    <tr key={idx} className="hover:bg-slate-50/50">
                                                        <td className="px-8 py-4 font-bold text-xs">{tx.title}</td>
                                                        <td className="px-8 py-4 text-xs font-mono">{tx.reference}</td>
                                                        <td className="px-8 py-4 text-right text-xs font-black text-rose-600">KES {tx.amount.toLocaleString()}</td>
                                                        <td className="px-8 py-4 text-xs">{tx.date}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'students' && <motion.div key="students" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><StudentFeeSummary /></motion.div>}
                    {activeTab === 'arrears' && <motion.div key="arrears" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><ArrearsManager /></motion.div>}
                    {activeTab === 'payroll' && <motion.div key="payroll" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><Salaries /></motion.div>}
                    {activeTab === 'transport' && <motion.div key="transport" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><TransportFinanceSummary /></motion.div>}
                    {activeTab === 'food' && <motion.div key="food" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><FoodFinanceSummary /></motion.div>}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default FinanceDashboard;
