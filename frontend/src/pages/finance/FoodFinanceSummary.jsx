import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip,
    AreaChart, Area, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { motion } from 'framer-motion';
import { ChefHat, Utensils, TrendingUp, TrendingDown, DollarSign, PieChart as PieIcon, Activity, Users, AlertCircle, ShoppingBag } from 'lucide-react';

const COLORS = ['#f59e0b', '#10b981', '#6366f1', '#f43f5e', '#8b5cf6'];

const FoodFinanceSummary = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSummary();
    }, []);

    const fetchSummary = async () => {
        if (!data) setLoading(true);
        try {
            const res = await axios.get('/api/finance/catering-summary/');
            setData(res.data);
        } catch (error) {
            console.error('Error fetching food finance summary:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !data) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-orange-600 animate-spin"></div>
        </div>
    );

    if (!data) return null;

    const { totals, daily_trend, sources, counts, meal_breakdown } = data;

    const statusData = [
        { name: 'Debtors', value: counts.debtors, color: '#f43f5e' },
        { name: 'Settled', value: counts.settled, color: '#10b981' }
    ].filter(d => d.value > 0);

    const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
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
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Catering Analytics</h2>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Kitchen Revenue & Expenditure Insights</p>
                </div>
                <ChefHat size={32} className="text-orange-500/20" />
            </div>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Active Subscribers"
                    value={counts.total_students}
                    icon={Users}
                    color="bg-indigo-500"
                    subtext="Participating students"
                />
                <StatCard
                    title="Meal Debtors"
                    value={counts.debtors}
                    icon={AlertCircle}
                    color="bg-rose-500"
                    subtext={`KES ${(totals.arrears / 1000).toFixed(1)}k outstanding`}
                />
                <StatCard
                    title="Realized Revenue"
                    value={`KES ${(totals.revenue / 1000).toFixed(1)}k`}
                    icon={TrendingUp}
                    color="bg-emerald-500"
                    subtext="Collected meal payments"
                />
                <StatCard
                    title="Net Margin"
                    value={`KES ${(totals.net / 1000).toFixed(1)}k`}
                    icon={DollarSign}
                    color={totals.net >= 0 ? "bg-orange-500" : "bg-rose-600"}
                    subtext="Operations surplus"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Sources Pie Chart */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <PieIcon size={18} className="text-orange-500" /> Revenue Distribution
                    </h3>
                    <div className="h-[300px] min-h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                            <PieChart>
                                <Pie
                                    data={sources}
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={8}
                                    dataKey="value"
                                    animationDuration={1500}
                                >
                                    {sources.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
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
                </div>

                {/* Daily Trend Area Chart */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <Activity size={18} className="text-emerald-500" /> Daily Revenue (7D)
                    </h3>
                    <div className="h-[300px] min-h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                            <AreaChart data={daily_trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }}
                                />
                                <YAxis
                                    hide
                                />
                                <Tooltip
                                    contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#f59e0b"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorAmt)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/10 rounded-2xl border border-orange-100 dark:border-orange-500/20 text-center">
                        <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">Surplus from operations: KES {totals.net.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Meal Performance Breakdown */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">Subscription Matrix</h3>
                    <ShoppingBag size={20} className="text-slate-300" />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-slate-100 dark:border-slate-800">
                                <th className="px-8 py-4">Meal Plan</th>
                                <th className="px-8 py-4">Subscribers</th>
                                <th className="px-8 py-4 text-right">Subscription Cost</th>
                                <th className="px-8 py-4 text-right">Potential Revenue</th>
                                <th className="px-8 py-4 text-right">Realized Revenue</th>
                                <th className="px-8 py-4 text-center">Collection %</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {meal_breakdown.map((m, idx) => {
                                const potential = m.count * m.cost;
                                const percent = potential > 0 ? (m.revenue / potential) * 100 : 0;
                                return (
                                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-4 text-sm font-bold text-slate-900 dark:text-white">{m.name}</td>
                                        <td className="px-8 py-4">
                                            <span className="px-2.5 py-1 rounded-lg bg-orange-50 dark:bg-orange-500/10 text-[10px] font-bold text-orange-600 uppercase tracking-wider">{m.count} Students</span>
                                        </td>
                                        <td className="px-8 py-4 text-right text-xs font-bold text-slate-600 dark:text-slate-400 font-mono">KES {m.cost.toLocaleString()}</td>
                                        <td className="px-8 py-4 text-right text-xs font-bold text-slate-600 dark:text-slate-400 font-mono">KES {potential.toLocaleString()}</td>
                                        <td className="px-8 py-4 text-right text-xs font-black text-emerald-600 font-mono">KES {m.revenue.toLocaleString()}</td>
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
                                <td className="px-8 py-6">Aggregated Catering Data</td>
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
        </div>
    );
};

export default FoodFinanceSummary;
