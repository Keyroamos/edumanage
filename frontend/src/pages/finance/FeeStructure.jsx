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
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [message, setMessage] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingGrade, setEditingGrade] = useState(null);
    const [editValues, setEditValues] = useState({});
    const [selectedYear, setSelectedYear] = useState('2024-2025');
    const [orderedGrades, setOrderedGrades] = useState([]); // Track grade order from API
    const [addData, setAddData] = useState({
        grade_id: '',
        term: '1',
        category_id: '',
        amount: '',
        is_mandatory: true
    });
    const [tuitionId, setTuitionId] = useState(null);
    const [newTuitionValues, setNewTuitionValues] = useState({}); // { term: amount }

    // Group fees by grade
    const groupedFees = React.useMemo(() => {
        const grouped = {};

        // Initialize all grades from orderedGrades to ensure cards always show up
        orderedGrades.forEach(gradeCode => {
            grouped[gradeCode] = { 1: [], 2: [], 3: [] };
        });

        feeStructures.forEach(fee => {
            const grade = fee.grade;
            if (!grouped[grade]) {
                grouped[grade] = { 1: [], 2: [], 3: [] };
            }
            grouped[grade][fee.term].push(fee);
        });
        return grouped;
    }, [feeStructures, orderedGrades]);

    useEffect(() => {
        fetchData();
    }, [selectedYear]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [feesRes, catsRes, gradesRes] = await Promise.all([
                axios.get(`/api/finance/fee-structures/?year=${selectedYear}`),
                axios.get('/api/finance/fee-categories/'),
                axios.get('/api/grades/')
            ]);

            const fees = feesRes.data.fee_structures || [];
            setFeeStructures(fees);

            const fetchedGrades = gradesRes.data.grades || [];
            setGrades(fetchedGrades);

            // Use the grades list as the source for the cards to ensure they are always there
            setOrderedGrades(fetchedGrades.map(g => g.code));

            const cats = catsRes.data.categories || [];
            setCategories(cats);
            const tuitionCat = cats.find(c => c.name.toLowerCase().includes('tuition'));
            if (tuitionCat) setTuitionId(tuitionCat.id);
        } catch (error) {
            console.error('Error fetching data:', error);
            showMessage('error', 'Failed to load fee structures');
        } finally {
            setLoading(false);
        }
    };

    const handleAddFee = async (e) => {
        if (e) e.preventDefault();
        setSaving(true);
        try {
            await axios.post('/api/finance/fee-structures/create/', {
                ...addData,
                academic_year: selectedYear
            });
            showMessage('success', 'Fee item added successfully');
            setShowAddModal(false);
            setAddData({
                grade_id: '',
                term: '1',
                category_id: '',
                amount: '',
                is_mandatory: true
            });
            await fetchData();
        } catch (error) {
            console.error('Failed to add fee', error);
            showMessage('error', error.response?.data?.error || 'Failed to add fee item');
        } finally {
            setSaving(false);
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
        setNewTuitionValues({});
    };

    const handleCancelEdit = () => {
        setEditingGrade(null);
        setEditValues({});
        setNewTuitionValues({});
    };

    const handleInputChange = (id, value) => {
        setEditValues(prev => ({ ...prev, [id]: value }));
    };

    const handleSaveGrade = async (grade) => {
        setSaving(true);
        try {
            // Update existing
            const updates = Object.entries(editValues).map(([id, amount]) => ({
                id: parseInt(id),
                amount: parseFloat(amount)
            }));

            if (updates.length > 0) {
                await axios.post('/api/finance/fee-structures/update/', { updates });
            }

            // Create new tuition entries
            const gradeObj = grades.find(g => g.code === grade);
            const tuitionEntries = Object.entries(newTuitionValues)
                .filter(([_, amount]) => amount && parseFloat(amount) > 0);

            if (tuitionEntries.length > 0) {
                if (!tuitionId) {
                    throw new Error('Tuition category not found. Please create a "Tuition" category in Settings first.');
                }

                const newCreations = tuitionEntries.map(([term, amount]) => ({
                    grade_id: gradeObj.id,
                    term,
                    category_id: tuitionId,
                    amount: parseFloat(amount),
                    is_mandatory: true,
                    academic_year: selectedYear
                }));

                for (const item of newCreations) {
                    await axios.post('/api/finance/fee-structures/create/', item);
                }
            }

            showMessage('success', `Updated ${grade} fees successfully`);
            await fetchData();
            setEditingGrade(null);
            setNewTuitionValues({});
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

    const filteredGrades = orderedGrades.filter(grade =>
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
                                        {((groupedFees[grade][term] && groupedFees[grade][term].length > 0) || editingGrade === grade) ? (
                                            <>
                                                {groupedFees[grade][term].map(fee => (
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
                                                            <div className="flex items-center justify-between group/fee">
                                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                                                    {config.currency} {fee.amount.toLocaleString()}
                                                                </span>
                                                                <button
                                                                    onClick={() => handleDeleteFee(fee.id)}
                                                                    className="opacity-0 group-hover/fee:opacity-100 p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded transition-all"
                                                                >
                                                                    <Trash2 size={12} />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                                {/* Always show Tuition input if not present and editing */}
                                                {editingGrade === grade && !groupedFees[grade][term].some(f => f.category.toLowerCase().includes('tuition')) && (
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-[9px] font-bold text-indigo-400 uppercase leading-none">
                                                            Tuition (New)
                                                        </span>
                                                        <div className="relative">
                                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                                                                {config.currency}
                                                            </span>
                                                            <input
                                                                type="number"
                                                                placeholder="0.00"
                                                                value={newTuitionValues[term] || ''}
                                                                onChange={(e) => setNewTuitionValues(prev => ({ ...prev, [term]: e.target.value }))}
                                                                className="w-full pl-8 pr-2 py-1.5 bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-200 dark:border-indigo-500/20 rounded text-xs font-bold outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </>
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

            {/* Add Fee Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAddModal(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Add Fee Item</h3>
                                    <p className="text-xs font-medium text-slate-500 mt-1">Assign a fee category to a class and term</p>
                                </div>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-bold"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleAddFee} className="p-6 space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select Class</label>
                                        <select
                                            required
                                            value={addData.grade_id}
                                            onChange={(e) => setAddData({ ...addData, grade_id: e.target.value })}
                                            className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                        >
                                            <option value="">Choose Grade...</option>
                                            {grades.map(g => (
                                                <option key={g.id} value={g.id}>{g.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Term</label>
                                        <select
                                            required
                                            value={addData.term}
                                            onChange={(e) => setAddData({ ...addData, term: e.target.value })}
                                            className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                        >
                                            <option value="1">Term 1</option>
                                            <option value="2">Term 2</option>
                                            <option value="3">Term 3</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fee Category</label>
                                    <select
                                        required
                                        value={addData.category_id}
                                        onChange={(e) => setAddData({ ...addData, category_id: e.target.value })}
                                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                    >
                                        <option value="">Choose Category...</option>
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Amount ({config.currency})</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                                            {config.currency}
                                        </div>
                                        <input
                                            required
                                            type="number"
                                            placeholder="0.00"
                                            value={addData.amount}
                                            onChange={(e) => setAddData({ ...addData, amount: e.target.value })}
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <input
                                        type="checkbox"
                                        id="is_mandatory"
                                        checked={addData.is_mandatory}
                                        onChange={(e) => setAddData({ ...addData, is_mandatory: e.target.checked })}
                                        className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <label htmlFor="is_mandatory" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        Mandatory fee (Automatically billed to students)
                                    </label>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 h-12 rounded-xl text-sm font-bold border-slate-200"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 border-none"
                                    >
                                        {saving ? <Loader2 size={18} className="animate-spin" /> : "Save Fee Item"}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FeeStructure;
