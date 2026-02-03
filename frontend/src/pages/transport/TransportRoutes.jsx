import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MapPin, Plus, Edit, Trash2, X, Search, Users, Eye } from 'lucide-react';
import Button from '../../components/ui/Button';

const TransportRoutes = () => {
    const navigate = useNavigate();
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        id: null,
        name: '',
        cost_per_term: '',
        cost_per_month: '',
        description: '',
        pickup_points: '',
        map_embed_code: ''
    });

    useEffect(() => {
        fetchRoutes();
    }, []);

    const fetchRoutes = async () => {
        try {
            const res = await axios.get('/api/transport/routes/');
            setRoutes(res.data.routes || []);
        } catch (error) {
            console.error(error);
            setRoutes([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/transport/routes/', {
                action: editMode ? 'UPDATE' : 'CREATE',
                ...formData
            });
            setShowModal(false);
            fetchRoutes();
            resetForm();
        } catch (error) {
            alert('Failed to save route');
        }
    };

    const handleDelete = async (id, name) => {
        if (!confirm(`Delete route "${name}"?`)) return;
        try {
            await axios.post('/api/transport/routes/', {
                action: 'DELETE',
                id: id
            });
            fetchRoutes();
        } catch (error) {
            alert('Failed to delete route');
        }
    };

    const openEdit = (route) => {
        setFormData({
            id: route.id,
            name: route.name,
            cost_per_term: route.cost_per_term,
            cost_per_month: route.cost_per_month,
            description: route.description || '',
            pickup_points: route.pickup_points || '',
            map_embed_code: route.map_embed_code || ''
        });
        setEditMode(true);
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({ id: null, name: '', cost_per_term: '', cost_per_month: '', description: '', pickup_points: '', map_embed_code: '' });
        setEditMode(false);
    };

    const filteredRoutes = (routes || []).filter(route =>
        route.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        route.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return (
        <div className="h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Transport Routes</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage available transport routes and pricing</p>
                </div>
                <Button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20"
                >
                    <Plus size={20} className="mr-2" />
                    Create New Route
                </Button>
            </div>

            {/* Search Bar */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search routes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                    />
                </div>
            </div>

            {/* Routes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRoutes.map(route => (
                    <div key={route.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 group hover:shadow-md transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 dark:bg-blue-900/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none group-hover:bg-blue-100 dark:group-hover:bg-blue-900/20 transition-colors"></div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                                    <MapPin size={24} />
                                </div>
                                <div className="flex gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => navigate(`/transport-portal/routes/${route.id}`)}
                                        className="p-2 bg-white dark:bg-slate-700 text-slate-500 hover:text-indigo-600 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 transition-colors"
                                        title="View Details"
                                    >
                                        <Eye size={16} />
                                    </button>
                                    <button
                                        onClick={() => openEdit(route)}
                                        className="p-2 bg-white dark:bg-slate-700 text-slate-500 hover:text-blue-600 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 transition-colors"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(route.id, route.name)}
                                        className="p-2 bg-white dark:bg-slate-700 text-slate-500 hover:text-red-600 rounded-lg shadow-sm border border-slate-200 dark:border-slate-600 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{route.name}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 h-10 mb-4">
                                {route.description || 'No description provided.'}
                            </p>

                            <div className="flex items-center gap-2 mb-4">
                                {route.student_count > 0 && (
                                    <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-bold flex items-center gap-1">
                                        <Users size={12} /> {route.student_count} Students
                                    </span>
                                )}
                            </div>

                            <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-700">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-400 uppercase">Per Term</span>
                                    <span className="text-lg font-black text-slate-800 dark:text-white font-mono">
                                        KES {route.cost_per_term.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-400 uppercase">Per Month</span>
                                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400 font-mono">
                                        KES {route.cost_per_month.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Add New Card */}
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-slate-800/50 transition-all group min-h-[280px]"
                >
                    <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-full group-hover:scale-110 transition-transform">
                        <Plus size={32} />
                    </div>
                    <span className="font-bold text-lg">Add New Route</span>
                </button>
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg shadow-2xl animate-scale-in overflow-hidden">
                        <div className="p-6 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                {editMode ? 'Edit Route' : 'New Route'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 md:p-8">
                            <form onSubmit={handleSave} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Route Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        placeholder="e.g. Route A - CBD"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Cost Per Term (KES)</label>
                                        <input
                                            type="number"
                                            value={formData.cost_per_term}
                                            onChange={(e) => setFormData({ ...formData, cost_per_term: e.target.value })}
                                            required
                                            placeholder="0.00"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white font-mono font-bold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Cost Per Month (KES)</label>
                                        <input
                                            type="number"
                                            value={formData.cost_per_month}
                                            onChange={(e) => setFormData({ ...formData, cost_per_month: e.target.value })}
                                            placeholder="0.00"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white font-mono font-bold"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows="3"
                                        placeholder="Describe the route coverage..."
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white resize-none"
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Pickup Points</label>
                                    <textarea
                                        value={formData.pickup_points}
                                        onChange={(e) => setFormData({ ...formData, pickup_points: e.target.value })}
                                        rows="2"
                                        placeholder="Comma-separated pickup points..."
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white resize-none"
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Route Map Embed Code</label>
                                    <textarea
                                        value={formData.map_embed_code}
                                        onChange={(e) => setFormData({ ...formData, map_embed_code: e.target.value })}
                                        rows="3"
                                        placeholder='Paste Google Maps embed code (e.g., <iframe src="..."></iframe>)'
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white resize-none font-mono text-xs"
                                    ></textarea>
                                    <p className="text-xs text-slate-400 mt-1 ml-1">Paste the full iframe embed code from Google Maps</p>
                                </div>

                                <div className="pt-2 flex gap-3">
                                    <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20">
                                        {editMode ? 'Update Route' : 'Create Route'}
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

export default TransportRoutes;
