import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    ArrowLeft, User, Download, Plus,
    CreditCard, Wallet, Receipt, Calendar,
    TrendingUp, TrendingDown, CheckCircle, FileText
} from 'lucide-react';
import Button from '../../components/ui/Button';

const FinanceStudentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Transaction Form State
    const [txForm, setTxForm] = useState({
        type: 'PAYMENT',
        amount: '',
        description: '',
        payment_method: 'CASH',
        reference: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchDetails();
    }, [id]);

    const fetchDetails = async () => {
        try {
            const res = await axios.get(`/api/finance/students/${id}/`);
            setData(res.data);
        } catch (error) {
            console.error("Error fetching ledger", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await axios.post(`/api/finance/students/${id}/`, txForm);
            setShowModal(false);
            setTxForm({
                type: 'PAYMENT',
                amount: '',
                description: '',
                payment_method: 'CASH',
                reference: ''
            });
            fetchDetails();
        } catch (error) {
            alert("Failed to record transaction");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
    );

    if (!data) return <div className="p-12 text-center text-slate-500 text-lg">Student account not found.</div>;

    const { student, transactions } = data;

    // Calculate stats
    const totalBilled = student.total_billed || 0;
    const totalPaid = student.total_paid || 0;
    const balance = student.balance || 0;
    const lastTx = transactions.length > 0 ? transactions[0] : null;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fade-in-up">
            {/* Navigation Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/finance-portal/accounts')}
                    className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Student Ledger</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Financial history and billing management</p>
                </div>
                <div className="ml-auto flex gap-3">
                    <Button variant="outline" className="gap-2 hidden md:flex">
                        <Download size={18} /> Export Statement
                    </Button>
                    <Button onClick={() => setShowModal(true)} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20">
                        <Plus size={18} /> New Transaction
                    </Button>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Student Profile & Key Stats */}
                <div className="space-y-6">
                    {/* Profile Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-emerald-600 to-teal-500 opacity-10"></div>

                        <div className="relative flex flex-col items-center text-center">
                            <div className="h-28 w-28 rounded-full p-1 bg-white dark:bg-slate-800 shadow-md mb-4 ring-2 ring-emerald-100 dark:ring-emerald-900/30">
                                <div className="h-full w-full rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700">
                                    {student.avatar ? (
                                        <img src={student.avatar} alt={student.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full w-full text-slate-400">
                                            <User size={48} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{student.name}</h2>
                            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-800/50">
                                {student.admission_number}
                            </p>

                            <div className="mt-6 w-full grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-700 pt-6">
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Grade</p>
                                    <p className="text-slate-900 dark:text-white font-medium">{student.grade || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Status</p>
                                    <p className="text-slate-900 dark:text-white font-medium">Active</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Balance & Overview Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-6">Financial Overview</h3>

                        <div className="space-y-6">
                            {/* Current Balance - Main Highlight */}
                            <div className={`p-5 rounded-xl border ${balance > 0
                                ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-800/30'
                                : balance < 0
                                    ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/30'
                                    : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700'
                                }`}>
                                <div className="flex justify-between items-start mb-1">
                                    <p className={`text-xs font-bold uppercase tracking-wide ${balance > 0 ? 'text-amber-600 dark:text-amber-400' : balance < 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'
                                        }`}>Current Balance</p>
                                    {balance > 0 ? <TrendingUp size={16} className="text-amber-500" /> : balance < 0 ? <TrendingDown size={16} className="text-emerald-500" /> : <CheckCircle size={16} className="text-slate-400" />}
                                </div>
                                <div className={`text-3xl font-extrabold ${balance > 0 ? 'text-amber-700 dark:text-amber-400' : balance < 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'
                                    }`}>
                                    {balance > 0 ? '' : balance < 0 ? '+' : ''}{Math.abs(balance).toLocaleString()} KES
                                </div>
                                <p className="text-xs text-slate-500 mt-2">
                                    {balance > 0 ? 'Student owes this amount' : balance < 0 ? 'Student has excess credit' : 'Account is fully settled'}
                                </p>
                            </div>

                            {/* Mini Stats (Billed vs Paid) */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-2 mb-2 text-slate-500">
                                        <Receipt size={14} />
                                        <span className="text-xs font-semibold uppercase">Total Billed</span>
                                    </div>
                                    <p className="text-lg font-bold text-slate-800 dark:text-white">{totalBilled.toLocaleString()}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-2 mb-2 text-slate-500">
                                        <Wallet size={14} />
                                        <span className="text-xs font-semibold uppercase">Total Paid</span>
                                    </div>
                                    <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{totalPaid.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Transaction History */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col h-full">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                                <Calendar size={18} className="text-emerald-500" />
                                Transaction History
                            </h3>
                            <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                                {transactions.length} records
                            </span>
                        </div>

                        <div className="overflow-x-auto flex-1">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Reference</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {transactions.map((t) => (
                                        <tr
                                            key={t.id}
                                            className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                                            onClick={() => navigate(`/finance-portal/transactions/${t.id}`)}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium">
                                                {t.date}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-slate-900 dark:text-white">{t.description}</span>
                                                    <span className="text-xs text-slate-400 hidden group-hover:inline-block transition-opacity">
                                                        Created via {t.method}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-slate-500">
                                                {t.reference || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${t.type === 'INVOICE'
                                                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-100 dark:border-blue-800'
                                                    : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800'
                                                    }`}>
                                                    {t.type === 'INVOICE' ? 'BILLING' : 'PAYMENT'}
                                                </span>
                                            </td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-right font-mono font-bold text-sm ${t.type === 'INVOICE'
                                                ? 'text-slate-800 dark:text-slate-200'
                                                : 'text-emerald-600 dark:text-emerald-400'
                                                }`}>
                                                {t.type === 'PAYMENT' ? '-' : ''}{t.amount.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                    {transactions.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="p-12 text-center">
                                                <div className="flex flex-col items-center justify-center text-slate-400 space-y-2">
                                                    <FileText size={48} className="opacity-20" />
                                                    <p className="font-medium">No transactions found</p>
                                                    <p className="text-xs">Record a payment or invoice to get started</p>
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

            {/* Add Transaction Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 transform transition-all scale-100">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Record Transaction</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                <Plus size={24} className="rotate-45" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Transaction Type</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setTxForm({ ...txForm, type: 'PAYMENT', description: '' })}
                                        className={`flex items-center justify-center gap-2 p-3 rounded-xl text-sm font-bold border-2 transition-all ${txForm.type === 'PAYMENT'
                                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                                            : 'border-slate-100 dark:border-slate-800 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700'
                                            }`}
                                    >
                                        <Wallet size={18} /> Receive Payment
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setTxForm({ ...txForm, type: 'INVOICE', description: '' })}
                                        className={`flex items-center justify-center gap-2 p-3 rounded-xl text-sm font-bold border-2 transition-all ${txForm.type === 'INVOICE'
                                            ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                                            : 'border-slate-100 dark:border-slate-800 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700'
                                            }`}
                                    >
                                        <FileText size={18} /> Bill Student
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount (KES)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Ksh</span>
                                    <input
                                        type="number"
                                        required
                                        className="w-full pl-12 pr-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none font-mono font-medium text-lg"
                                        value={txForm.amount}
                                        onChange={e => setTxForm({ ...txForm, amount: e.target.value })}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description (Optional)</label>
                                <input
                                    type="text"
                                    className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                                    value={txForm.description}
                                    onChange={e => setTxForm({ ...txForm, description: e.target.value })}
                                    placeholder={txForm.type === 'PAYMENT' ? "e.g. Term 1 Fees" : "e.g. Library Fine"}
                                />
                            </div>

                            {txForm.type === 'PAYMENT' && (
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-4 border border-slate-100 dark:border-slate-700">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Payment Method</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['CASH', 'MPESA', 'BANK'].map(m => (
                                                <button
                                                    key={m}
                                                    type="button"
                                                    onClick={() => setTxForm({ ...txForm, payment_method: m })}
                                                    className={`px-2 py-2 text-xs font-bold rounded-lg border ${txForm.payment_method === m
                                                        ? 'bg-slate-800 text-white border-slate-800 dark:bg-white dark:text-slate-900 dark:border-white'
                                                        : 'bg-white text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                                                        }`}
                                                >
                                                    {m}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {txForm.payment_method !== 'CASH' && (
                                        <div className="animate-fade-in">
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Reference Code <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full p-3 border border-slate-300 dark:border-slate-700 rounded-xl dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none font-mono text-sm uppercase"
                                                value={txForm.reference}
                                                onChange={e => setTxForm({ ...txForm, reference: e.target.value })}
                                                placeholder={txForm.payment_method === 'MPESA' ? "QDF23..." : "Ref No."}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-3 text-slate-600 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 rounded-xl font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {submitting ? 'Processing...' : 'Confirm Transaction'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinanceStudentDetail;
