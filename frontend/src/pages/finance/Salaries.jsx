import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Users, DollarSign, Calendar, Search, Filter,
    CheckCircle, XCircle, Clock, FileText, ChevronRight,
    Download, Send, MoreVertical, CreditCard, RefreshCw,
    TrendingUp, Wallet, ShieldCheck, Mail, Edit, Plus
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const SalariesSkeleton = () => (
    <div className="space-y-6 animate-pulse p-6">
        <div className="flex justify-between items-center">
            <div className="space-y-2">
                <div className="h-7 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                <div className="h-4 w-64 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
            </div>
            <div className="h-9 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
            ))}
        </div>
        <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-2xl"></div>
    </div>
);

const Salaries = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(location.state?.search || '');
    const [filterRole, setFilterRole] = useState('All');
    const [currentMonth, setCurrentMonth] = useState('');
    const [processing, setProcessing] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({
        base_salary: 0,
        allowances: 0,
        deductions: 0,
        nssf: 0,
        loans: 0,
        advances: 0
    });
    const [updating, setUpdating] = useState(false);
    const [selectedForEdit, setSelectedForEdit] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.get('/api/finance/salaries/');
            if (response.data) {
                setEmployees(response.data.employees || []);
                setCurrentMonth(response.data.current_month || 'Current Month');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (userIds, action) => {
        setProcessing(true);
        try {
            await axios.post('/api/finance/salaries/process/', {
                user_ids: userIds,
                action: action
            });
            fetchData();
        } catch (error) {
            console.error("Error processing payroll", error);
        } finally {
            setProcessing(false);
        }
    };

    const handleEditClick = (emp) => {
        setSelectedForEdit(emp);
        setEditForm({
            base_salary: emp.base_salary,
            allowances: emp.allowances,
            deductions: emp.deductions,
            nssf: emp.nssf || 0,
            loans: emp.loans || 0,
            advances: emp.advances || 0
        });
        setShowEditModal(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);
        try {
            await axios.post(`/api/finance/salaries/${selectedForEdit.id}/update/`, editForm);
            setShowEditModal(false);
            fetchData();
        } catch (error) {
            console.error("Error updating salary", error);
            alert("Failed to update salary");
        } finally {
            setUpdating(false);
        }
    };

    // Bulk Actions
    const unprocessedIds = (employees || []).filter(e => e.status === 'UNPROCESSED').map(e => e.id);
    const pendingIds = (employees || []).filter(e => e.status === 'PROCESSED').map(e => e.id);

    const filteredEmployees = (employees || []).filter(emp => {
        const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'All' || emp.role === filterRole;
        return matchesSearch && matchesRole;
    });

    // Stats
    const totalPayroll = (employees || []).reduce((acc, curr) => acc + curr.net_salary, 0);
    const pendingCount = (employees || []).filter(e => e.status !== 'PAID').length;
    const paidCount = (employees || []).filter(e => e.status === 'PAID').length;

    const StatusBadge = ({ status }) => {
        const config = {
            'PAID': {
                icon: ShieldCheck,
                color: 'text-emerald-600 dark:text-emerald-400',
                bg: 'bg-emerald-50 dark:bg-emerald-500/10',
                border: 'border-emerald-100 dark:border-emerald-500/20',
                label: 'Paid'
            },
            'PROCESSED': {
                icon: CheckCircle,
                color: 'text-blue-600 dark:text-blue-400',
                bg: 'bg-blue-50 dark:bg-blue-500/10',
                border: 'border-blue-100 dark:border-blue-500/20',
                label: 'Processed'
            },
            'PENDING': {
                icon: Clock,
                color: 'text-amber-600 dark:text-amber-400',
                bg: 'bg-amber-50 dark:bg-amber-500/10',
                border: 'border-amber-100 dark:border-amber-500/20',
                label: 'Pending'
            },
            'UNPROCESSED': {
                icon: XCircle,
                color: 'text-slate-500 dark:text-slate-400',
                bg: 'bg-slate-50 dark:bg-slate-500/10',
                border: 'border-slate-100 dark:border-slate-500/20',
                label: 'Unprocessed'
            },
        };
        const style = config[status] || config['UNPROCESSED'];
        const Icon = style.icon;

        return (
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${style.bg} ${style.color} ${style.border}`}>
                <Icon size={12} className="stroke-[3]" />
                {style.label}
            </div>
        );
    };

    if (loading) return <SalariesSkeleton />;

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] p-4 lg:p-8">
            <div className="max-w-[1400px] mx-auto space-y-6">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                            Salaries & Payroll
                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-100 dark:border-indigo-800">
                                <Calendar size={14} /> {currentMonth}
                            </span>
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                            Manage compensation and track payment status across the organization
                        </p>
                    </div>

                    <div className="flex gap-2">
                        {unprocessedIds.length > 0 && (
                            <button
                                onClick={() => handleAction(unprocessedIds, 'GENERATE')}
                                disabled={processing}
                                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {processing ? <RefreshCw className="animate-spin" size={16} /> : <Calendar size={16} />}
                                Generate Payroll
                            </button>
                        )}
                        {pendingIds.length > 0 && (
                            <button
                                onClick={() => handleAction(pendingIds, 'PAY')}
                                disabled={processing}
                                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {processing ? <RefreshCw className="animate-spin" size={16} /> : <CreditCard size={16} />}
                                Pay All ({pendingIds.length})
                            </button>
                        )}
                    </div>
                </div>

                {/* Compact Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500 group-hover:opacity-[0.07]">
                            <Wallet size={80} className="text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="space-y-3 relative">
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                <Wallet size={16} className="text-indigo-500" />
                                <span className="text-[11px] font-bold uppercase tracking-widest">Total Monthly Payroll</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                                    {(totalPayroll).toLocaleString()}
                                </h3>
                                <span className="text-xs font-bold text-slate-400 uppercase">KES</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold">
                                    {(employees || []).length} Staff Members
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                <Clock size={16} className="text-amber-500" />
                                <span className="text-[11px] font-bold uppercase tracking-widest">Pending Disbursals</span>
                            </div>
                            <div className="flex items-end justify-between">
                                <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{pendingCount}</h3>
                                <div className="text-right">
                                    <span className="text-xs font-bold text-slate-400 block uppercase">Progress</span>
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                                        {Math.round((((employees || []).length - pendingCount) / ((employees || []).length || 1)) * 100)}%
                                    </span>
                                </div>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                <motion.div
                                    className="h-full bg-amber-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(pendingCount / ((employees || []).length || 1)) * 100}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                <TrendingUp size={16} className="text-emerald-500" />
                                <span className="text-[11px] font-bold uppercase tracking-widest">Liquidity Success</span>
                            </div>
                            <div className="flex items-end justify-between">
                                <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                                    {(employees || []).length > 0 ? Math.round((paidCount / (employees || []).length) * 100) : 0}%
                                </h3>
                                <div className="text-right">
                                    <span className="text-xs font-bold text-slate-400 block uppercase">Completed</span>
                                    <span className="text-sm font-bold text-emerald-600">{paidCount} Paid</span>
                                </div>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                <motion.div
                                    className="h-full bg-emerald-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(paidCount / ((employees || []).length || 1)) * 100}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table Container */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden backdrop-blur-md">

                    {/* Toolbar */}
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                        <div className="relative w-full sm:max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search employees..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                            <Filter size={14} className="text-slate-400" />
                            <select
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value)}
                                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 py-2 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            >
                                <option value="All">All Roles</option>
                                <option value="Driver">Drivers</option>
                                <option value="Teacher">Teachers</option>
                                <option value="Admin">Admin</option>
                                <option value="Staff">Staff</option>
                            </select>
                        </div>
                    </div>

                    {/* Compact Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-900/50">
                                    <th className="px-6 py-3">Employee</th>
                                    <th className="px-6 py-3">Department/Role</th>
                                    <th className="px-6 py-3">Monthly Net</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredEmployees.map((emp, index) => (
                                    <tr
                                        key={emp.id}
                                        className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                                    >
                                        <td className="px-6 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-9 w-9 rounded-lg flex items-center justify-center text-sm font-bold shadow-sm ${['bg-indigo-100 text-indigo-600', 'bg-emerald-100 text-emerald-600', 'bg-rose-100 text-rose-600', 'bg-amber-100 text-amber-600'][index % 4]
                                                    }`}>
                                                    {emp.name[0]}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{emp.name}</div>
                                                    <div className="text-[10px] font-medium text-slate-500">ID: #{emp.id.toString().padStart(4, '0')}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3.5">
                                            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                                {emp.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3.5">
                                            <div className="text-sm font-bold text-slate-900 dark:text-white">
                                                {emp.net_salary.toLocaleString()}
                                                <span className="ml-1 text-[10px] text-slate-400 font-medium">KES</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3.5">
                                            <StatusBadge status={emp.status} />
                                        </td>
                                        <td className="px-6 py-3.5">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => handleEditClick(emp)}
                                                    className="p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-slate-400 hover:text-indigo-600 transition-colors"
                                                    title="Edit Structure"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                {emp.status === 'UNPROCESSED' && (
                                                    <button
                                                        onClick={() => handleAction([emp.id], 'GENERATE')}
                                                        className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-400 hover:text-blue-600 transition-colors"
                                                        title="Generate"
                                                    >
                                                        <Calendar size={16} />
                                                    </button>
                                                )}
                                                {emp.status === 'PROCESSED' && (
                                                    <button
                                                        onClick={() => handleAction([emp.id], 'PAY')}
                                                        className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-slate-400 hover:text-emerald-600 transition-colors"
                                                        title="Disburse"
                                                    >
                                                        <CreditCard size={16} />
                                                    </button>
                                                )}
                                                {(emp.status === 'PAID' || emp.status === 'PROCESSED') && (
                                                    <button
                                                        onClick={() => setSelectedEmployee(emp)}
                                                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                                                        title="View Slip"
                                                    >
                                                        <FileText size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredEmployees.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="h-12 w-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                <Search className="text-slate-300" size={24} />
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">No results found</h3>
                            <p className="text-xs text-slate-500">Try adjusting your filters or search keywords</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals Refined */}
            <AnimatePresence>
                {selectedEmployee && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
                            onClick={() => setSelectedEmployee(null)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, y: 10, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.95, y: 10, opacity: 0 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative z-10 border border-slate-200 dark:border-slate-800"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg font-bold text-slate-900 dark:text-white">
                                            {selectedEmployee.name[0]}
                                        </div>
                                        <div>
                                            <h2 className="text-base font-bold text-slate-900 dark:text-white">{selectedEmployee.name}</h2>
                                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">{selectedEmployee.role} • Slip #{selectedEmployee.id}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Period</p>
                                        <p className="text-xs font-bold text-indigo-600">{currentMonth}</p>
                                    </div>
                                </div>

                                <div className="space-y-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500 font-medium">Basic Salary</span>
                                        <span className="font-bold text-slate-900 dark:text-white">{selectedEmployee.base_salary.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500 font-medium">Allowances</span>
                                        <span className="font-bold text-emerald-600">+ {selectedEmployee.allowances.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500 font-medium">Standard Deductions</span>
                                        <span className="font-bold text-rose-600">- {selectedEmployee.deductions.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500 font-medium">NSSF Contribution</span>
                                        <span className="font-bold text-rose-600">- {selectedEmployee.nssf?.toLocaleString() || '0'}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500 font-medium">Loan Repayments</span>
                                        <span className="font-bold text-rose-600">- {selectedEmployee.loans?.toLocaleString() || '0'}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500 font-medium font-bold">Salary Advance Deduction</span>
                                        <span className="font-bold text-rose-600">- {selectedEmployee.advances?.toLocaleString() || '0'}</span>
                                    </div>
                                    <div className="h-px bg-slate-200 dark:bg-slate-700 my-1"></div>
                                    <div className="flex justify-between items-center pt-1">
                                        <span className="text-xs text-slate-900 dark:text-white font-bold">Total Net Pay</span>
                                        <span className="text-xl font-bold text-slate-900 dark:text-white">KES {selectedEmployee.net_salary.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="mt-6 grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setSelectedEmployee(null)}
                                        className="py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button className="py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                                        <Mail size={14} /> Send Email
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Edit Modal Refined */}
            <AnimatePresence>
                {showEditModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
                            onClick={() => setShowEditModal(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, y: 10, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.95, y: 10, opacity: 0 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden relative z-10 border border-slate-200 dark:border-slate-800"
                        >
                            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">Salary Configuration</h3>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{selectedForEdit?.name}</p>
                                </div>
                                <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                                    <Plus className="rotate-45" size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleEditSubmit} className="p-5 space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Base Salary</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 rounded-xl outline-none transition-all font-bold text-sm"
                                            value={editForm.base_salary}
                                            onChange={e => setEditForm({ ...editForm, base_salary: parseFloat(e.target.value) || 0 })}
                                            required
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase">KES</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Allowances</label>
                                        <input
                                            type="number"
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500/50 rounded-xl outline-none transition-all font-bold text-sm"
                                            value={editForm.allowances}
                                            onChange={e => setEditForm({ ...editForm, allowances: parseFloat(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Other Deductions</label>
                                        <input
                                            type="number"
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-rose-500/50 rounded-xl outline-none transition-all font-bold text-sm"
                                            value={editForm.deductions}
                                            onChange={e => setEditForm({ ...editForm, deductions: parseFloat(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">NSSF</label>
                                        <input
                                            type="number"
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-rose-500/50 rounded-xl outline-none transition-all font-bold text-sm"
                                            value={editForm.nssf}
                                            onChange={e => setEditForm({ ...editForm, nssf: parseFloat(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Loans</label>
                                        <input
                                            type="number"
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-rose-500/50 rounded-xl outline-none transition-all font-bold text-sm"
                                            value={editForm.loans}
                                            onChange={e => setEditForm({ ...editForm, loans: parseFloat(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Salary Advance (Pre-filled from Approvals)</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-rose-500/50 rounded-xl outline-none transition-all font-bold text-sm opacity-80"
                                        value={editForm.advances}
                                        readOnly
                                    />
                                </div>

                                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
                                    <div className="flex justify-between items-center text-white">
                                        <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">Calculated Net</span>
                                        <span className="text-lg font-bold">
                                            KES {(editForm.base_salary + editForm.allowances - editForm.deductions - editForm.nssf - editForm.loans - editForm.advances).toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="pt-2 flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowEditModal(false)}
                                        className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={updating}
                                        className="flex-[2] py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold shadow-xl transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
                                    >
                                        {updating ? 'Saving...' : 'Apply Changes'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
export default Salaries;
