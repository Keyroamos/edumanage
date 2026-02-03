
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Truck, MapPin, User, Settings, AlertCircle, Edit, Trash2, X
} from 'lucide-react';
import Button from '../../components/ui/Button';

const TransportVehicleDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [vehicle, setVehicle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [routes, setRoutes] = useState([]);
    const [formData, setFormData] = useState({
        plate_number: '',
        model: '',
        capacity: '',
        status: '',
        route_id: ''
    });

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const [vRes, rRes] = await Promise.all([
                axios.get(`/api/transport/vehicles/${id}/`),
                axios.get('/api/transport/routes/')
            ]);
            setVehicle(vRes.data);
            setRoutes(rRes.data.routes);

            const v = vRes.data;
            setFormData({
                plate_number: v.plate_number,
                model: v.model,
                capacity: v.capacity,
                status: v.status,
                route_id: v.route_id || ''
            });

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`/api/transport/vehicles/${id}/`, {
                action: 'UPDATE',
                ...formData
            });
            setShowEditModal(false);
            fetchData();
        } catch (error) {
            alert('Failed to update vehicle');
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this vehicle?')) return;
        try {
            await axios.post(`/api/transport/vehicles/${id}/`, {
                action: 'DELETE'
            });
            navigate('/transport-portal/vehicles');
        } catch (error) {
            alert('Failed to delete vehicle');
        }
    };

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
        </div>
    );

    if (!vehicle) return <div className="p-8 text-center">Vehicle not found</div>;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-12">
            {/* Header */}
            <div className="max-w-4xl mx-auto px-4 pt-6 mb-6">
                <button
                    onClick={() => navigate('/transport-portal/vehicles')}
                    className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors mb-4 font-medium"
                >
                    <ArrowLeft size={18} />
                    Back to Vehicles
                </button>
            </div>

            <div className="max-w-4xl mx-auto px-4">
                {/* Main Card */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-700">
                    <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>

                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg">
                                    <Truck size={40} className="text-indigo-400" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h1 className="text-3xl font-bold font-mono tracking-wide">{vehicle.plate_number}</h1>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${vehicle.status === 'ACTIVE' ? 'bg-emerald-500/20 val-emerald-400 border-emerald-500/30 text-emerald-300' :
                                                'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                            }`}>
                                            {vehicle.status}
                                        </span>
                                    </div>
                                    <p className="text-slate-400 text-lg">{vehicle.model}</p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowEditModal(true)}
                                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-sm transition-colors text-sm font-bold flex items-center gap-2"
                                >
                                    <Edit size={16} /> Edit
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 rounded-xl backdrop-blur-sm transition-colors text-sm font-bold flex items-center gap-2"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 grid md:grid-cols-2 gap-8">
                        {/* Route Info */}
                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-3 mb-4">
                                <MapPin className="text-indigo-500" />
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Assigned Route</h3>
                            </div>
                            {vehicle.route_name !== 'Unassigned' ? (
                                <div>
                                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{vehicle.route_name}</h4>
                                    <button
                                        onClick={() => navigate(`/transport-portal/routes/${vehicle.route_id}`)}
                                        className="text-sm text-indigo-600 hover:underline mt-2 font-medium"
                                    >
                                        View Route Details
                                    </button>
                                </div>
                            ) : (
                                <div className="text-slate-500 flex flex-col items-start gap-2">
                                    <p>No route currently assigned.</p>
                                    <button onClick={() => setShowEditModal(true)} className="text-sm text-indigo-600 font-bold">Assign Route</button>
                                </div>
                            )}
                        </div>

                        {/* Driver Info */}
                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-3 mb-4">
                                <User className="text-indigo-500" />
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Assigned Driver</h3>
                            </div>
                            {vehicle.driver ? (
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                                            {vehicle.driver.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-white">{vehicle.driver.name}</h4>
                                            <p className="text-sm text-slate-500">{vehicle.driver.phone}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/transport-portal/drivers/${vehicle.driver.id}`)}
                                        className="text-sm text-indigo-600 hover:underline mt-2 font-medium"
                                    >
                                        View Driver Profile
                                    </button>
                                </div>
                            ) : (
                                <div className="text-slate-500">
                                    <p>No driver assigned.</p>
                                    <p className="text-xs mt-1">Go to Drivers page to assign a driver to this vehicle.</p>
                                </div>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            <div className="p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-center">
                                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Capacity</p>
                                <p className="text-2xl font-black text-slate-900 dark:text-white">{vehicle.capacity}</p>
                            </div>
                            <div className="p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-center">
                                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Status</p>
                                <p className="text-lg font-bold text-slate-900 dark:text-white">{vehicle.status}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg shadow-2xl animate-scale-in">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Edit Vehicle</h3>
                            <button onClick={() => setShowEditModal(false)}><X size={24} className="text-slate-400" /></button>
                        </div>
                        <form onSubmit={handleUpdate} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Plate Number</label>
                                <input
                                    type="text"
                                    value={formData.plate_number}
                                    onChange={e => setFormData({ ...formData, plate_number: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 dark:text-white"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Model</label>
                                    <input
                                        type="text"
                                        value={formData.model}
                                        onChange={e => setFormData({ ...formData, model: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Capacity</label>
                                    <input
                                        type="number"
                                        value={formData.capacity}
                                        onChange={e => setFormData({ ...formData, capacity: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 dark:text-white"
                                    >
                                        <option value="ACTIVE">Active</option>
                                        <option value="MAINTENANCE">Maintenance</option>
                                        <option value="OUT_OF_SERVICE">Out of Service</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Route</label>
                                    <select
                                        value={formData.route_id}
                                        onChange={e => setFormData({ ...formData, route_id: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 dark:text-white"
                                    >
                                        <option value="">-- Unassigned --</option>
                                        {routes.map(r => (
                                            <option key={r.id} value={r.id}>{r.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="pt-4">
                                <Button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold">Update Vehicle</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransportVehicleDetail;
