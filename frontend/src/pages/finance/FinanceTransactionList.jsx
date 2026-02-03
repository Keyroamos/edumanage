import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    Search, Filter, Calendar, ChevronRight,
    ChevronLeft, ArrowRight, FileText, CheckCircle,
    ArrowUpRight, ArrowDownLeft, SlidersHorizontal,
    MoreHorizontal
} from 'lucide-react';
import Button from '../../components/ui/Button';

const FinanceTransactionList = () => {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        current_page: 1,
        total_pages: 1,
        has_next: false,
        has_previous: false
    });

    // Filters
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL');

    useEffect(() => {
        fetchTransactions();
    }, [pagination.current_page, search, typeFilter]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.current_page,
                search: search,
                type: typeFilter
            };
            const res = await axios.get('/api/finance/transactions/', { params });
            setTransactions(res.data.transactions || []);
            setPagination({
                current_page: res.data.current_page,
                total_pages: res.data.total_pages,
                has_next: res.data.has_next,
                has_previous: res.data.has_previous
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setPagination({ ...pagination, current_page: 1 }); // Reset to page 1
    };

    const handleTypeChange = (val) => {
        setTypeFilter(val);
        setPagination({ ...pagination, current_page: 1 });
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fade-in-up">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Financial Records</h1>
                    <p className="text-slate-500 dark:text-slate-400">Master ledger of all payments and invoices</p>
                </div>
                {/* Visual Summary or Action (Optional) */}
                <div className="hidden md:flex items-center gap-2">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800">
                        Live System
                    </span>
                </div>
            </div>

            {/* Advanced Filter Toolbar */}
            <div className="bg-white dark:bg-slate-800 p-1.5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row gap-2">
                {/* Search Input */}
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by Student, Admission #, or Reference..."
                        value={search}
                        onChange={handleSearch}
                        className="block w-full pl-10 pr-3 py-2.5 border-none rounded-xl bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-0 sm:text-sm"
                    />
                </div>

                <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 self-center hidden md:block"></div>

                {/* Type Filter Tabs */}
                <div className="flex p-1 bg-slate-100 dark:bg-slate-900/50 rounded-xl">
                    {['ALL', 'PAYMENT', 'INVOICE'].map((type) => (
                        <button
                            key={type}
                            onClick={() => handleTypeChange(type)}
                            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${typeFilter === type
                                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                                }`}
                        >
                            {type === 'ALL' ? 'All' : type === 'PAYMENT' ? 'Payments' : 'Invoices'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Transactions Table - Card Style */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                                <th className="px-8 py-5">Date</th>
                                <th className="px-6 py-5">Transaction Details</th>
                                <th className="px-6 py-5">Student</th>
                                <th className="px-6 py-5">Payment Method</th>
                                <th className="px-8 py-5 text-right">Amount</th>
                                <th className="px-6 py-5"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                            {transactions?.length > 0 ? (
                                transactions.map((t) => (
                                    <tr
                                        key={t.id}
                                        onClick={() => navigate(`/finance-portal/transactions/${t.id}`)}
                                        className="group hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all cursor-pointer"
                                    >
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{t.date}</span>
                                                <span className="text-[10px] bg-slate-100 dark:bg-slate-900 text-slate-500 px-1.5 py-0.5 rounded w-fit mt-1 font-mono">
                                                    #{t.id}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-full ${t.type === 'INVOICE'
                                                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                                    : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                                                    }`}>
                                                    {t.type === 'INVOICE' ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className={`text-xs font-bold uppercase tracking-wide ${t.type === 'INVOICE' ? 'text-blue-600 dark:text-blue-400' : 'text-emerald-600 dark:text-emerald-400'
                                                        }`}>
                                                        {t.type}
                                                    </span>
                                                    <span className="text-xs text-slate-400 font-mono">
                                                        {t.reference !== '-' ? t.reference : 'No Ref'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">{t.student_name}</p>
                                                <p className="text-xs text-slate-500 font-medium">{t.student_adm}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-sm">
                                            <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${t.method === 'MPESA'
                                                ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                                                : t.method === 'BANK'
                                                    ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800'
                                                    : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                                                }`}>
                                                {t.method}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className={`font-mono font-bold text-sm ${t.type === 'INVOICE'
                                                ? 'text-slate-800 dark:text-slate-300'
                                                : 'text-emerald-600 dark:text-emerald-400'
                                                }`}>
                                                {t.type === 'PAYMENT' ? '-' : ''}{t.amount.toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-400 hover:text-emerald-500 rounded-lg shadow-sm border border-slate-100 dark:border-slate-600 transition-all">
                                                    <ChevronRight size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-8 py-24 text-center text-slate-500">
                                        <div className="flex flex-col items-center gap-4 opacity-50">
                                            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full">
                                                <FileText size={32} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-lg">No records found</p>
                                                <p className="text-sm">Try adjusting your search or filters</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Modern Pagination Footer */}
                {!loading && transactions?.length > 0 && (
                    <div className="px-8 py-5 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                            Showing Page {pagination.current_page} of {pagination.total_pages}
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                disabled={!pagination.has_previous}
                                onClick={() => setPagination({ ...pagination, current_page: pagination.current_page - 1 })}
                                className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                disabled={!pagination.has_next}
                                onClick={() => setPagination({ ...pagination, current_page: pagination.current_page + 1 })}
                                className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
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

export default FinanceTransactionList;
