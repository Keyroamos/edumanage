import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    DollarSign, TrendingUp, Users, Calendar,
    Utensils, ArrowUpRight, ArrowDownRight, Activity,
    CreditCard, AlertCircle, CheckCircle, Clock
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    Cell, PieChart, Pie, Legend, LineChart, Line, Area, AreaChart
} from 'recharts';

const FoodDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('today'); // today, week, month

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await axios.get('/api/food/dashboard/');
            setData(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-orange-50 dark:from-slate-900 dark:to-slate-800">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-600"></div>
                    <Utensils className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-orange-600" size={24} />
                </div>
                <p className="text-slate-600 dark:text-slate-400 font-medium animate-pulse">Loading dashboard...</p>
            </div>
        </div>
    );

    if (!data) return <div className="p-8 text-center">No data available</div>;

    const stats = data.stats || {};
    const billed = stats.billed || 0;
    const collected = stats.collected || 0;
    const collectionRate = billed > 0 ? ((collected / billed) * 100).toFixed(1) : 0;
    const outstandingRate = 100 - collectionRate;

    // Stat cards configuration
    const statCards = [
        {
            title: 'Total Collected',
            value: `KES ${(stats.collected || 0).toLocaleString()}`,
            icon: DollarSign,
            trend: '+12.5%',
            trendUp: true,
            bgGradient: 'from-emerald-500 to-teal-600',
            iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
            iconColor: 'text-emerald-600 dark:text-emerald-400'
        },
        {
            title: 'Outstanding',
            value: `KES ${(stats.outstanding || 0).toLocaleString()}`,
            icon: AlertCircle,
            trend: '-5.2%',
            trendUp: false,
            bgGradient: 'from-red-500 to-pink-600',
            iconBg: 'bg-red-100 dark:bg-red-900/30',
            iconColor: 'text-red-600 dark:text-red-400'
        },
        {
            title: 'Active Subscribers',
            value: stats.active_subscribers || 0,
            icon: Users,
            trend: '+8 new',
            trendUp: true,
            bgGradient: 'from-blue-500 to-indigo-600',
            iconBg: 'bg-blue-100 dark:bg-blue-900/30',
            iconColor: 'text-blue-600 dark:text-blue-400'
        },
        {
            title: "Today's Revenue",
            value: `KES ${(stats.todays_revenue || 0).toLocaleString()}`,
            icon: TrendingUp,
            trend: 'Live',
            trendUp: true,
            bgGradient: 'from-orange-500 to-amber-600',
            iconBg: 'bg-orange-100 dark:bg-orange-900/30',
            iconColor: 'text-orange-600 dark:text-orange-400'
        }
    ];

    // Collection rate data for pie chart
    const pieData = [
        { name: 'Collected', value: parseFloat(collectionRate), color: '#10b981' },
        { name: 'Outstanding', value: parseFloat(outstandingRate), color: '#ef4444' }
    ];

    // Custom colors for bar chart
    const COLORS = ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5'];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pb-20">
            {/* Header Section */}
            <div className="mb-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 to-amber-600/10 dark:from-orange-600/5 dark:to-amber-600/5"></div>
                <div className="relative px-6 py-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                                Food Management
                            </h1>
                            <p className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                                <Activity size={16} className="text-orange-500" />
                                Overview of cafeteria subscriptions and finances
                            </p>
                        </div>

                        {/* Time Range Selector */}
                        <div className="flex gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                            {['Today', 'Week', 'Month'].map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range.toLowerCase())}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${timeRange === range.toLowerCase()
                                        ? 'bg-orange-600 text-white shadow-md'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((stat, index) => (
                        <div
                            key={index}
                            className="group relative bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                        >
                            {/* Gradient Background */}
                            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.bgGradient} opacity-5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:opacity-10 transition-opacity`}></div>

                            <div className="relative z-10">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-3 ${stat.iconBg} rounded-xl`}>
                                        <stat.icon size={24} className={stat.iconColor} />
                                    </div>
                                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${stat.trendUp
                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                        }`}>
                                        {stat.trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                        {stat.trend}
                                    </div>
                                </div>

                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{stat.title}</p>
                                <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Popular Meal Plans - Takes 2 columns */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Utensils size={20} className="text-orange-500" />
                                    Popular Meal Plans
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Active subscriptions by meal type</p>
                            </div>
                        </div>

                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                <BarChart data={(data.popular_plans || []).length > 0 ? data.popular_plans : [{ name: 'N/A', value: 0 }]} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                                    <XAxis
                                        dataKey="name"
                                        angle={-45}
                                        textAnchor="end"
                                        height={100}
                                        tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                                    />
                                    <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1e293b',
                                            border: 'none',
                                            borderRadius: '12px',
                                            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                                            color: '#fff'
                                        }}
                                        cursor={{ fill: 'rgba(249, 115, 22, 0.1)' }}
                                    />
                                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                        {((data.popular_plans || []).length > 0 ? data.popular_plans : [{ value: 0 }]).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Collection Rate Pie Chart */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                            <Activity size={20} className="text-orange-500" />
                            Collection Rate
                        </h3>

                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1e293b',
                                            border: 'none',
                                            borderRadius: '12px',
                                            color: '#fff'
                                        }}
                                        formatter={(value) => `${value}%`}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="space-y-2 mt-4">
                            <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Collected</span>
                                </div>
                                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{collectionRate}%</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Outstanding</span>
                                </div>
                                <span className="text-sm font-black text-red-600 dark:text-red-400">{outstandingRate}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-gradient-to-r from-orange-50/50 to-transparent dark:from-orange-900/10">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Clock size={20} className="text-orange-500" />
                            Recent Activity
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Latest food transactions</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 dark:bg-slate-900/50">
                                <tr className="border-b border-slate-100 dark:border-slate-700">
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Student</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Description</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                                {(data.recent_transactions || []).map((tx) => (
                                    <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-900 dark:text-white">{tx.student}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${tx.type === 'PAYMENT'
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                                                }`}>
                                                {tx.type === 'PAYMENT' ? <CheckCircle size={12} /> : <CreditCard size={12} />}
                                                {tx.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-slate-600 dark:text-slate-400">{tx.description}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-slate-500 dark:text-slate-400 font-mono">{tx.date}</p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <p className={`font-mono font-black text-sm ${tx.type === 'PAYMENT' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-300'
                                                }`}>
                                                {tx.type === 'PAYMENT' ? '+' : '-'} KES {tx.amount.toLocaleString()}
                                            </p>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {(data.recent_transactions || []).length === 0 && (
                            <div className="py-8 px-6 text-left border-t border-slate-100 dark:border-slate-700">
                                <p className="text-slate-400 text-xs italic">No catering ledger entries found for this period.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FoodDashboard;
