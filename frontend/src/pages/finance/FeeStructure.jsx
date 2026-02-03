import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Save, AlertCircle, CheckCircle, Search, DollarSign, Plus,
    Edit2, Trash2, X, Calendar, BookOpen, Loader2, RefreshCw
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useSchool } from '../../context/SchoolContext';
import { motion, AnimatePresence } from 'framer-motion';

const FeeStructure = () => {
    const { config } = useSchool();
    const [feeStructures, setFeeStructures] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [message, setMessage] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingGrade, setEditingGrade] = useState(null);
    const [editValues, setEditValues] = useState({});
    const [selectedYear, setSelectedYear] = useState('2024-2025');

    // Group fees by grade
    const groupedFees = React.useMemo(() => {
        const grouped = {};
        feeStructures.forEach(fee => {
            const grade = fee.grade;
            if (!grouped[grade]) {
                grouped[grade] = { 1: [], 2: [], 3: [] };
            }
            grouped[grade][fee.term].push(fee);
        });
        return grouped;
    }, [feeStructures]);

    useEffect(() => {
        fetchData();
    }, [selectedYear]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [feesRes, catsRes] = await Promise.all([
                axios.get('/api/finance/fee-structures/'),
                axios.get('/api/finance/fee-categories/')
            ]);
            setFeeStructures(feesRes.data.fee_structures || []);
            setCategories(catsRes.data.categories || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            showMessage('error', 'Failed to load fee structures');
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 4000);
    };

    const handleEditGrade = (grade, terms) => {
        setEditingGrade(grade);
        const values = {};
        Object.values(terms).flat().forEach(fee => {
            values[fee.id] = fee.amount;
        });
        setEditValues(values);
    };

    const handleCancelEdit = () => {
        setEditingGrade(null);
        setEditValues({});
    };

    const handleInputChange = (id, value) => {
        setEditValues(prev => ({ ...prev, [id]: value }));
    };

    const handleSaveGrade = async (grade) => {
        setSaving(true);
        try {
            const updates = Object.entries(editValues).map(([id, amount]) => ({
                id: parseInt(id),
                amount: parseFloat(amount)
            }));

            const response = await axios.post('/api/finance/fee-structures/update/', { updates });

            showMessage('success', `Updated ${grade} fees. ${response.data.updated_students || 0} students synced.`);
            await fetchData();
            setEditingGrade(null);
        } catch (error) {
            console.error('Failed to update fees', error);
            showMessage('error', 'Failed to update fees');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteFee = async (feeId) => {
        if (!confirm('Are you sure you want to delete this fee item?')) return;

        try {
            await axios.delete(`/api/finance/fee-structures/${feeId}/`);
            showMessage('success', 'Fee item deleted successfully');
            await fetchData();
        } catch (error) {
            showMessage('error', 'Failed to delete fee item');
        }
    };

    const filteredGrades = Object.keys(groupedFees).filter(grade =>
        grade.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">Loading fee structures...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Fee Structure Management</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Configure school fees by class, term, and category
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search class..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full sm:w-64 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="2024-2025">2024-2025</option>
                        <option value="2025-2026">2025-2026</option>
                        <option value="2026-2027">2026-2027</option>
                    </select>
                    <Button
                        onClick={() => setShowAddModal(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-sm"
                    >
                        <Plus size={18} className="mr-2" />
                        Add Fee Item
                    </Button>
                </div>
            </div>

            {/* Message Banner */}
            <AnimatePresence>
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`p-4 rounded-lg flex items-center gap-3 ${message.type === 'success'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400'
                            : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400'
                            }`}
                    >
                        {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        <span className="font-medium">{message.text}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Fee Structure Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredGrades.map(grade => (
                    <motion.div
                        key={grade}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h4 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{grade}</h4>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                                    Academic Year {selectedYear}
                                </p>
                            </div>
                            {editingGrade === grade ? (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleSaveGrade(grade)}
                                        disabled={saving}
                                        className="p-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white shadow transition-colors disabled:opacity-50"
                                    >
                                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    </button>
                                    <button
                                        onClick={handleCancelEdit}
                                        className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => handleEditGrade(grade, groupedFees[grade])}
                                    className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                >
                                    <Edit2 size={16} />
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {[1, 2, 3].map(term => (
                                <div
                                    key={term}
                                    className="bg-slate-50/50 dark:bg-slate-800/30 rounded-lg p-3 border border-slate-100 dark:border-slate-800"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                                            Term {term}
                                        </span>
                                        <DollarSign size={12} className="text-slate-400" />
                                    </div>
                                    <div className="space-y-3 min-h-[60px]">
                                        {groupedFees[grade][term] && groupedFees[grade][term].length > 0 ? (
                                            groupedFees[grade][term].map(fee => (
                                                <div key={fee.id} className="flex flex-col gap-1">
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase leading-none">
                                                        {fee.category}
                                                    </span>
                                                    {editingGrade === grade ? (
                                                        <div className="relative group">
                                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                                                                {config.currency}
                                                            </span>
                                                            <input
                                                                type="number"
                                                                value={editValues[fee.id] || 0}
                                                                onChange={(e) => handleInputChange(fee.id, e.target.value)}
                                                                className="w-full pl-8 pr-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-bold outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                                            {config.currency} {fee.amount.toLocaleString()}
                                                        </span>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <span className="text-[10px] italic text-slate-400">No fees configured</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>

            {filteredGrades.length === 0 && (
                <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
                    <BookOpen className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                        {searchTerm ? 'No classes found matching your search' : 'No fee structures configured yet'}
                    </p>
                    <Button
                        onClick={() => setShowAddModal(true)}
                        className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white border-none"
                    >
                        <Plus size={18} className="mr-2" />
                        Add First Fee Structure
                    </Button>
                </div>
            )}
        </div>
    );
};

export default FeeStructure;
