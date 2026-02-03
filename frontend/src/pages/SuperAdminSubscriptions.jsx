import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    CreditCard, TrendingUp, DollarSign, Calendar,
    CheckCircle, AlertCircle, Download, FileText,
    PieChart, MoreVertical, Search
} from 'lucide-react';

const SuperAdminSubscriptions = () => {
    const [payments, setPayments] = useState([]);
    const [stats, setStats] = useState({
        total_revenue: 0,
        plans: { Enterprise: 0, Standard: 0, Basic: 0 }
    });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [paymentsRes, statsRes] = await Promise.all([
                axios.get('/api/super-portal/subscriptions/'),
                axios.get('/api/super-portal/stats/')
            ]);

            setPayments(paymentsRes.data.payments);
            setStats(statsRes.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching subscription data', error);
            setLoading(false);
        }
    };

    const getPlanColor = (plan) => {
        switch (plan) {
            case 'Enterprise': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
            case 'Standard': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
            case 'Basic': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
        }
    };

    const filteredPayments = filter === 'All'
        ? payments
        : payments.filter(p => p.plan === filter);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight mb-2">SUBSCRIPTION BILLING</h1>
                    <p className="text-slate-500 font-medium text-sm lg:text-base">
                        Global revenue stream and payment transaction history
                    </p>
                </div>

                <div className="flex gap-2">
                    <button className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white hover:border-slate-700 transition-all">
                        <Download size={20} />
                    </button>
                    <div className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 rounded-2xl flex items-center gap-3 shadow-lg shadow-emerald-500/20">
                        <DollarSign size={20} className="text-white" />
                        <span className="text-white font-black tracking-wide">
                            KES {stats.total_revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                {/* Enterprise Revenue */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-8 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-32 bg-purple-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-500/10 transition-all duration-500"></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                                <CreditCard className="text-purple-400" size={24} />
                            </div>
                            <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-black uppercase tracking-widest">
                                Enterprise
                            </span>
                        </div>
                        <h3 className="text-3xl font-black text-white mb-1">{stats.plans?.Enterprise || 0}</h3>
                        <p className="text-slate-500 text-sm font-bold">Active Subscribers</p>
                    </div>
                </div>

                {/* Standard Revenue */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-8 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-32 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/10 transition-all duration-500"></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                                <CreditCard className="text-blue-400" size={24} />
                            </div>
                            <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-widest">
                                Standard
                            </span>
                        </div>
                        <h3 className="text-3xl font-black text-white mb-1">{stats.plans?.Standard || 0}</h3>
                        <p className="text-slate-500 text-sm font-bold">Active Subscribers</p>
                    </div>
                </div>

                {/* Basic Revenue */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-8 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-32 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/10 transition-all duration-500"></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                                <CreditCard className="text-emerald-400" size={24} />
                            </div>
                            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-widest">
                                Basic
                            </span>
                        </div>
                        <h3 className="text-3xl font-black text-white mb-1">{stats.plans?.Basic || 0}</h3>
                        <p className="text-slate-500 text-sm font-bold">Active Subscribers</p>
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] overflow-hidden">
                <div className="p-8 border-b border-slate-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h3 className="text-xl font-black text-white pl-2">Recent Transactions</h3>

                    <div className="flex gap-2">
                        {['All', 'Enterprise', 'Standard', 'Basic'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${filter === f
                                        ? 'bg-white text-slate-950 shadow-lg shadow-white/10'
                                        : 'bg-slate-950 text-slate-500 hover:text-white'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-800/50 bg-slate-950/20">
                                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">School / User</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Plan Type</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Amount</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Date</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Reference</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/30">
                            {filteredPayments.length > 0 ? (
                                filteredPayments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-8 py-5">
                                            <span className="block text-sm font-bold text-white group-hover:text-primary-400 transition-colors">
                                                {payment.school_name}
                                            </span>
                                            <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">{payment.transaction_id}</span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getPlanColor(payment.plan)}`}>
                                                {payment.plan}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-sm font-black text-emerald-400">KES {payment.amount.toLocaleString()}</span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-xs font-bold text-slate-400">{payment.date}</span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-1.5 h-1.5 rounded-full ${payment.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                                                <span className={`text-[10px] font-black uppercase tracking-wider ${payment.status === 'COMPLETED' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                    {payment.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right text-[10px] font-mono text-slate-500">
                                            {payment.reference}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-8 py-12 text-center text-slate-500 text-sm">
                                        No transaction records found matching the criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminSubscriptions;
