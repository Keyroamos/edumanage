import React, { useState, useEffect } from 'react';
import {
    Search, Filter, Download, Calendar, ChevronLeft,
    ChevronRight, DollarSign, ArrowLeft, Eye, Printer, Wallet
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const Transactions = () => {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterMethod, setFilterMethod] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await axios.get('/api/finance/transactions/');
                setTransactions(response.data.transactions || []);
            } catch (error) {
                console.error('Error fetching transactions:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTransactions();
    }, []);

    const filteredTransactions = transactions.filter(tx => {
        const matchesSearch = tx.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.admission_no.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesMethod = filterMethod === 'ALL' || tx.method === filterMethod;
        return matchesSearch && matchesMethod;
    });

    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

    const totalAmount = filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-950">
                <div className="w-12 h-12 rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-indigo-600 animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-6 min-h-screen bg-slate-50/50 dark:bg-slate-950/20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/finance')}
                        className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:bg-slate-50 transition-colors"
                    >
                        <ArrowLeft size={20} className="text-slate-600 dark:text-slate-400" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Transaction Ledger</h1>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Complete payment history and financial records</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="h-10 px-4 text-xs font-semibold bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800">
                        <Printer size={16} className="mr-2" /> Print
                    </Button>
                    <Button variant="primary" className="h-10 px-4 text-xs font-semibold bg-indigo-600 border-none shadow-sm">
                        <Download size={16} className="mr-2" /> Export CSV
                    </Button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">
                            <DollarSign size={18} className="text-emerald-600" />
                        </div>
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Volume</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">KES {totalAmount.toLocaleString()}</h3>
                        <span className="text-[10px] font-bold text-emerald-600 px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-500/10 rounded tracking-tight">+12%</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
                            <Calendar size={18} className="text-indigo-600" />
                        </div>
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Count</span>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{filteredTransactions.length}</h3>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm sm:col-span-2 lg:col-span-1">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <Filter size={18} className="text-slate-500" />
                        </div>
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Filters</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{filterMethod} Method</span>
                        {searchTerm && <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Search: {searchTerm}</span>}
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search student, ref, admission..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <select
                        value={filterMethod}
                        onChange={(e) => setFilterMethod(e.target.value)}
                        className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                        <option value="ALL">All Methods</option>
                        <option value="CASH">Cash</option>
                        <option value="MPESA">M-Pesa</option>
                        <option value="BANK">Bank Transfer</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                            <tr className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                <th className="px-6 py-4">Reference</th>
                                <th className="px-6 py-4">Student</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Method</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                                <th className="px-6 py-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {paginatedTransactions.map((tx, idx) => (
                                <tr key={tx.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-mono font-medium text-slate-500 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                                            {tx.reference}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-indigo-600 font-bold text-xs border border-slate-200 dark:border-slate-700">
                                                {tx.student.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">{tx.student}</p>
                                                <p className="text-[10px] font-medium text-slate-500">{tx.admission_no}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-xs font-medium text-slate-600 dark:text-slate-300">{tx.date}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${tx.method === 'MPESA' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                            tx.method === 'CASH' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                                'bg-indigo-50 text-indigo-600 border border-indigo-100'
                                            }`}>
                                            {tx.method}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="text-sm font-bold text-emerald-600">KES {tx.amount.toLocaleString()}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors">
                                            <Eye size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-4 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-xs font-medium text-slate-500">
                            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length}
                        </p>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 disabled:opacity-50"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${currentPage === i + 1
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 disabled:opacity-50"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Transactions;
