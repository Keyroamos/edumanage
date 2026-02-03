import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, DollarSign, Image as ImageIcon, X, AlertCircle } from 'lucide-react';

const DriverExpenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        type: 'FUEL',
        amount: '',
        description: '',
        receipt: null
    });

    const fetchExpenses = async () => {
        try {
            const res = await axios.get('/api/driver/expenses/');
            setExpenses(res.data.expenses || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('type', formData.type);
        data.append('amount', formData.amount);
        data.append('description', formData.description);
        if (formData.receipt) {
            data.append('receipt', formData.receipt);
        }

        try {
            await axios.post('/api/driver/expenses/', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setShowModal(false);
            setFormData({ type: 'FUEL', amount: '', description: '', receipt: null });
            fetchExpenses();
            alert('Expense submitted successfully!');
        } catch (err) {
            alert('Failed to submit expense');
        }
    };

    if (loading) return (
        <div className="flex justify-center pt-20">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent"></div>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in-up pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Expenses</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Track fuel, repairs & more</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 font-bold shadow-lg hover:bg-indigo-700 transition-colors active:scale-95 transform"
                >
                    <Plus size={20} />
                    <span className="hidden sm:inline">Add Expense</span>
                    <span className="sm:hidden">Add</span>
                </button>
            </div>

            <div className="space-y-4">
                {(expenses || []).length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                            <DollarSign size={32} />
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-white">No expenses yet</h3>
                        <p className="text-slate-500 text-sm">Tap 'Add Expense' to record your first cost.</p>
                    </div>
                ) : (
                    (expenses || []).map(expense => (
                        <div key={expense.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex justify-between items-center hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 ${expense.type === 'FUEL' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                                    expense.type === 'REPAIR' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                                        'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                    }`}>
                                    {expense.type === 'FUEL' ? '⛽' : expense.type === 'REPAIR' ? '🔧' : '💵'}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-white capitalize">{(expense.type || '').toLowerCase().replace('_', ' ')}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-[150px] sm:max-w-xs">{expense.description}</p>
                                    <p className="text-xs text-slate-400 mt-1">{expense.date}</p>
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="font-bold text-slate-900 dark:text-white mb-2 text-lg">KES {(expense.amount || 0).toLocaleString()}</p>
                                <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide border ${expense.status === 'APPROVED' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400' :
                                    expense.status === 'REJECTED' ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-400' :
                                        'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400'
                                    }`}>
                                    {expense.status}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add New Expense</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Expense Type</label>
                                <select
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-bold"
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="FUEL">Fuel</option>
                                    <option value="REPAIR">Vehicle Repair</option>
                                    <option value="MAINTENANCE">Maintenance</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Amount (KES)</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-bold text-lg font-mono"
                                    placeholder="0"
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Description</label>
                                <textarea
                                    required
                                    rows="2"
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-medium resize-none"
                                    placeholder="Brief details..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Receipt Photo (Optional)</label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        id="receipt-upload"
                                        onChange={e => setFormData({ ...formData, receipt: e.target.files[0] })}
                                    />
                                    <label htmlFor="receipt-upload" className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-600 hover:border-indigo-500 dark:hover:border-indigo-500 cursor-pointer transition-colors text-slate-500 dark:text-slate-400 font-medium">
                                        <ImageIcon size={20} />
                                        {formData.receipt ? formData.receipt.name : 'Tap to upload receipt'}
                                    </label>
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all text-sm uppercase tracking-wider mt-4">
                                Submit Expense
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
export default DriverExpenses;
