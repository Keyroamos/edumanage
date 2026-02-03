
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    User, Phone, FileText, Truck, Plus, Search, X
} from 'lucide-react';
import Button from '../../components/ui/Button';

const TransportDrivers = () => {
    const navigate = useNavigate();
    const [drivers, setDrivers] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone_number: '',
        license_number: '',
        status: 'ACTIVE',
        vehicle_id: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [dRes, vRes] = await Promise.all([
                axios.get('/api/transport/drivers/'),
                axios.get('/api/transport/vehicles/')
            ]);
            setDrivers(dRes.data.drivers || []);
            setVehicles(vRes.data.vehicles || []);
        } catch (error) {
            console.error(error);
            setDrivers([]);
            setVehicles([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/transport/drivers/', {
                action: 'CREATE',
                ...formData
            });
            setShowModal(false);
            setFormData({ first_name: '', last_name: '', phone_number: '', license_number: '', status: 'ACTIVE', vehicle_id: '' });
            fetchData();
        } catch (error) {
            alert('Failed to create driver (Check if vehicle is already assigned or license is duplicate)');
        }
    };

    const filteredDrivers = (drivers || []).filter(d =>
        d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.license?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const availableVehicles = (vehicles || []).filter(v => !v.driver_id);

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
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Driver Management</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage drivers and vehicle assignments</p>
                </div>
                <Button
                    onClick={() => setShowModal(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20"
                >
                    <Plus size={20} className="mr-2" />
                    Add Driver
                </Button>
            </div>

            {/* Search */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name or license..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                    />
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDrivers.map(driver => (
                    <div
                        key={driver.id}
                        onClick={() => navigate(`/transport-portal/drivers/${driver.id}`)}
                        className="group relative bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-2xl -mr-8 -mt-8 transition-all group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/20"></div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 rounded-full">
                                    <User size={24} />
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${driver.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30' :
                                    'bg-slate-100 text-slate-600'
                                    }`}>
                                    {driver.status}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{driver.name}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{driver.phone}</p>

                            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                        <Truck size={16} />
                                        <span>Vehicle</span>
                                    </div>
                                    <span className="font-medium text-slate-900 dark:text-slate-200" title={driver.vehicle_plate}>
                                        {driver.vehicle_plate}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                        <FileText size={16} />
                                        <span>License</span>
                                    </div>
                                    <span className="font-medium text-slate-900 dark:text-slate-200">
                                        {driver.license}
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
                    <span className="font-bold text-lg">Add New Driver</span>
                </button>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg shadow-2xl animate-scale-in overflow-hidden">
                        <div className="p-6 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add New Driver</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">First Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.first_name}
                                            onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Last Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.last_name}
                                            onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        required
                                        value={formData.phone_number}
                                        onChange={e => setFormData({ ...formData, phone_number: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">License Number</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.license_number}
                                        onChange={e => setFormData({ ...formData, license_number: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Assigned Vehicle</label>
                                    <select
                                        value={formData.vehicle_id}
                                        onChange={e => setFormData({ ...formData, vehicle_id: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                                    >
                                        <option value="">-- Unassigned --</option>
                                        {availableVehicles.map(v => (
                                            <option key={v.id} value={v.id}>{v.plate_number} ({v.model})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="pt-2 flex gap-3">
                                    <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
                                    <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white">Save Driver</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransportDrivers;
