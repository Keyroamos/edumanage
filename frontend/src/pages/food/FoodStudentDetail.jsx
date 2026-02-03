import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    ArrowLeft, User, DollarSign, Calendar, Utensils,
    Plus, CreditCard, Trash2, CheckCircle, AlertCircle,
    Printer, Download, ShieldCheck, X, History as HistoryIcon
} from 'lucide-react';
import Button from '../../components/ui/Button';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';

const FoodStudentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview'); // overview, history, settings

    // Modals
    const [showPayModal, setShowPayModal] = useState(false);
    const [showSubModal, setShowSubModal] = useState(false);

    // Transaction Form State
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState('CASH');
    const [desc, setDesc] = useState('');
    const [txType, setTxType] = useState('PAYMENT'); // PAYMENT or CHARGE

    // Subscription Form State
    const [selectedItem, setSelectedItem] = useState('');

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const res = await axios.get(`/api/food/students/${id}/`);
            setData(res.data);

            // Generate some mock chart data if not enough history, 
            // or transform existing transactions for chart
            // For now, let's just use the transactions to build a running balance curve if possible
            // or just simple bar of payments vs charges.
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleTransaction = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`/api/food/students/${id}/`, {
                action: 'TRANSACTION',
                type: txType,
                amount: parseFloat(amount),
                method: method,
                description: desc || (txType === 'PAYMENT' ? 'Payment Received' : 'Manual Charge')
            });
            setShowPayModal(false);
            setAmount('');
            setDesc('');
            fetchData();
        } catch (error) {
            alert('Transaction failed');
        }
    };

    const handleSubscribe = async () => {
        try {
            await axios.post(`/api/food/students/${id}/`, {
                action: 'SUBSCRIBE',
                meal_item_id: selectedItem
            });
            setShowSubModal(false);
            setSelectedItem('');
            fetchData();
        } catch (error) {
            alert('Subscription failed');
        }
    };

    const handleUnsubscribe = async (subId) => {
        if (!confirm('Are you sure you want to cancel this subscription?')) return;
        try {
            await axios.post(`/api/food/students/${id}/`, {
                action: 'UNSUBSCRIBE',
                subscription_id: subId
            });
            fetchData();
        } catch (error) {
            alert('Failed to unsubscribe');
        }
    };

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                <p className="text-slate-500 dark:text-slate-400 animate-pulse">Loading student profile...</p>
            </div>
        </div>
    );

    if (!data) return <div className="p-8 text-center text-slate-500">Student not found</div>;

    const { student, transactions, subscriptions, available_items } = data;

    // Transform transactions for chart (Balance trend)
    // We'll simplisticly show the last 10 transactions
    const chartData = [...transactions].reverse().map((t, idx) => ({
        name: `Tx ${idx + 1}`,
        amount: t.type === 'PAYMENT' ? t.amount : -t.amount,
        type: t.type,
        date: t.date
    }));

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20 animate-fade-in-up">
            {/* Header / Navigation */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/food-portal/students')}
                    className="flex items-center text-slate-500 hover:text-orange-600 transition-colors group"
                >
                    <div className="bg-white dark:bg-slate-800 p-2 rounded-full border border-slate-200 dark:border-slate-700 mr-2 group-hover:border-orange-200 shadow-sm">
                        <ArrowLeft size={16} />
                    </div>
                    <span className="font-medium">Back to Students</span>
                </button>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                        <Printer size={16} />
                        <span className="hidden sm:inline">Statement</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                        <Download size={16} />
                        <span className="hidden sm:inline">Export</span>
                    </button>
                </div>
            </div>

            {/* Main Profile Header */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 dark:bg-orange-900/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                    {/* Avatar side */}
                    <div className="flex-shrink-0">
                        <div className="relative">
                            {student.photo ? (
                                <img
                                    src={student.photo}
                                    alt={student.name}
                                    className="w-32 h-32 rounded-2xl object-cover shadow-lg border-4 border-white dark:border-slate-700"
                                />
                            ) : (
                                <div className="w-32 h-32 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 shadow-lg border-4 border-white dark:border-slate-700">
                                    <User size={48} />
                                </div>
                            )}
                            <div className="absolute -bottom-3 -right-3 bg-emerald-500 text-white p-2 rounded-xl shadow-lg border-4 border-white dark:border-slate-800">
                                <ShieldCheck size={20} />
                            </div>
                        </div>
                    </div>

                    {/* Info Side */}
                    <div className="flex-1 space-y-4">
                        <div>
                            <span className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-wider rounded-lg mb-2">
                                Student Profile
                            </span>
                            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                                {student.name}
                            </h1>
                            <div className="flex flex-wrap gap-4 mt-3 text-slate-500 dark:text-slate-400 text-sm font-medium">
                                <span className="flex items-center gap-1.5">
                                    <User size={16} /> ADM: {student.adm}
                                </span>
                                <span className="w-1 h-1 bg-slate-300 rounded-full self-center"></span>
                                <span className="flex items-center gap-1.5">
                                    <User size={16} /> Grade: {student.grade}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => setShowPayModal(true)}
                                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-2"
                            >
                                <Plus size={18} /> Add Funds / Pay
                            </button>
                            <button
                                onClick={() => setShowSubModal(true)}
                                className="px-6 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-white rounded-xl font-bold shadow-sm transition-all flex items-center gap-2"
                            >
                                <Utensils size={18} /> Add Meal Plan
                            </button>
                        </div>
                    </div>

                    {/* Balance Cards Side */}
                    <div className="w-full md:w-auto min-w-[240px] space-y-3">
                        <div className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700 text-center">
                            <p className="text-xs uppercase font-bold text-slate-400 mb-1 tracking-wider">Available Balance</p>
                            <div className={`text-4xl font-black font-mono tracking-tight ${student.balance > 0 ? 'text-red-500' : 'text-emerald-500'
                                }`}>
                                <span className="text-lg text-slate-400 mr-1">KES</span>
                                {Math.abs(student.balance).toLocaleString()}
                            </div>
                            <p className={`text-xs font-bold mt-2 ${student.balance > 0 ? 'text-red-500 bg-red-50 dark:bg-red-900/20 py-1 px-2 rounded-full inline-block' : 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 py-1 px-2 rounded-full inline-block'
                                }`}>
                                {student.balance > 0 ? 'Outstanding Debt' : 'In Credit / Paid'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                {/* Visual Report & Stats (Left Column) */}
                <div className="space-y-6">
                    {/* Active Subscriptions Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                <Utensils size={20} className="text-orange-500" />
                                Active Plans
                            </h3>
                            <span className="text-xs font-bold bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                                {subscriptions.length} Active
                            </span>
                        </div>

                        <div className="space-y-3">
                            {subscriptions.map((sub) => (
                                <div key={sub.id} className="p-4 bg-orange-50/50 dark:bg-slate-700/30 rounded-2xl border border-orange-100 dark:border-slate-700 group relative overflow-hidden transition-all hover:border-orange-200 dark:hover:border-slate-600">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white">{sub.item_name}</p>
                                            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-medium">
                                                <span className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600">{sub.cycle}</span>
                                                <span>KES {sub.cost.toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleUnsubscribe(sub.id)}
                                            className="p-2 bg-white dark:bg-slate-800 text-slate-400 hover:text-red-500 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors"
                                            title="Cancel Subscription"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {subscriptions.length === 0 && (
                                <div className="text-center py-8 border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-2xl">
                                    <div className="mx-auto w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 mb-2">
                                        <Utensils size={24} />
                                    </div>
                                    <p className="text-slate-400 text-sm">No active meal plans</p>
                                    <button
                                        onClick={() => setShowSubModal(true)}
                                        className="mt-2 text-orange-600 text-xs font-bold hover:underline"
                                    >
                                        + Assign Plan
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mini Spending Chart */}
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                            <DollarSign size={20} className="text-emerald-500" />
                            Recent Activity Trend
                        </h3>
                        <div className="h-40 -mx-2">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="amount" stroke="#10B981" fillOpacity={1} fill="url(#colorAmt)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Ledger / History (Main Column) */}
                <div className="xl:col-span-2">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col h-full min-h-[500px]">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                <HistoryIcon size={20} className="text-orange-500" />
                                Transaction Ledger
                            </h3>
                            <div className="flex gap-2">
                                <select className="text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-500">
                                    <option>All Types</option>
                                    <option>Payments</option>
                                    <option>Charges</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex-1 overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-slate-900/50">
                                    <tr className="border-b border-slate-100 dark:border-slate-700">
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wide">Date & ID</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wide">Description</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wide">Type / Method</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wide text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                                    {transactions.map((t) => (
                                        <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                                            <td className="px-6 py-4">
                                                <p className="font-mono text-xs font-bold text-slate-500">#{t.id}</p>
                                                <p className="text-sm font-medium text-slate-900 dark:text-white">{t.date}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{t.description}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${t.type === 'PAYMENT'
                                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                        }`}>
                                                        {t.type}
                                                    </span>
                                                    {t.method && t.method !== 'SYSTEM' && (
                                                        <span className="text-xs text-slate-400 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-md">
                                                            {t.method}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className={`px-6 py-4 text-right font-mono text-sm font-bold ${t.type === 'PAYMENT' ? 'text-emerald-600' : 'text-slate-800 dark:text-slate-300'
                                                }`}>
                                                {t.type === 'PAYMENT' ? '+' : '-'} {t.amount.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                    {transactions.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-20 text-center">
                                                <div className="flex flex-col items-center justify-center opacity-40">
                                                    <HistoryIcon size={48} className="mb-2" />
                                                    <p>No transaction history found</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODERN PAYMENT MODAL */}
            {showPayModal && (
                <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-all">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg p-0 shadow-2xl animate-scale-in overflow-hidden">
                        <div className="p-6 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Record Transaction</h2>
                            <button onClick={() => setShowPayModal(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 md:p-8">
                            <form onSubmit={handleTransaction} className="space-y-6">
                                {/* Type Selector */}
                                <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 dark:bg-slate-700 rounded-xl">
                                    <button
                                        type="button"
                                        onClick={() => setTxType('PAYMENT')}
                                        className={`py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${txType === 'PAYMENT'
                                            ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-sm'
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                                            }`}
                                    >
                                        <Plus size={16} /> RECIEVE FUNDS
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setTxType('CHARGE')}
                                        className={`py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${txType === 'CHARGE'
                                            ? 'bg-white dark:bg-slate-800 text-red-600 shadow-sm'
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                                            }`}
                                    >
                                        <Utensils size={16} /> CHARGE STUDENT
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Amount (KES)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">KES</span>
                                            <input
                                                type="number"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                required
                                                placeholder="0.00"
                                                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none text-lg font-bold text-slate-900 dark:text-white transition-all"
                                            />
                                        </div>
                                    </div>

                                    {txType === 'PAYMENT' && (
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Payment Method</label>
                                            <select
                                                value={method}
                                                onChange={(e) => setMethod(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-orange-500 outline-none dark:text-white"
                                            >
                                                <option value="CASH">Cash Payment</option>
                                                <option value="MPESA">M-Pesa Transaction</option>
                                                <option value="BANK">Bank Deposit</option>
                                            </select>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Description</label>
                                        <input
                                            type="text"
                                            value={desc}
                                            placeholder={txType === 'PAYMENT' ? "e.g. Term 1 Lunch Payment" : "e.g. Lost Cutlery Fine"}
                                            onChange={(e) => setDesc(e.target.value)}
                                            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-orange-500 outline-none dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <Button type="submit" className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-orange-600/20">
                                        Confirm Transaction
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* SUBSCRIBE MODAL */}
            {showSubModal && (
                <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md p-0 shadow-2xl animate-scale-in overflow-hidden">
                        <div className="p-6 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Assign Meal Plan</h2>
                            <button onClick={() => setShowSubModal(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 md:p-8 space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Choose Plan</label>
                                <select
                                    value={selectedItem}
                                    onChange={(e) => setSelectedItem(e.target.value)}
                                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-orange-500 outline-none dark:text-white"
                                >
                                    <option value="">-- Select Available Item --</option>
                                    {available_items.map(item => (
                                        <option key={item.id} value={item.id}>
                                            {item.name} — KES {item.cost.toLocaleString()} ({item.billing_cycle})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex gap-3 text-blue-700 dark:text-blue-400 text-sm">
                                <AlertCircle size={20} className="shrink-0" />
                                <p>Note: Selecting a plan will <strong>immediately charge</strong> the student's account with the item cost.</p>
                            </div>

                            <Button
                                onClick={handleSubscribe}
                                disabled={!selectedItem}
                                className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold shadow-lg shadow-orange-600/20 disabled:opacity-50 disabled:shadow-none"
                            >
                                Confirm Subscription
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FoodStudentDetail;
