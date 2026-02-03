
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, User, Phone, FileText, Truck, Edit, Trash2, X
} from 'lucide-react';
import Button from '../../components/ui/Button';

const TransportDriverDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [driver, setDriver] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [vehicles, setVehicles] = useState([]);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone_number: '',
        license_number: '',
        status: '',
        vehicle_id: ''
    });

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const [dRes, vRes] = await Promise.all([
                axios.get(`/api/transport/drivers/${id}/`),
                axios.get('/api/transport/vehicles/')
            ]);
            setDriver(dRes.data);
            setVehicles(vRes.data.vehicles);

            const d = dRes.data;
            setFormData({
                first_name: d.first_name,
                last_name: d.last_name,
                phone_number: d.phone,
                license_number: d.license,
                status: d.status,
                vehicle_id: d.vehicle ? d.vehicle.id : ''
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
            await axios.post(`/api/transport/drivers/${id}/`, {
                action: 'UPDATE',
                ...formData
            });
            setShowEditModal(false);
            fetchData();
        } catch (error) {
            alert('Failed to update driver. specific vehicle might already be assigned.');
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this driver?')) return;
        try {
            await axios.post(`/api/transport/drivers/${id}/`, {
                action: 'DELETE'
            });
            navigate('/transport-portal/drivers');
        } catch (error) {
            alert('Failed to delete driver');
        }
    };

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
        </div>
    );

    if (!driver) return <div className="p-8 text-center">Driver not found</div>;

    // Filter vehicles: Show only unassigned ones OR the one currently assigned to this driver
    const availableVehicles = vehicles.filter(v => !v.driver_id || v.driver_id === driver.id);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-12">
            {/* Header */}
            <div className="max-w-4xl mx-auto px-4 pt-6 mb-6">
                <button
                    onClick={() => navigate('/transport-portal/drivers')}
                    className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors mb-4 font-medium"
                >
                    <ArrowLeft size={18} />
                    Back to Drivers
                </button>
            </div>

            <div className="max-w-4xl mx-auto px-4">
                {/* Main Card */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-700">
                    <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>

                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="flex items-center gap-6">
                                <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-full border-4 border-white/10 shadow-lg flex items-center justify-center text-3xl font-bold">
                                    {driver.first_name.charAt(0)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h1 className="text-3xl font-bold">{driver.first_name} {driver.last_name}</h1>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${driver.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                                                'bg-slate-500/20 text-slate-300 border-slate-500/30'
                                            }`}>
                                            {driver.status}
                                        </span>
                                    </div>
                                    <p className="text-indigo-200 text-lg flex items-center gap-2">
                                        <Phone size={18} />
                                        {driver.phone}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowEditModal(true)}
                                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-sm transition-colors text-sm font-bold flex items-center gap-2"
                                >
                                    <Edit size={16} /> Edit Profile
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
                        {/* Vehicle Info */}
                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-3 mb-4">
                                <Truck className="text-indigo-500" />
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Assigned Vehicle</h3>
                            </div>
                            {driver.vehicle ? (
                                <div>
                                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-1 font-mono">{driver.vehicle.plate}</h4>
                                    <p className="text-slate-500 mb-3">{driver.vehicle.model}</p>
                                    <button
                                        onClick={() => navigate(`/transport-portal/vehicles/${driver.vehicle.id}`)}
                                        className="text-sm text-indigo-600 hover:underline font-medium"
                                    >
                                        View Vehicle Details
                                    </button>
                                </div>
                            ) : (
                                <div className="text-slate-500 flex flex-col items-start gap-2">
                                    <p>No vehicle currently assigned.</p>
                                    <button onClick={() => setShowEditModal(true)} className="text-sm text-indigo-600 font-bold">Assign Vehicle</button>
                                </div>
                            )}
                        </div>

                        {/* License Info */}
                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-3 mb-4">
                                <FileText className="text-indigo-500" />
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">License Details</h3>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-bold mb-1">License Number</p>
                                <p className="text-xl font-mono font-bold text-slate-900 dark:text-white select-all">{driver.license}</p>
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
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Edit Driver</h3>
                            <button onClick={() => setShowEditModal(false)}><X size={24} className="text-slate-400" /></button>
                        </div>
                        <form onSubmit={handleUpdate} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">First Name</label>
                                    <input
                                        type="text"
                                        value={formData.first_name}
                                        onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Last Name</label>
                                    <input
                                        type="text"
                                        value={formData.last_name}
                                        onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Phone</label>
                                <input
                                    type="tel"
                                    value={formData.phone_number}
                                    onChange={e => setFormData({ ...formData, phone_number: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">License</label>
                                <input
                                    type="text"
                                    value={formData.license_number}
                                    onChange={e => setFormData({ ...formData, license_number: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 dark:text-white"
                                />
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
                                        <option value="ON_LEAVE">On Leave</option>
                                        <option value="INACTIVE">Inactive</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Vehicle</label>
                                    <select
                                        value={formData.vehicle_id}
                                        onChange={e => setFormData({ ...formData, vehicle_id: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 dark:text-white"
                                    >
                                        <option value="">-- Unassigned --</option>
                                        {availableVehicles.map(v => (
                                            <option key={v.id} value={v.id}>{v.plate_number} ({v.model})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="pt-4">
                                <Button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold">Update Driver</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransportDriverDetail;
