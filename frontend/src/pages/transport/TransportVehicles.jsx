
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    Truck, MapPin, User, Plus, Search, Filter,
    MoreVertical, Settings, AlertCircle, CheckCircle, X
} from 'lucide-react';
import Button from '../../components/ui/Button';

const TransportVehicles = () => {
    const navigate = useNavigate();
    const [vehicles, setVehicles] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        plate_number: '',
        model: '',
        capacity: '',
        status: 'ACTIVE',
        route_id: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [vRes, rRes] = await Promise.all([
                axios.get('/api/transport/vehicles/'),
                axios.get('/api/transport/routes/')
            ]);
            setVehicles(vRes.data.vehicles || []);
            setRoutes(rRes.data.routes || []);
        } catch (error) {
            console.error(error);
            setVehicles([]);
            setRoutes([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/transport/vehicles/', {
                action: 'CREATE',
                ...formData
            });
            setShowModal(false);
            setFormData({ plate_number: '', model: '', capacity: '', status: 'ACTIVE', route_id: '' });
            fetchData();
        } catch (error) {
            alert('Failed to create vehicle');
        }
    };

    const filteredVehicles = (vehicles || []).filter(v =>
        v.plate_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.model?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Fleet Management</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage school transport vehicles and route assignments</p>
                </div>
                <Button
                    onClick={() => setShowModal(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20"
                >
                    <Plus size={20} className="mr-2" />
                    Add Vehicle
                </Button>
            </div>

            {/* Search */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by plate number or model..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                    />
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVehicles.map(vehicle => (
                    <div
                        key={vehicle.id}
                        onClick={() => navigate(`/transport-portal/vehicles/${vehicle.id}`)}
                        className="group relative bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-2xl -mr-8 -mt-8 transition-all group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/20"></div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                                    <Truck size={24} />
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${vehicle.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30' :
                                    vehicle.status === 'MAINTENANCE' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30' :
                                        'bg-slate-100 text-slate-600'
                                    }`}>
                                    {vehicle.status}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 font-mono">{vehicle.plate_number}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{vehicle.model}</p>

                            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                        <MapPin size={16} />
                                        <span>Route</span>
                                    </div>
                                    <span className="font-medium text-slate-900 dark:text-slate-200 truncate max-w-[120px]" title={vehicle.route_name}>
                                        {vehicle.route_name}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                        <User size={16} />
                                        <span>Driver</span>
                                    </div>
                                    <span className="font-medium text-slate-900 dark:text-slate-200">
                                        {vehicle.driver_name}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                        <Truck size={16} />
                                        <span>Capacity</span>
                                    </div>
                                    <span className="font-medium text-slate-900 dark:text-slate-200">
                                        {vehicle.capacity} Seats
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Add New Card */}
                <button
                    onClick={() => setShowModal(true)}
                    className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-slate-800/50 transition-all group min-h-[250px]"
                >
                    <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-full group-hover:scale-110 transition-transform">
                        <Plus size={32} />
                    </div>
                    <span className="font-bold text-lg">Add New Vehicle</span>
                </button>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg shadow-2xl animate-scale-in overflow-hidden">
                        <div className="p-6 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add New Vehicle</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Plate Number</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.plate_number}
                                        onChange={e => setFormData({ ...formData, plate_number: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                                        placeholder="KAA 123B"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Model</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.model}
                                            onChange={e => setFormData({ ...formData, model: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                                            placeholder="Toyota Coaster"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Capacity</label>
                                        <input
                                            type="number"
                                            required
                                            value={formData.capacity}
                                            onChange={e => setFormData({ ...formData, capacity: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Assigned Route</label>
                                    <select
                                        value={formData.route_id}
                                        onChange={e => setFormData({ ...formData, route_id: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                                    >
                                        <option value="">-- Unassigned --</option>
                                        {routes.map(r => (
                                            <option key={r.id} value={r.id}>{r.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="pt-2 flex gap-3">
                                    <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
                                    <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white">Save Vehicle</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransportVehicles;
