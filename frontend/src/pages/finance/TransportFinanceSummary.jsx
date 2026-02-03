import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { motion } from 'framer-motion';
import { Truck, Users, AlertCircle, CheckCircle, TrendingUp, TrendingDown, DollarSign, MapPin } from 'lucide-react';

const COLORS = ['#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

const TransportFinanceSummary = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSummary();
    }, []);

    const fetchSummary = async () => {
        if (!data) setLoading(true);
        try {
            const res = await axios.get('/api/finance/transport-summary/');
            setData(res.data);
        } catch (error) {
            console.error('Error fetching transport finance summary:', error);
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

    const { counts, totals, route_breakdown, expense_breakdown } = data;

    const statusData = [
        { name: 'Debtors', value: counts.debtors, color: '#f43f5e' },
        { name: 'Settled', value: counts.settled, color: '#10b981' }
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
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Transport Analytics</h2>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Fleet Revenue & Operational Expenditure</p>
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
                    title="Active Students"
                    value={counts.total_students}
                    icon={Users}
                    color="bg-indigo-500"
                    subtext="Using transport services"
                />
                <StatCard
                    title="Transport Debtors"
                    value={counts.debtors}
                    icon={AlertCircle}
                    color="bg-rose-500"
                    subtext={`${((counts.debtors / counts.total_students) * 100).toFixed(1)}% of users`}
                />
                <StatCard
                    title="Revenue"
                    value={`KES ${(totals.revenue / 1000).toFixed(1)}k`}
                    icon={CheckCircle}
                    color="bg-emerald-500"
                    subtext="Collected this period"
                />
                <StatCard
                    title="Operations Cost"
                    value={`KES ${(totals.expenses / 1000).toFixed(1)}k`}
                    icon={TrendingDown}
                    color="bg-rose-500"
                    subtext="Fuel & Maintenance"
                />
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">User Payment Status</h3>
                    <div className="h-[300px] min-h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
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
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Net Margin</span>
                            </div>
                            <span className={`text-sm font-black ${totals.net >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                KES {(totals.net / 1000).toFixed(1)}k
                            </span>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white">Student Enrollment by Route</h3>
                        <div className="flex items-center gap-4 text-[10px] font-black uppercase text-slate-400 font-mono tracking-tighter">
                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> Count</div>
                        </div>
                    </div>
                    <div className="h-[400px] min-h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                            <BarChart data={route_breakdown} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} strokeOpacity={0.1} />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                                    contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }}
                                />
                                <Bar dataKey="count" fill="#6366f1" radius={[0, 6, 6, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Detailed Route Table Summary */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">Route Performance Matrix</h3>
                    <MapPin size={20} className="text-slate-300" />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-slate-100 dark:border-slate-800">
                                <th className="px-8 py-4">Route Name</th>
                                <th className="px-8 py-4">Students</th>
                                <th className="px-8 py-4 text-right">Term Cost</th>
                                <th className="px-8 py-4 text-right">Est. Potential</th>
                                <th className="px-8 py-4 text-right">Realized Revenue</th>
                                <th className="px-8 py-4 text-center">Collection %</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {route_breakdown.map((r, idx) => {
                                const potential = r.count * r.cost;
                                const percent = potential > 0 ? (r.revenue / potential) * 100 : 0;
                                return (
                                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-4 text-sm font-bold text-slate-900 dark:text-white">{r.name}</td>
                                        <td className="px-8 py-4">
                                            <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-[10px] font-bold text-indigo-600 uppercase tracking-wider">{r.count} Assigned</span>
                                        </td>
                                        <td className="px-8 py-4 text-right text-xs font-bold text-slate-600 dark:text-slate-400 font-mono">KES {r.cost.toLocaleString()}</td>
                                        <td className="px-8 py-4 text-right text-xs font-bold text-slate-600 dark:text-slate-400 font-mono">KES {potential.toLocaleString()}</td>
                                        <td className="px-8 py-4 text-right text-xs font-black text-emerald-600 font-mono">KES {r.revenue.toLocaleString()}</td>
                                        <td className="px-8 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-12 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-emerald-500 transition-all duration-1000"
                                                        style={{ width: `${percent}%` }}
                                                    />
                                                </div>
                                                <span className="text-[10px] font-black text-slate-500">{percent.toFixed(0)}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot>
                            <tr className="bg-slate-900 text-white font-black uppercase text-[10px] tracking-[0.2em]">
                                <td className="px-8 py-6">Aggregated Fleet Data</td>
                                <td className="px-8 py-6">{counts.total_students} Users</td>
                                <td className="px-8 py-6 text-right">-</td>
                                <td className="px-8 py-6 text-right">-</td>
                                <td className="px-8 py-6 text-right text-emerald-400">KES {totals.revenue.toLocaleString()}</td>
                                <td className="px-8 py-6 text-center text-emerald-400">Arrears: KES {totals.arrears.toLocaleString()}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* Expense Breakdown */}
            {expense_breakdown.length > 0 && (
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">Operations Expense Breakdown</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {expense_breakdown.map((ex, idx) => (
                            <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">{ex.name}</p>
                                <h4 className="text-lg font-black text-rose-600">KES {ex.value.toLocaleString()}</h4>
                                <div className="mt-2 w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full">
                                    <div className="h-full bg-rose-500 rounded-full" style={{ width: `${(ex.value / totals.expenses) * 100}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransportFinanceSummary;
