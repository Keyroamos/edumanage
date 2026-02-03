import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Users, GraduationCap, DollarSign, Calendar, TrendingUp, TrendingDown,
    ArrowUpRight, Clock, Lock
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import Button from '../components/ui/Button';
import axios from 'axios';
import { useSchool } from '../context/SchoolContext';

const StatCard = ({ title, value, subtext, icon: Icon, colorClass, trend, onClick }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 rounded-2xl transition-all ${onClick ? 'cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5' : ''}`}
        onClick={onClick}
    >
        <div className="flex justify-center md:justify-between items-center md:items-start w-full mb-3">
            <div className={`p-2.5 rounded-xl shadow-lg ${colorClass} shadow-${colorClass.split('-')[1]}-500/20`}>
                <Icon size={18} className="text-white" />
            </div>
            {trend !== undefined && (
                <div className={`hidden md:flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-black tracking-tighter ${trend >= 0 ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'
                    }`}>
                    {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    <span>{Math.abs(trend)}%</span>
                </div>
            )}
        </div>
        <div className="w-full">
            <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">{title}</p>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">{value}</h3>
            <p className="text-slate-400 dark:text-slate-500 text-[10px] font-medium mt-0.5">{subtext}</p>
        </div>
        {trend !== undefined && (
            <div className={`flex md:hidden items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium mt-2 ${trend >= 0 ? 'text-green-600 bg-green-50 dark:bg-green-900/30' : 'text-red-600 bg-red-50 dark:bg-red-900/30'
                }`}>
                {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                <span>{Math.abs(trend)}%</span>
            </div>
        )}
    </motion.div>
);

const Dashboard = () => {
    const navigate = useNavigate();
    const { config, hasFeature } = useSchool();
    const [stats, setStats] = useState({});
    const [chartData, setChartData] = useState([]);
    const [recentPayments, setRecentPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!stats) setLoading(true);
            try {
                const response = await axios.get('/api/dashboard/');
                setStats(response.data.stats || {});

                // Transform chart data for Recharts with null checks
                const chartDataInfo = response?.data?.chart_data;
                if (chartDataInfo?.labels && chartDataInfo?.revenue) {
                    const formattedChartData = chartDataInfo.labels.map((label, index) => ({
                        name: label,
                        revenue: chartDataInfo.revenue[index] || 0
                    }));
                    setChartData(formattedChartData);
                } else {
                    setChartData([]);
                }

                setRecentPayments(response?.data?.recent_payments || []);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                // Set default values on error
                setStats({});
                setChartData([]);
                setRecentPayments([]);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading && !stats) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    // Get current time greeting
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <div className="p-4 max-w-7xl mx-auto space-y-4">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-4 text-white shadow-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold mb-0.5">
                            {getGreeting()}, {user.first_name || 'Admin'}! 👋
                        </h1>
                        <p className="text-primary-100 text-xs">
                            Here's what's happening with {config.school_name} today
                        </p>
                    </div>
                    <div className="hidden md:flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl">
                        <Clock size={18} />
                        <span className="text-sm font-medium">
                            {new Date().toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <StatCard
                    title="Total Students"
                    value={stats?.total_students || 0}
                    subtext={`${stats?.new_students || 0} joined this month`}
                    icon={Users}
                    colorClass="bg-blue-500"
                    onClick={() => navigate('/students')}
                />
                {hasFeature('FINANCE_MANAGEMENT') ? (
                    <StatCard
                        title="Total Revenue"
                        value={`KES ${(stats?.total_revenue || 0).toLocaleString()}`}
                        subtext="Total fees collected"
                        icon={DollarSign}
                        colorClass="bg-emerald-500"
                        onClick={() => navigate('/finance')}
                    />
                ) : (
                    <StatCard
                        title="Total Revenue"
                        value={<Lock size={28} className="text-slate-400 mt-1" />}
                        subtext="Standard plan required"
                        icon={DollarSign}
                        colorClass="bg-slate-400"
                        onClick={() => navigate('/subscription')}
                    />
                )}
                <StatCard
                    title="Teaching Staff"
                    value={stats?.total_teachers || 0}
                    subtext="Active teachers"
                    icon={GraduationCap}
                    colorClass="bg-violet-500"
                    onClick={() => navigate('/teachers')}
                />
                <StatCard
                    title="Attendance Rate"
                    value={`${stats?.attendance_rate || 0}%`}
                    subtext="Today's attendance"
                    icon={Calendar}
                    colorClass="bg-amber-500"
                />
            </div>

            {/* Charts & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart */}
                <div className="lg:col-span-2 bg-white/50 dark:bg-slate-900/50 p-4 rounded-2xl border border-transparent relative overflow-hidden">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight uppercase">Revenue Analytics</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Monthly fee collection trends</p>
                        </div>
                        <select className="bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm px-4 py-2 text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-primary-100 focus:outline-none font-bold">
                            <option>Last 6 Months</option>
                            <option>This Year</option>
                        </select>
                    </div>

                    {!hasFeature('FINANCE_MANAGEMENT') ? (
                        <div className="h-80 w-full flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                            <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4 shadow-sm">
                                <Lock size={28} />
                            </div>
                            <p className="text-xs text-slate-500 mb-6 font-medium">Standard Edition Required</p>
                            <Button size="sm" onClick={() => navigate('/subscription')}>View Plans</Button>
                        </div>
                    ) : (
                        <div className="h-80 w-full min-h-[320px]">
                            <ResponsiveContainer width="99%" height={320} minHeight={320}>
                                <AreaChart data={chartData.length > 0 ? chartData : [{ name: 'N/A', revenue: 0 }]}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" strokeOpacity={0.1} />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748b', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748b', fontSize: 12 }}
                                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '20px',
                                            border: 'none',
                                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                            padding: '16px',
                                            backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                            backdropFilter: 'blur(8px)',
                                            color: '#fff'
                                        }}
                                        formatter={(value) => [`KES ${value.toLocaleString()}`, 'Revenue']}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#10b981"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorRevenue)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Recent Payments */}
                <div className="bg-white/50 dark:bg-slate-900/50 p-4 rounded-2xl border border-transparent">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight uppercase tracking-widest">Recent Payments</h3>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">Latest transactions</p>
                        </div>
                        {hasFeature('FINANCE_MANAGEMENT') && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-primary-600 hover:bg-primary-50"
                                onClick={() => navigate('/finance')}
                            >
                                <ArrowUpRight size={16} />
                            </Button>
                        )}
                    </div>

                    {!hasFeature('FINANCE_MANAGEMENT') ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl blur-[2px] opacity-40">
                                    <div className="flex items-center space-x-3">
                                        <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800" />
                                        <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
                                    </div>
                                    <div className="h-4 w-12 bg-slate-200 dark:bg-slate-800 rounded" />
                                </div>
                            ))}
                            <div className="text-center pt-2">
                                <div className="flex justify-center mb-2">
                                    <Lock size={14} className="text-slate-400" />
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Premium History</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {recentPayments.length > 0 ? (
                                recentPayments.map((payment) => (
                                    <div
                                        key={payment.id}
                                        className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700 cursor-pointer"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 font-bold text-sm">
                                                {payment.student_name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900 dark:text-white">{payment.student_name}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{payment.date}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-green-600 dark:text-green-400">+KES {payment.amount.toLocaleString()}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{payment.method}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-2">
                                    <p className="text-slate-400 text-xs italic">No activity recorded for this period</p>
                                </div>
                            )}
                        </div>
                    )}

                    {hasFeature('FINANCE_MANAGEMENT') ? (
                        <Button
                            variant="outline"
                            className="w-full mt-4"
                            onClick={() => navigate('/finance')}
                        >
                            {recentPayments.length > 0 ? 'View All Transactions' : 'Go to Finance Center'}
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            className="w-full mt-4 border-dashed"
                            onClick={() => navigate('/subscription')}
                        >
                            Unlock Finance Center
                        </Button>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <button
                    onClick={() => navigate('/students/create')}
                    className="p-4 rounded-3xl transition-all text-left group hover:bg-slate-100 dark:hover:bg-white/5"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl group-hover:scale-110 transition-transform">
                            <Users className="text-blue-600 dark:text-blue-400" size={20} />
                        </div>
                        <div>
                            <p className="font-black text-slate-900 dark:text-white text-sm">New Student</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Register a new student</p>
                        </div>
                    </div>
                </button>

                <button
                    onClick={() => navigate('/teachers/create')}
                    className="p-4 rounded-3xl transition-all text-left group hover:bg-slate-100 dark:hover:bg-white/5"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-violet-100 dark:bg-violet-900/30 rounded-2xl group-hover:scale-110 transition-transform">
                            <GraduationCap className="text-violet-600 dark:text-violet-400" size={20} />
                        </div>
                        <div>
                            <p className="font-black text-slate-900 dark:text-white text-sm">Add Teacher</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Register new staff</p>
                        </div>
                    </div>
                </button>

                <button
                    onClick={() => navigate('/schedule')}
                    className="p-4 rounded-3xl transition-all text-left group hover:bg-slate-100 dark:hover:bg-white/5"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-2xl group-hover:scale-110 transition-transform">
                            <Calendar className="text-amber-600 dark:text-amber-400" size={20} />
                        </div>
                        <div>
                            <p className="font-black text-slate-900 dark:text-white text-sm">View Schedule</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Check timetable</p>
                        </div>
                    </div>
                </button>
            </div>
        </div>
    );
};

export default Dashboard;
