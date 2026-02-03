import React, { useState, useEffect } from 'react';
import {
    DollarSign, TrendingUp, TrendingDown, CreditCard,
    Calendar, Download, Filter, ArrowRight, Wallet,
    PieChart as PieChartIcon, BarChart3, Eye,
    Activity, Truck, Users, LayoutDashboard, Briefcase, ChevronRight, Utensils,
    Search, FileText, CheckCircle, Clock, MoreVertical, Plus, X, Edit2, Save
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

import Salaries from './finance/Salaries';
import TransportFinance from './finance/TransportFinance';
import FoodFinance from './finance/FoodFinance';
import FeeStructure from './finance/FeeStructure';
import Button from '../components/ui/Button';
import { useSchool } from '../context/SchoolContext';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const StatCard = ({ title, value, subtext, icon: Icon, color, trend, delay, net }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.4 }}
        className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-200"
    >
        <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:justify-between sm:text-left gap-4">
            <div className="flex flex-col items-center sm:items-start gap-3">
                <div className="flex flex-col items-center sm:flex-row gap-2">
                    <div className={`p-2 rounded-lg ${color} bg-opacity-10 dark:bg-opacity-20`}>
                        <Icon size={18} className={`${color.replace('bg-', 'text-')} dark:text-opacity-90`} />
                    </div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
                </div>
                <div>
                    <h3 className={`text-2xl font-semibold tracking-tight ${net ? (value.includes('-') ? 'text-rose-600' : 'text-emerald-600') : 'text-slate-900 dark:text-white'}`}>
                        {value}
                    </h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">{subtext}</p>
                </div>
            </div>
            {trend !== undefined && (
                <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold ${trend >= 0 ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10' : 'text-rose-600 bg-rose-50 dark:bg-rose-500/10'}`}>
                    {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    <span>{Math.abs(trend)}%</span>
                </div>
            )}
        </div>
    </motion.div>
);

const Finance = () => {
    const { config } = useSchool();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [searchTerm, setSearchTerm] = useState('');



    const filteredCollections = React.useMemo(() => {
        if (!data || !data.recent_collections) return [];
        return data.recent_collections.filter(tx =>
            tx.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.admission_no.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [data, searchTerm]);



    useEffect(() => {
        fetchFinanceData();
    }, []);

    const fetchFinanceData = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/finance/');
            setData(response.data);
        } catch (error) {
            console.error('Error fetching finance:', error);
        } finally {
            setLoading(false);
        }
    };



    if (loading) return (
        <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-950">
            <div className="relative">
                <div className="h-24 w-24 rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-indigo-600 animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center font-black text-[10px] tracking-widest text-indigo-600 animate-pulse">SYNCING</div>
            </div>
        </div>
    );

    if (!data) return null;

    const summary = data.summary || {};
    const chartData = data.chart_data || [];
    const recentCollections = data.recent_collections || [];
    const recentExpenses = data.recent_expenses || [];
    const totalExpenses = summary.total_expenses || 0;
    const breakdown = summary.expense_breakdown || {};

    const expenseDistribution = [
        { name: 'Salaries', value: breakdown.salaries || 0 },
        { name: 'Transport', value: breakdown.transport || 0 },
        { name: 'Food', value: breakdown.food || 0 },
        { name: 'Other', value: breakdown.other || 0 }
    ].filter(e => e.value > 0);

    const TabButton = ({ id, label, icon: Icon }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all rounded-lg whitespace-nowrap ${activeTab === id
                ? 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-900/30'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
        >
            <Icon size={16} />
            {label}
        </button>
    );

    return (
        <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-6 min-h-screen bg-slate-50/50 dark:bg-slate-950/20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                        Finance Management
                    </h1>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Manage fees, payroll, and school expenditures</p>
                </div>
                <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar gap-1">
                    <TabButton id="overview" label="Overview" icon={LayoutDashboard} />
                    <TabButton id="collections" label="Collections" icon={Wallet} />
                    <TabButton id="fee-structure" label="Fee Structure" icon={DollarSign} />
                    {config.subscription?.plan !== 'Basic' && (
                        <>
                            <TabButton id="payroll" label="Payroll" icon={Users} />
                            <TabButton id="expenses" label="Expenses" icon={FileText} />
                        </>
                    )}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                    >
                        <div className={`grid grid-cols-2 ${config.subscription?.plan === 'Basic' ? 'lg:grid-cols-2' : 'lg:grid-cols-4'} gap-4`}>
                            <StatCard title="Net Balance" value={`${config.currency} ${((summary.net_profit || 0) / 1000).toFixed(1)}k`} subtext="Income - Expenses" icon={DollarSign} color="bg-indigo-600" net={true} delay={0} />
                            <StatCard title="Total Income" value={`${config.currency} ${((summary.total_revenue || 0) / 1000).toFixed(1)}k`} subtext="Fees & others" icon={TrendingUp} color="bg-emerald-600" trend={12} delay={0.1} />
                            {config.subscription?.plan !== 'Basic' && (
                                <>
                                    <StatCard title="Total Expenses" value={`${config.currency} ${(totalExpenses / 1000).toFixed(1)}k`} subtext="Salaries & Ops" icon={TrendingDown} color="bg-rose-600" delay={0.2} />
                                    <StatCard title="Runway" value={`${summary.runway || 0} Mo`} subtext="Burn rate based" icon={Activity} color="bg-amber-600" delay={0.3} />
                                </>
                            )}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Cash Flow</h3>
                                        <p className="text-xs font-medium text-slate-500">Revenue vs Expenditure</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="hidden sm:flex items-center gap-4 text-[11px] font-semibold text-slate-500">
                                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-600"></div>Income</div>
                                            {config.subscription?.plan !== 'Basic' && <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500"></div>Expenses</div>}
                                        </div>
                                        <select className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 p-2 outline-none">
                                            <option>This Year</option>
                                            <option>Last Year</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="h-[350px] w-full relative">
                                    {chartData.length > 0 ? (
                                        <ResponsiveContainer width="99%" height="100%" minWidth={0} minHeight={300}>
                                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1} /><stop offset="95%" stopColor="#4f46e5" stopOpacity={0} /></linearGradient>
                                                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1} /><stop offset="95%" stopColor="#f43f5e" stopOpacity={0} /></linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} dy={10} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} tickFormatter={(val) => `${val / 1000}k`} />
                                                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }} />
                                                <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} fill="url(#colorIncome)" />
                                                {config.subscription?.plan !== 'Basic' && <Area type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={3} fill="url(#colorExpense)" />}
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-slate-400 font-medium text-sm">No data available</div>
                                    )}
                                </div>
                            </div>
                            {config.subscription?.plan !== 'Basic' && (
                                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Expenses</h3>
                                    <p className="text-xs font-medium text-slate-500 mb-6">By Category</p>
                                    <div className="h-64 relative w-full mb-6">
                                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                            <PieChart>
                                                <Pie data={expenseDistribution} innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="value" cornerRadius={4}>
                                                    {expenseDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">Total</span>
                                            <span className="text-xl font-bold text-slate-900 dark:text-white">{(totalExpenses / 1000).toFixed(0)}k</span>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        {(expenseDistribution || []).map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center text-xs font-medium">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                                    <span className="text-slate-600 dark:text-slate-300">{item.name}</span>
                                                </div>
                                                <span className="text-slate-900 dark:text-white uppercase">{config.currency} {item.value.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'collections' && (
                    <motion.div
                        key="collections"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard title="Total Collected" value={`${config.currency} ${((summary.total_revenue || 0) / 1000).toFixed(1)}k`} subtext="Total revenue" icon={Wallet} color="bg-emerald-600" />
                            <StatCard title="Expected Fees" value={`${config.currency} ${((summary.expected_fees || 0) / 1000).toFixed(1)}k`} subtext="Total billings" icon={Calendar} color="bg-blue-600" />
                            <StatCard title="Outstanding" value={`${config.currency} ${((summary.fees_arrears || 0) / 1000).toFixed(1)}k`} subtext="Unpaid total" icon={TrendingDown} color="bg-red-600" />
                            <StatCard title="Collection Rate" value={`${summary.collection_rate || 0}%`} subtext="Target: 85%" icon={BarChart3} color="bg-violet-600" />
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Recent Collections</h3>
                                    <p className="text-xs font-medium text-slate-500 mt-1">Real-time ledger of incoming fee payments</p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <div className="relative">
                                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            placeholder="Search by student, admission or ref..."
                                            className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 outline-none w-full sm:w-64 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <Button variant="outline" className="h-9 px-3 text-xs font-semibold"><Filter size={14} className="mr-2" /> Filter</Button>
                                    <Button variant="primary" className="h-9 px-4 text-xs font-semibold bg-indigo-600 border-none shadow-sm"><Plus size={14} className="mr-2" /> Record Payment</Button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                        <tr className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            <th className="px-6 py-4">Student</th>
                                            <th className="px-6 py-4">Reference</th>
                                            <th className="px-6 py-4">Amount</th>
                                            <th className="px-6 py-4">Channel</th>
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {(filteredCollections || []).length > 0 ? (
                                            filteredCollections.map((tx, idx) => (
                                                <tr key={idx} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-indigo-600 font-bold text-xs ring-1 ring-slate-200 dark:ring-slate-700">
                                                                {tx.student[0]}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-semibold text-slate-900 dark:text-white">{tx.student}</p>
                                                                <p className="text-[10px] font-medium text-slate-500">ADM: {tx.admission_no}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-xs font-mono font-medium text-slate-500 bg-slate-50/50 dark:bg-slate-800/50 px-2 py-1 rounded-md border border-slate-100 dark:border-slate-800">
                                                            {tx.reference}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-bold text-emerald-600">{config.currency} {tx.amount.toLocaleString()}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${tx.method === 'MPESA' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                                                            {tx.method}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs font-medium text-slate-500">{tx.date}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                                                            <CheckCircle size={10} /> Verified
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="px-8 py-16 text-center text-slate-400 font-medium">No results found</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'expenses' && (
                    <motion.div
                        key="expenses"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Expenditure Ledger</h3>
                                    <p className="text-xs font-medium text-slate-500">Detailed record of school outflows</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="primary" className="h-9 px-4 text-xs font-semibold bg-rose-600 border-none shadow-sm"><Plus size={14} className="mr-2" /> Record Expense</Button>
                                    <Button variant="outline" className="h-9 px-3 text-xs font-semibold"><Download size={14} className="mr-2" /> Export</Button>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                        <tr className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            <th className="px-6 py-4">Title</th>
                                            <th className="px-6 py-4">Category</th>
                                            <th className="px-6 py-4">Amount</th>
                                            <th className="px-6 py-4">Payee</th>
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {(recentExpenses || []).map((exp, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="px-6 py-4 font-semibold text-sm text-slate-900 dark:text-white">{exp.title}</td>
                                                <td className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">{exp.category}</td>
                                                <td className="px-6 py-4 text-sm font-bold text-rose-600">{config.currency} {exp.amount.toLocaleString()}</td>
                                                <td className="px-6 py-4 text-xs font-medium text-slate-500">{exp.vendor || 'Staff'}</td>
                                                <td className="px-6 py-4 text-xs font-medium text-slate-500">{exp.date}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <button className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors">
                                                        <Eye size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'fee-structure' && <FeeStructure />}

                {activeTab === 'payroll' && <Salaries />}
                {activeTab === 'transport' && <TransportFinance />}
                {activeTab === 'food' && <FoodFinance />}
            </AnimatePresence>
        </div>
    );
};

export default Finance;
