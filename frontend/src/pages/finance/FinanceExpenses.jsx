import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Search, Filter, Download, Calendar, DollarSign, TrendingUp, TrendingDown,
    Edit2, Trash2, X, FileText, Tag, User, Building, CreditCard, AlertCircle, CheckCircle
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import axios from 'axios';

const FinanceExpenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [stats, setStats] = useState({
        total: 0,
        thisMonth: 0,
        lastMonth: 0,
        byCategory: {}
    });

    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        category: 'utilities',
        description: '',
        date: new Date().toISOString().split('T')[0],
        vendor: '',
        payment_method: 'cash',
        receipt_number: ''
    });

    const categories = [
        { value: 'utilities', label: 'Utilities', color: 'bg-blue-500', icon: '⚡' },
        { value: 'salaries', label: 'Salaries', color: 'bg-green-500', icon: '💰' },
        { value: 'supplies', label: 'Supplies', color: 'bg-purple-500', icon: '📦' },
        { value: 'maintenance', label: 'Maintenance', color: 'bg-orange-500', icon: '🔧' },
        { value: 'transport', label: 'Transport', color: 'bg-yellow-500', icon: '🚌' },
        { value: 'food', label: 'Food', color: 'bg-red-500', icon: '🍽️' },
        { value: 'other', label: 'Other', color: 'bg-gray-500', icon: '📋' }
    ];

    const paymentMethods = [
        { value: 'cash', label: 'Cash', icon: '💵' },
        { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
        { value: 'cheque', label: 'Cheque', icon: '📝' },
        { value: 'mobile_money', label: 'Mobile Money', icon: '📱' }
    ];

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/finance/expenses/');
            if (response.data.success) {
                setExpenses(response.data.expenses);
                setStats({
                    total: response.data.stats.total_expenses,
                    thisMonth: response.data.stats.month_expenses,
                    lastMonth: 0, // Backend doesn't provide this yet
                    byCategory: {} // Calculate on frontend or improve backend
                });
                // Calculate category breakdown on frontend for now
                calculateStats(response.data.expenses);
            }
        } catch (error) {
            console.error('Error fetching expenses:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (expensesList) => {
        // Calculate category breakdown locally
        const byCategory = {};
        expensesList.forEach(exp => {
            byCategory[exp.category] = (byCategory[exp.category] || 0) + exp.amount;
        });

        // Update stats state, preserving backend totals if available
        setStats(prev => ({
            ...prev,
            byCategory
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/finance/expenses/', {
                ...formData,
                amount: parseFloat(formData.amount)
            });

            if (response.data.success) {
                fetchExpenses(); // Refresh list
                setShowAddModal(false);
                resetForm();
            }
        } catch (error) {
            console.error('Error adding expense:', error);
            alert('Failed to add expense');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this expense?')) {
            try {
                const response = await axios.delete(`/api/finance/expenses/${id}/`);
                if (response.data.success) {
                    fetchExpenses(); // Refresh list
                }
            } catch (error) {
                console.error('Error deleting expense:', error);
                alert('Failed to delete expense');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            amount: '',
            category: 'utilities',
            description: '',
            date: new Date().toISOString().split('T')[0],
            vendor: '',
            payment_method: 'cash',
            receipt_number: ''
        });
    };

    const getCategoryInfo = (categoryValue) => {
        return categories.find(c => c.value === categoryValue) || categories[categories.length - 1];
    };

    const filteredExpenses = expenses.filter(expense => {
        const matchesSearch = expense.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            expense.vendor.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory === 'all' || expense.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Expense Management</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Track and manage all school expenses</p>
                </div>
                <Button
                    onClick={() => setShowAddModal(true)}
                    className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
                >
                    <Plus size={20} className="mr-2" />
                    Add Expense
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                            <DollarSign size={24} />
                        </div>
                        <TrendingUp size={20} className="text-white/80" />
                    </div>
                    <p className="text-emerald-100 text-sm font-medium mb-1">Total Expenses</p>
                    <p className="text-3xl font-bold">KES {stats.total.toLocaleString()}</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                            <Calendar size={24} className="text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">This Month</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">KES {stats.thisMonth.toLocaleString()}</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                            <FileText size={24} className="text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Total Records</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{expenses.length}</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                            <Tag size={24} className="text-orange-600 dark:text-orange-400" />
                        </div>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Categories</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{Object.keys(stats.byCategory).length}</p>
                </motion.div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search expenses by title or vendor..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-600 focus:border-transparent transition-all text-slate-900 dark:text-white"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-600 focus:border-transparent transition-all text-slate-900 dark:text-white"
                        >
                            <option value="all">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
                            ))}
                        </select>
                        <Button variant="outline" className="border-slate-200 dark:border-slate-700">
                            <Download size={20} className="mr-2" />
                            Export
                        </Button>
                    </div>
                </div>
            </div>

            {/* Expenses List */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Expense</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Vendor</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Payment</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {filteredExpenses.map((expense, index) => {
                                const categoryInfo = getCategoryInfo(expense.category);
                                const paymentInfo = paymentMethods.find(p => p.value === expense.payment_method);
                                return (
                                    <motion.tr
                                        key={expense.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                                            {new Date(expense.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">{expense.title}</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">{expense.receipt_number}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white ${categoryInfo.color}`}>
                                                <span className="mr-1">{categoryInfo.icon}</span>
                                                {categoryInfo.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                            {expense.vendor}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center text-sm text-slate-600 dark:text-slate-400">
                                                <span className="mr-1">{paymentInfo?.icon}</span>
                                                {paymentInfo?.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-semibold text-slate-900 dark:text-white">
                                                KES {expense.amount.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(expense.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {filteredExpenses.length === 0 && (
                    <div className="text-center py-12">
                        <FileText size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                        <p className="text-slate-500 dark:text-slate-400">No expenses found</p>
                    </div>
                )}
            </div>

            {/* Add Expense Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                            onClick={() => setShowAddModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        >
                            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800">
                                <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Add New Expense</h2>
                                    <button
                                        onClick={() => setShowAddModal(false)}
                                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                    >
                                        <X size={20} className="text-slate-500" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                                Expense Title *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-600 focus:border-transparent transition-all text-slate-900 dark:text-white"
                                                placeholder="e.g., Electricity Bill"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                                Amount (KES) *
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={formData.amount}
                                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-600 focus:border-transparent transition-all text-slate-900 dark:text-white"
                                                placeholder="0.00"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                                Date *
                                            </label>
                                            <input
                                                type="date"
                                                value={formData.date}
                                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-600 focus:border-transparent transition-all text-slate-900 dark:text-white"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                                Category *
                                            </label>
                                            <select
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-600 focus:border-transparent transition-all text-slate-900 dark:text-white"
                                                required
                                            >
                                                {categories.map(cat => (
                                                    <option key={cat.value} value={cat.value}>
                                                        {cat.icon} {cat.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                                Payment Method *
                                            </label>
                                            <select
                                                value={formData.payment_method}
                                                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-600 focus:border-transparent transition-all text-slate-900 dark:text-white"
                                                required
                                            >
                                                {paymentMethods.map(method => (
                                                    <option key={method.value} value={method.value}>
                                                        {method.icon} {method.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                                Vendor/Supplier
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.vendor}
                                                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-600 focus:border-transparent transition-all text-slate-900 dark:text-white"
                                                placeholder="e.g., Kenya Power"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                                Receipt Number
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.receipt_number}
                                                onChange={(e) => setFormData({ ...formData, receipt_number: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-600 focus:border-transparent transition-all text-slate-900 dark:text-white"
                                                placeholder="e.g., INV-2026-001"
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                                Description
                                            </label>
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                rows={3}
                                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-600 focus:border-transparent transition-all text-slate-900 dark:text-white resize-none"
                                                placeholder="Additional details about this expense..."
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setShowAddModal(false)}
                                            className="flex-1"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
                                        >
                                            <CheckCircle size={20} className="mr-2" />
                                            Add Expense
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FinanceExpenses;
