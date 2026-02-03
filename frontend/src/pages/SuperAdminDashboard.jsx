import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Briefcase, Users, Activity, TrendingUp,
    MapPin, Clock, Server, Zap, CreditCard
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';

const StatCard = ({ icon: Icon, label, value, trend, color }) => (
    <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl relative overflow-hidden group hover:border-primary-500/30 transition-all duration-500">
        <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-${color}-500/10 transition-colors`}></div>
        <div className="relative z-10">
            <div className={`p-3 bg-${color}-500/10 rounded-2xl w-fit text-${color}-500 mb-4 group-hover:scale-110 transition-transform duration-500`}>
                <Icon size={24} />
            </div>
            <p className="text-slate-500 text-[10px] lg:text-xs font-bold uppercase tracking-widest mb-1">{label}</p>
            <div className="flex items-end gap-2 lg:gap-3">
                <h3 className="text-2xl lg:text-3xl font-black text-white">{value}</h3>
                {trend && (
                    <span className="text-emerald-500 text-xs font-bold mb-1 flex items-center gap-1">
                        <TrendingUp size={12} /> {trend}
                    </span>
                )}
            </div>
        </div>
    </div>
);

const SuperAdminDashboard = () => {
    const [stats, setStats] = useState({
        total_schools: 0,
        total_students: 0,
        total_teachers: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await axios.get('/api/super-portal/stats/');
            setStats(response.data);
        } catch (error) {
            toast.error('Failed to sync master stats');
        } finally {
            setLoading(false);
        }
    };

    const chartData = [
        { name: 'Mon', schools: 40 },
        { name: 'Tue', schools: 45 },
        { name: 'Wed', schools: 48 },
        { name: 'Thu', schools: 60 },
        { name: 'Fri', schools: 75 },
        { name: 'Sat', schools: 82 },
        { name: 'Sun', schools: stats.total_schools || 85 },
    ];

    const pieData = [
        { name: 'Enterprise', value: stats.plans?.Enterprise || 0, color: '#a855f7' },
        { name: 'Standard', value: stats.plans?.Standard || 0, color: '#3b82f6' },
        { name: 'Basic', value: stats.plans?.Basic || 0, color: '#64748b' },
    ];

    if (loading) return null;

    return (
        <div className="animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 lg:mb-8">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight mb-2">MASTER COMMAND</h1>
                    <p className="text-slate-500 font-medium tracking-wide text-sm lg:text-base">Infrastructure Overview & System Vitals</p>
                </div>
                <div className="flex items-center gap-4 bg-slate-900/50 p-2 rounded-2xl border border-slate-800">
                    <div className="px-4 py-2 bg-emerald-500/10 rounded-xl flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Core Status: Stable</span>
                    </div>
                    <button onClick={fetchStats} className="p-2 text-slate-500 hover:text-white transition-colors">
                        <Zap size={18} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    icon={Briefcase}
                    label="Registered Schools"
                    value={stats.total_schools || 0}
                    trend="Live Data"
                    color="primary"
                />
                <StatCard
                    icon={CreditCard}
                    label="Monthly Revenue"
                    value={`KES ${(stats.total_revenue || 0).toLocaleString()}`}
                    trend="MRR"
                    color="emerald"
                />
                <StatCard
                    icon={Users}
                    label="Total Population"
                    value={(stats.total_students || 0) + (stats.total_teachers || 0)}
                    trend="+8.2%"
                    color="indigo"
                />
                <StatCard
                    icon={Zap}
                    label="Active Terminals"
                    value={stats.active_terminals || 0}
                    color="amber"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Growth Chart */}
                <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-8 rounded-[3rem]">
                    <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3">
                        <TrendingUp size={20} className="text-primary-500" />
                        Registration Velocity
                    </h3>
                    <div className="h-[250px] lg:h-[300px] w-full min-h-[250px] lg:min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%" debounce={50}>
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorSchools" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="schools" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorSchools)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Plan Breakdown */}
                <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-8 rounded-[3rem]">
                    <h3 className="text-xl font-black text-white mb-6">Subscription Tier Mix</h3>
                    <div className="h-[200px] lg:h-[250px] w-full flex items-center justify-center min-h-[200px] lg:min-h-[250px]">
                        <ResponsiveContainer width="100%" height="100%" debounce={50}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-3 mt-4">
                        {pieData.map((item) => (
                            <div key={item.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                    <span className="text-xs font-bold text-slate-400">{item.name}</span>
                                </div>
                                <span className="text-xs font-black text-white">
                                    {stats.total_schools > 0
                                        ? ((item.value / stats.total_schools) * 100).toFixed(1)
                                        : 0}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* System Alerts */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { icon: Server, label: 'API Response', status: 'Optimal', time: '12ms' },
                    { icon: Zap, label: 'Memory Usage', status: 'Healthy', time: '2.4 GB' },
                    { icon: Clock, label: 'Next Backup', status: 'Scheduled', time: '2:00 AM' },
                    { icon: MapPin, label: 'Global Nodes', status: 'Active', time: '12 Locations' },
                ].map((alert, i) => (
                    <div key={i} className="flex items-center gap-4 bg-slate-950/50 p-4 rounded-2xl border border-slate-900 overflow-hidden relative group">
                        <div className="p-2 bg-slate-900 rounded-xl text-slate-400 group-hover:text-primary-500 transition-colors">
                            <alert.icon size={18} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{alert.label}</p>
                            <p className="text-xs font-bold text-white">{alert.status} <span className="text-slate-600 font-medium ml-1">({alert.time})</span></p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
