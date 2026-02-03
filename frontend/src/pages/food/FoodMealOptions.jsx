import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Utensils, Plus, Edit, Trash2, X, Search,
    Filter, AlertCircle, CheckCircle, Tag
} from 'lucide-react';
import Button from '../../components/ui/Button';

const FoodMealOptions = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        id: null,
        name: '',
        cost: '',
        per_serving_cost: '',
        billing_cycle: 'DAILY',
        description: ''
    });

    const cycles = [
        { value: 'DAILY', label: 'Daily (Recurring)' },
        { value: 'MONTHLY', label: 'Monthly (Recurring)' },
        { value: 'TERMLY', label: 'Termly (Recurring)' },
        { value: 'ONE_OFF', label: 'One Off / Ad-hoc' }
    ];

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const res = await axios.get('/api/food/items/');
            setItems(res.data.items || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/food/items/', {
                action: editMode ? 'UPDATE' : 'CREATE',
                ...formData
            });
            setShowModal(false);
            fetchItems();
            resetForm();
        } catch (error) {
            alert('Failed to save item');
        }
    };

    const handleDelete = async (id, name) => {
        if (!confirm(`Are you sure you want to delete "${name}"? This will hide it from new subscriptions.`)) return;
        try {
            await axios.post('/api/food/items/', {
                action: 'DELETE',
                id: id
            });
            fetchItems();
        } catch (error) {
            alert('Failed to delete item');
        }
    };

    const openEdit = (item) => {
        setFormData({
            id: item.id,
            name: item.name,
            cost: item.cost,
            per_serving_cost: item.per_serving_cost || '',
            billing_cycle: item.cycle,
            description: item.description || ''
        });
        setEditMode(true);
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({ id: null, name: '', cost: '', per_serving_cost: '', billing_cycle: 'DAILY', description: '' });
        setEditMode(false);
    };

    // Filter Items
    const filteredItems = (items || []).filter(item =>
        (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.cycle || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return (
        <div className="h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Meal Options</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage available food items, prices, and billing cycles</p>
                </div>
                <Button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/20"
                >
                    <Plus size={20} className="mr-2" />
                    Create New Item
                </Button>
            </div>

            {/* Search & Filter Bar */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search meal plans..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white"
                    />
                </div>
                {/* Could add cycle filter dropdown here later */}
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map(item => (
                    <div key={item.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 group hover:shadow-md transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 dark:bg-orange-900/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none group-hover:bg-orange-100 dark:group-hover:bg-orange-900/20 transition-colors"></div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-xl">
                                    <Utensils size={24} />
                                </div>
                                <div className="flex gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => openEdit(item)}
                                        className="p-2 bg-white dark:bg-slate-700 text-slate-500 hover:text-blue-600 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 transition-colors"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id, item.name)}
                                        className="p-2 bg-white dark:bg-slate-700 text-slate-500 hover:text-red-600 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{item.name}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 h-10 mb-4">{item.description || 'No description provided.'}</p>

                            <div className="flex items-center gap-2 mb-4">
                                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold uppercase tracking-wide">
                                    {(item.cycle || '').replace('_', ' ')}
                                </span>
                                {item.active_subscribers > 0 && (
                                    <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-bold flex items-center gap-1">
                                        <CheckCircle size={12} /> {item.active_subscribers} Active
                                    </span>
                                )}
                            </div>

                            <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Cost Per Unit</p>
                                <p className="text-2xl font-black text-slate-800 dark:text-white font-mono">
                                    KES {(item.cost || 0).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Empty State Add Card */}
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-orange-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-slate-800/50 transition-all group min-h-[280px]"
                >
                    <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-full group-hover:scale-110 transition-transform">
                        <Plus size={32} />
                    </div>
                    <span className="font-bold text-lg">Add New Item</span>
                </button>
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg shadow-2xl animate-scale-in overflow-hidden">
                        <div className="p-6 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                {editMode ? 'Edit Meal Option' : 'New Meal Option'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 md:p-8">
                            <form onSubmit={handleSave} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Item Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        placeholder="e.g. Special Diet Lunch"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-orange-500 outline-none dark:text-white"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Cost (KES)</label>
                                        <input
                                            type="number"
                                            value={formData.cost}
                                            onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                                            required
                                            placeholder="0.00"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-orange-500 outline-none dark:text-white font-mono font-bold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Billing Cycle</label>
                                        <select
                                            value={formData.billing_cycle}
                                            onChange={(e) => setFormData({ ...formData, billing_cycle: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-orange-500 outline-none dark:text-white"
                                        >
                                            {cycles.map(c => (
                                                <option key={c.value} value={c.value}>{c.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows="3"
                                        placeholder="Describe what this meal option includes..."
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-orange-500 outline-none dark:text-white resize-none"
                                    ></textarea>
                                </div>

                                <div className="pt-2 flex gap-3">
                                    <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/20">
                                        {editMode ? 'Update Item' : 'Create Item'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FoodMealOptions;
