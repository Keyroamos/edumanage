import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Wallet, PieChart as PieIcon, BarChart3, Filter, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../../components/ui/Button';

const FinanceReports = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get('/api/finance/reports/');
                setData(res.data);
            } catch (error) {
                console.error("Error fetching reports", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
            <div className="w-12 h-12 rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-indigo-600 animate-spin"></div>
        </div>
    );

    if (!data) return <div className="p-8 text-center text-slate-500">No report data available.</div>;

    const {
        daily_collection = [],
        payment_methods = [],
        debt_by_grade = [],
        comparison = { this_month: 0, last_month: 0 }
    } = data;

    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    const trendPercentage = comparison.last_month > 0
        ? ((comparison.this_month - comparison.last_month) / comparison.last_month) * 100
        : 100;

    return (
        <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-6 min-h-screen bg-slate-50/50 dark:bg-slate-950/20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Financial Intelligence</h1>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Deep dive analytics and performance auditing</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="h-10 px-4 text-xs font-semibold bg-white dark:bg-slate-900 shadow-sm">
                        <Filter size={16} className="mr-2" /> Period
                    </Button>
                    <Button variant="primary" className="h-10 px-4 text-xs font-semibold bg-indigo-600 border-none shadow-sm">
                        <Download size={16} className="mr-2" /> PDF Report
                    </Button>
                </div>
            </div>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
                            <DollarSign className="text-indigo-600" size={20} />
                        </div>
                        <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md ${trendPercentage >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                            {trendPercentage >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            {Math.abs(trendPercentage).toFixed(1)}%
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Revenue (MTD)</p>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">KES {comparison.this_month.toLocaleString()}</h3>
                        <p className="text-[10px] text-slate-400 mt-2 font-medium">Prev Month: {comparison.last_month.toLocaleString()}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-amber-50 dark:bg-amber-500/10 rounded-lg">
                            <Wallet className="text-amber-600" size={20} />
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Peak Arrears</p>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{debt_by_grade[0]?.grade || 'N/A'}</h3>
                        <p className="text-[10px] text-slate-400 mt-2 font-medium">Outstanding: KES {debt_by_grade[0]?.amount.toLocaleString() || '0'}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">
                            <PieIcon className="text-emerald-600" size={20} />
                        </div>
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Primary Channel</p>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{payment_methods[0]?.name || 'N/A'}</h3>
                        <p className="text-[10px] text-slate-400 mt-2 font-medium">Volume: KES {payment_methods[0]?.value.toLocaleString() || '0'}</p>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-8">
                        <TrendingUp size={18} className="text-indigo-600" /> Collection Momentum
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <AreaChart data={daily_collection} margin={{ left: -20 }}>
                                <defs>
                                    <linearGradient id="colAmt" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                                <YAxis tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                                <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={3} fill="url(#colAmt)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-8">
                        <BarChart3 size={18} className="text-amber-500" /> Grade Exposure
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <BarChart data={debt_by_grade} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="grade" type="category" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} axisLine={false} tickLine={false} width={60} />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                                <Bar dataKey="amount" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="flex-1 w-full">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Payment Channels</h3>
                            <p className="text-slate-500 text-xs font-medium mb-8">Revenue source distribution across multiple gateways</p>
                            <div className="space-y-3">
                                {payment_methods.map((entry, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 transition-hover hover:border-indigo-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-tight">{entry.name}</span>
                                        </div>
                                        <span className="text-sm font-black text-slate-900 dark:text-white">KES {entry.value.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="h-64 w-full md:w-1/2 relative flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                <PieChart>
                                    <Pie data={payment_methods} innerRadius={70} outerRadius={90} paddingAngle={8} dataKey="value" cornerRadius={8}>
                                        {payment_methods.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Gateway</span>
                                <span className="text-xl font-bold text-slate-900 dark:text-white">Total</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinanceReports;
