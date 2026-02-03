import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { motion } from 'framer-motion';
import { Users, AlertCircle, CheckCircle, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

const COLORS = ['#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

const StudentFeeSummary = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSummary();
    }, []);

    const fetchSummary = async () => {
        if (!data) setLoading(true);
        try {
            const res = await axios.get('/api/finance/student-fee-summary/');
            setData(res.data);
        } catch (error) {
            console.error('Error fetching student fee summary:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !data) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin"></div>
        </div>
    );

    if (!data) return null;

    const counts = data?.counts || { total: 0, debtors: 0, settled: 0, credit: 0 };
    const totals = data?.totals || { billed: 0, paid: 0, outstanding: 0 };
    const grade_breakdown = data?.grade_breakdown || [];

    const statusData = [
        { name: 'Debtors', value: counts?.debtors || 0, color: '#f43f5e' },
        { name: 'Settled', value: counts?.settled || 0, color: '#10b981' },
        { name: 'In Credit', value: counts?.credit || 0, color: '#6366f1' }
    ].filter(d => d.value > 0);

    const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${color} text-white`}>
                    <Icon size={24} />
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider font-mono">{title}</p>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{value}</h3>
                    {subtext && <p className="text-[10px] text-slate-400 mt-1 font-bold">{subtext}</p>}
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Titles */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Student Fee Analytics</h2>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Institutional Billing & Collection Summary</p>
                </div>
                <button
                    onClick={fetchSummary}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-400"
                >
                    <TrendingUp size={20} />
                </button>
            </div>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Students"
                    value={counts.total}
                    icon={Users}
                    color="bg-indigo-500"
                    subtext="Active enrollment"
                />
                <StatCard
                    title="Fee Debtors"
                    value={counts.debtors}
                    icon={AlertCircle}
                    color="bg-rose-500"
                    subtext={`${((counts.debtors / counts.total) * 100).toFixed(1)}% of student body`}
                />
                <StatCard
                    title="Settled Accounts"
                    value={counts.settled}
                    icon={CheckCircle}
                    color="bg-emerald-500"
                    subtext="Full payments made"
                />
                <StatCard
                    title="Total Arrears"
                    value={`KES ${(totals.outstanding / 1000).toFixed(1)}k`}
                    icon={TrendingDown}
                    color="bg-amber-500"
                    subtext="Collectable revenue"
                />
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">Payment Status</h3>
                    <div className="h-[300px] w-full min-h-[300px] relative">
                        <ResponsiveContainer width="99%" height={300} minHeight={300}>
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    innerRadius={80}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    animationDuration={1500}
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-6 flex flex-col gap-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Collection Rate</span>
                            </div>
                            <span className="text-sm font-black text-emerald-600">{((totals.paid / totals.billed) * 100).toFixed(1)}%</span>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white">Arrears by Grade</h3>
                        <div className="flex items-center gap-4 text-[10px] font-black uppercase text-slate-400 font-mono tracking-tighter">
                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> Billed</div>
                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Paid</div>
                        </div>
                    </div>
                    <div className="h-[400px] w-full min-h-[400px] relative">
                        <ResponsiveContainer width="99%" height={400} minHeight={400}>
                            <BarChart data={grade_breakdown} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                                <XAxis
                                    dataKey="grade"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }}
                                    tickFormatter={(v) => `${v / 1000}k`}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                                    contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }}
                                />
                                <Bar dataKey="billed" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={20} />
                                <Bar dataKey="paid" fill="#10b981" radius={[6, 6, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Detailed Table Summary (Counts per grade) */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">Grade Performance Breakdown</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-slate-100 dark:border-slate-800">
                                <th className="px-8 py-4">Grade</th>
                                <th className="px-8 py-4">Students</th>
                                <th className="px-8 py-4 text-right">Total Billed</th>
                                <th className="px-8 py-4 text-right">Total Paid</th>
                                <th className="px-8 py-4 text-right">Outstanding</th>
                                <th className="px-8 py-4 text-center">Collection %</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {grade_breakdown.map((g, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-4 text-sm font-bold text-slate-900 dark:text-white">{g.grade}</td>
                                    <td className="px-8 py-4">
                                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-wider">{g.count} Students</span>
                                    </td>
                                    <td className="px-8 py-4 text-right text-xs font-bold text-slate-600 dark:text-slate-400 font-mono">KES {g.billed.toLocaleString()}</td>
                                    <td className="px-8 py-4 text-right text-xs font-black text-emerald-600 font-mono">KES {g.paid.toLocaleString()}</td>
                                    <td className="px-8 py-4 text-right text-xs font-black text-rose-600 font-mono">KES {g.balance.toLocaleString()}</td>
                                    <td className="px-8 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-12 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-emerald-500 transition-all duration-1000"
                                                    style={{ width: `${g.billed > 0 ? (g.paid / g.billed) * 100 : 0}%` }}
                                                />
                                            </div>
                                            <span className="text-[10px] font-black text-slate-500">{g.billed > 0 ? ((g.paid / g.billed) * 100).toFixed(0) : 0}%</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="bg-slate-900 text-white font-black uppercase text-[10px] tracking-[0.2em]">
                                <td className="px-8 py-6">Aggregated Total</td>
                                <td className="px-8 py-6">{counts.total} Total</td>
                                <td className="px-8 py-6 text-right">KES {totals.billed.toLocaleString()}</td>
                                <td className="px-8 py-6 text-right text-emerald-400">KES {totals.paid.toLocaleString()}</td>
                                <td className="px-8 py-6 text-right text-rose-400">KES {totals.outstanding.toLocaleString()}</td>
                                <td className="px-8 py-6 text-center text-emerald-400">{((totals.paid / totals.billed) * 100).toFixed(1)}% Net</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StudentFeeSummary;
